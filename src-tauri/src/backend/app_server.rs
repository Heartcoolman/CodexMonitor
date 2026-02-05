use serde_json::{json, Value};
use std::collections::HashMap;
use std::env;
use std::ffi::OsString;
use std::io::ErrorKind;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::sync::OnceLock;
use std::time::Duration;

use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::{Child, ChildStdin, Command};
use tokio::sync::{mpsc, oneshot, Mutex};
use tokio::time::timeout;

use crate::backend::events::{AppServerEvent, EventSink};
use crate::codex::args::apply_codex_args;
use crate::types::WorkspaceEntry;

fn trim_surrounding_quotes(value: &str) -> &str {
    let trimmed = value.trim();
    if trimmed.len() >= 2 {
        let bytes = trimmed.as_bytes();
        let first = bytes[0];
        let last = bytes[bytes.len() - 1];
        if (first == b'"' && last == b'"') || (first == b'\'' && last == b'\'') {
            return &trimmed[1..trimmed.len() - 1];
        }
    }
    trimmed
}

#[cfg(windows)]
fn looks_like_explicit_path(value: &str) -> bool {
    value.contains('\\') || value.contains('/')
}

#[cfg(not(windows))]
fn looks_like_explicit_path(value: &str) -> bool {
    value.contains('/')
}

fn explicit_command_candidates(raw: &str, cwd_for_resolution: Option<&Path>) -> Vec<PathBuf> {
    let raw_path = PathBuf::from(raw);
    let base = if raw_path.is_absolute() || cwd_for_resolution.is_none() {
        raw_path
    } else {
        cwd_for_resolution
            .expect("cwd_for_resolution is Some")
            .join(raw_path)
    };

    #[cfg(windows)]
    {
        if base.extension().is_some() {
            return vec![base];
        }
        let mut candidates = vec![base.clone()];
        for ext in windows_pathexts() {
            candidates.push(base.with_extension(ext.trim_start_matches('.')));
        }
        candidates
    }

    #[cfg(not(windows))]
    {
        vec![base]
    }
}

fn extract_thread_id(value: &Value) -> Option<String> {
    let params = value.get("params")?;

    params
        .get("threadId")
        .or_else(|| params.get("thread_id"))
        .and_then(|t| t.as_str())
        .map(|s| s.to_string())
        .or_else(|| {
            params
                .get("thread")
                .and_then(|thread| thread.get("id"))
                .and_then(|t| t.as_str())
                .map(|s| s.to_string())
        })
}

pub(crate) struct WorkspaceSession {
    pub(crate) entry: WorkspaceEntry,
    pub(crate) child: Mutex<Child>,
    pub(crate) stdin: Mutex<ChildStdin>,
    pub(crate) pending: Mutex<HashMap<u64, oneshot::Sender<Value>>>,
    pub(crate) next_id: AtomicU64,
    /// Callbacks for background threads - events for these threadIds are sent through the channel
    pub(crate) background_thread_callbacks: Mutex<HashMap<String, mpsc::UnboundedSender<Value>>>,
}

impl WorkspaceSession {
    async fn write_message(&self, value: Value) -> Result<(), String> {
        let mut stdin = self.stdin.lock().await;
        let mut line = serde_json::to_string(&value).map_err(|e| e.to_string())?;
        line.push('\n');
        stdin
            .write_all(line.as_bytes())
            .await
            .map_err(|e| e.to_string())
    }

    pub(crate) async fn send_request(&self, method: &str, params: Value) -> Result<Value, String> {
        let id = self.next_id.fetch_add(1, Ordering::SeqCst);
        let (tx, rx) = oneshot::channel();
        self.pending.lock().await.insert(id, tx);
        self.write_message(json!({ "id": id, "method": method, "params": params }))
            .await?;
        rx.await.map_err(|_| "request canceled".to_string())
    }

    pub(crate) async fn send_notification(
        &self,
        method: &str,
        params: Option<Value>,
    ) -> Result<(), String> {
        let value = if let Some(params) = params {
            json!({ "method": method, "params": params })
        } else {
            json!({ "method": method })
        };
        self.write_message(value).await
    }

    pub(crate) async fn send_response(&self, id: Value, result: Value) -> Result<(), String> {
        self.write_message(json!({ "id": id, "result": result }))
            .await
    }
}

#[cfg(not(windows))]
fn contains_path(existing: &[PathBuf], candidate: &PathBuf) -> bool {
    existing.iter().any(|path| path == candidate)
}

#[cfg(windows)]
fn contains_path(existing: &[PathBuf], candidate: &PathBuf) -> bool {
    let candidate_norm = candidate.to_string_lossy().to_lowercase();
    existing
        .iter()
        .any(|path| path.to_string_lossy().to_lowercase() == candidate_norm)
}

fn push_unique_path(paths: &mut Vec<PathBuf>, candidate: PathBuf) {
    if candidate.as_os_str().is_empty() {
        return;
    }
    if !contains_path(paths, &candidate) {
        paths.push(candidate);
    }
}

pub(crate) fn build_codex_path_env(codex_bin: Option<&str>) -> Option<OsString> {
    let mut paths: Vec<PathBuf> = env::var_os("PATH")
        .map(|value| env::split_paths(&value).collect())
        .unwrap_or_default();

    #[cfg(not(windows))]
    {
        let mut extras: Vec<PathBuf> = vec![
            "/opt/homebrew/bin",
            "/usr/local/bin",
            "/usr/bin",
            "/bin",
            "/usr/sbin",
            "/sbin",
        ]
        .into_iter()
        .map(PathBuf::from)
        .collect();

        if let Some(home) = env::var_os("HOME") {
            let home_path = PathBuf::from(&home);
            extras.push(home_path.join(".local/bin"));
            extras.push(home_path.join(".local/share/mise/shims"));
            extras.push(home_path.join(".cargo/bin"));
            extras.push(home_path.join(".bun/bin"));

            let nvm_root = home_path.join(".nvm/versions/node");
            if let Ok(entries) = std::fs::read_dir(&nvm_root) {
                for entry in entries.flatten() {
                    let bin_path = entry.path().join("bin");
                    if bin_path.is_dir() {
                        extras.push(bin_path);
                    }
                }
            }
        }

        if let Some(bin_path) = codex_bin.filter(|value| !value.trim().is_empty()) {
            if let Some(parent) = Path::new(bin_path).parent() {
                extras.push(parent.to_path_buf());
            }
        }

        for extra in extras {
            push_unique_path(&mut paths, extra);
        }
    }

    #[cfg(windows)]
    {
        let mut extras: Vec<PathBuf> = Vec::new();
        if let Some(appdata) = env::var_os("APPDATA") {
            let appdata_path = PathBuf::from(appdata);
            extras.push(appdata_path.join("npm"));
            extras.push(appdata_path.join("Yarn").join("bin"));
        }
        if let Some(localappdata) = env::var_os("LOCALAPPDATA") {
            let local = PathBuf::from(&localappdata);
            extras.push(local.join("Microsoft").join("WindowsApps"));
            extras.push(local.join("Microsoft").join("WinGet").join("Links"));
            extras.push(local.join("pnpm"));
            extras.push(local.join("Yarn").join("bin"));
            extras.push(local.join("Programs").join("nodejs"));
            extras.push(local.join("Volta").join("bin"));
        }
        if let Some(pnpm_home) = env::var_os("PNPM_HOME") {
            extras.push(PathBuf::from(pnpm_home));
        }
        if let Some(volta_home) = env::var_os("VOLTA_HOME") {
            extras.push(PathBuf::from(volta_home).join("bin"));
        }
        if let Some(choco) = env::var_os("ChocolateyInstall") {
            extras.push(PathBuf::from(choco).join("bin"));
        }
        extras.push(PathBuf::from("C:\\ProgramData\\chocolatey\\bin"));
        if let Some(nvm_symlink) = env::var_os("NVM_SYMLINK") {
            extras.push(PathBuf::from(nvm_symlink));
        }
        if let Some(cargo_home) = env::var_os("CARGO_HOME") {
            extras.push(PathBuf::from(cargo_home).join("bin"));
        }
        if let Some(bun_install) = env::var_os("BUN_INSTALL") {
            extras.push(PathBuf::from(bun_install).join("bin"));
        }

        if let Some(userprofile) = env::var_os("USERPROFILE") {
            let user = PathBuf::from(&userprofile);
            extras.push(user.join(".cargo").join("bin"));
            extras.push(user.join("scoop").join("shims"));
            extras.push(user.join(".bun").join("bin"));
            extras.push(user.join(".local").join("share").join("mise").join("shims"));

            if env::var_os("APPDATA").is_none() {
                extras.push(user.join("AppData").join("Roaming").join("npm"));
                extras.push(user.join("AppData").join("Roaming").join("Yarn").join("bin"));
            }
        }
        if let Some(program_files) = env::var_os("ProgramFiles") {
            extras.push(PathBuf::from(program_files).join("nodejs"));
        }
        if let Some(program_files_x86) = env::var_os("ProgramFiles(x86)") {
            extras.push(PathBuf::from(program_files_x86).join("nodejs"));
        }
        if let Some(program_w6432) = env::var_os("ProgramW6432") {
            extras.push(PathBuf::from(program_w6432).join("nodejs"));
        }
        extras.push(PathBuf::from("C:\\Program Files\\nodejs"));
        extras.push(PathBuf::from("C:\\Program Files (x86)\\nodejs"));

        if let Some(bin_path) = codex_bin.filter(|value| !value.trim().is_empty()) {
            if let Some(parent) = Path::new(bin_path).parent() {
                extras.push(parent.to_path_buf());
            }
        }

        for extra in extras {
            push_unique_path(&mut paths, extra);
        }
    }

    if paths.is_empty() {
        return None;
    }

    env::join_paths(paths).ok()
}

#[cfg(windows)]
fn windows_pathexts() -> Vec<String> {
    let raw = env::var_os("PATHEXT")
        .map(|value| value.to_string_lossy().to_string())
        .unwrap_or_else(|| ".COM;.EXE;.BAT;.CMD".to_string());
    raw.split(';')
        .map(|value| value.trim())
        .filter(|value| !value.is_empty())
        .map(|value| {
            if value.starts_with('.') {
                value.to_string()
            } else {
                format!(".{value}")
            }
        })
        .collect()
}

#[cfg(windows)]
fn resolve_windows_command_path(
    command: &str,
    path_env: Option<&OsString>,
    cwd_for_resolution: Option<&Path>,
) -> Option<PathBuf> {
    let trimmed = command.trim();
    if trimmed.is_empty() {
        return None;
    }

    if trimmed.contains('\\') || trimmed.contains('/') {
        let mut candidate = PathBuf::from(trimmed);
        if candidate.is_relative() {
            if let Some(cwd) = cwd_for_resolution {
                candidate = cwd.join(candidate);
            }
        }
        if candidate.is_file() {
            return Some(candidate);
        }
        if candidate.extension().is_none() {
            for ext in windows_pathexts() {
                let with_ext = candidate.with_extension(ext.trim_start_matches('.'));
                if with_ext.is_file() {
                    return Some(with_ext);
                }
            }
        }
        return None;
    }

    let path_value = path_env.cloned().or_else(|| env::var_os("PATH"))?;
    let dirs = env::split_paths(&path_value);
    if Path::new(trimmed).extension().is_some() {
        for dir in dirs {
            let candidate = dir.join(trimmed);
            if candidate.is_file() {
                return Some(candidate);
            }
        }
        return None;
    }

    let exts = windows_pathexts();
    let dirs = env::split_paths(&path_value);
    for dir in dirs {
        for ext in &exts {
            let candidate = dir.join(format!("{trimmed}{ext}"));
            if candidate.is_file() {
                return Some(candidate);
            }
        }
    }
    None
}

#[cfg(windows)]
#[derive(Debug, Clone, Hash, PartialEq, Eq)]
struct WindowsCommandCacheKey {
    command: String,
    path_env: Option<String>,
    cwd: Option<String>,
}

#[cfg(windows)]
static WINDOWS_COMMAND_PATH_CACHE: OnceLock<
    std::sync::Mutex<HashMap<WindowsCommandCacheKey, PathBuf>>,
> = OnceLock::new();

#[cfg(windows)]
fn resolve_windows_command_path_cached(
    command: &str,
    path_env: Option<&OsString>,
    cwd_for_resolution: Option<&Path>,
) -> Option<PathBuf> {
    let trimmed = command.trim();
    if trimmed.is_empty() {
        return None;
    }

    let cwd_key = if trimmed.contains('\\') || trimmed.contains('/') {
        cwd_for_resolution.map(|cwd| cwd.to_string_lossy().to_string())
    } else {
        None
    };
    let key = WindowsCommandCacheKey {
        command: trimmed.to_string(),
        path_env: path_env.map(|value| value.to_string_lossy().to_string()),
        cwd: cwd_key,
    };

    let cache = WINDOWS_COMMAND_PATH_CACHE.get_or_init(|| std::sync::Mutex::new(HashMap::new()));
    if let Ok(guard) = cache.lock() {
        if let Some(hit) = guard.get(&key) {
            return Some(hit.clone());
        }
    }

    let resolved = resolve_windows_command_path(trimmed, path_env, cwd_for_resolution)?;
    if let Ok(mut guard) = cache.lock() {
        guard.insert(key, resolved.clone());
    }
    Some(resolved)
}

pub(crate) fn build_codex_command_with_bin(
    codex_bin: Option<String>,
    cwd_for_resolution: Option<&Path>,
) -> Command {
    let raw_bin_owned = codex_bin
        .as_deref()
        .map(|value| value.trim())
        .filter(|value| !value.is_empty())
        .unwrap_or("codex")
        .to_string();
    let raw_bin = trim_surrounding_quotes(raw_bin_owned.trim());

    let path_env = build_codex_path_env(
        codex_bin
            .as_deref()
            .map(|value| value.trim())
            .filter(|value| !value.is_empty())
            .map(trim_surrounding_quotes),
    );

    #[cfg(windows)]
    let bin = resolve_windows_command_path_cached(raw_bin, path_env.as_ref(), cwd_for_resolution)
        .map(|path| path.to_string_lossy().to_string())
        .unwrap_or_else(|| raw_bin.to_string());

    #[cfg(not(windows))]
    let bin = raw_bin.to_string();

    let mut command = Command::new(&bin);
    #[cfg(windows)]
    {
        // Prevent spawning a visible console window when launching Codex from a GUI app.
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        command.as_std_mut().creation_flags(CREATE_NO_WINDOW);
    }
    if let Some(path_env) = path_env {
        command.env("PATH", path_env);
    }
    command
}

pub(crate) async fn check_codex_installation(
    codex_bin: Option<String>,
    cwd_for_resolution: Option<&Path>,
) -> Result<Option<String>, String> {
    if let Some(ref bin) = codex_bin {
        let trimmed = trim_surrounding_quotes(bin.trim());
        if !trimmed.is_empty() && looks_like_explicit_path(trimmed) {
            let tried = explicit_command_candidates(trimmed, cwd_for_resolution);
            let found = tried.iter().any(|path| path.is_file());
            if !found {
                let tried_list = tried
                    .iter()
                    .map(|path| format!("`{}`", path.display()))
                    .collect::<Vec<_>>()
                    .join(", ");
                if Path::new(trimmed).is_relative() {
                    if let Some(cwd) = cwd_for_resolution {
                        return Err(format!(
                            "Codex CLI not found at configured path `{trimmed}` (resolved relative to `{}`). Tried: {tried_list}. Update the Codex path setting or clear it to use PATH resolution.",
                            cwd.display(),
                        ));
                    }
                }
                return Err(format!(
                    "Codex CLI not found at configured path `{trimmed}`. Tried: {tried_list}. Update the Codex path setting or clear it to use PATH resolution."
                ));
            }
        }
    }

    let mut command = build_codex_command_with_bin(codex_bin.clone(), cwd_for_resolution);
    if let Some(cwd) = cwd_for_resolution {
        command.current_dir(cwd);
    }
    command.arg("--version");
    command.stdout(std::process::Stdio::piped());
    command.stderr(std::process::Stdio::piped());

    let output = match timeout(Duration::from_secs(5), command.output()).await {
        Ok(result) => result.map_err(|e| {
            if e.kind() == ErrorKind::NotFound {
                if let Some(ref bin) = codex_bin {
                    let trimmed = trim_surrounding_quotes(bin.trim());
                    if !trimmed.is_empty() && looks_like_explicit_path(trimmed) {
                        return format!(
                            "Codex CLI not found at configured path `{trimmed}`. Update the Codex path setting or clear it to use PATH resolution."
                        );
                    }
                }
                #[cfg(windows)]
                {
                    "Codex CLI not found. Install Codex and ensure `codex` is on your PATH (npm installs usually add `%APPDATA%\\npm`)."
                        .to_string()
                }
                #[cfg(not(windows))]
                {
                    "Codex CLI not found. Install Codex and ensure `codex` is on your PATH."
                        .to_string()
                }
            } else {
                e.to_string()
            }
        })?,
        Err(_) => {
            return Err(
                "Timed out while checking Codex CLI. Make sure `codex --version` runs in Terminal."
                    .to_string(),
            );
        }
    };

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        let detail = if stderr.trim().is_empty() {
            stdout.trim()
        } else {
            stderr.trim()
        };
        if detail.is_empty() {
            return Err(
                "Codex CLI failed to start. Try running `codex --version` in Terminal."
                    .to_string(),
            );
        }
        return Err(format!(
            "Codex CLI failed to start: {detail}. Try running `codex --version` in Terminal."
        ));
    }

    let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
    Ok(if version.is_empty() { None } else { Some(version) })
}

pub(crate) async fn spawn_workspace_session<E: EventSink>(
    entry: WorkspaceEntry,
    default_codex_bin: Option<String>,
    codex_args: Option<String>,
    codex_home: Option<PathBuf>,
    client_version: String,
    event_sink: E,
) -> Result<Arc<WorkspaceSession>, String> {
    let codex_bin = entry
        .codex_bin
        .clone()
        .filter(|value| !value.trim().is_empty())
        .or(default_codex_bin);
    let codex_bin_for_check = codex_bin.clone();
    let workspace_dir = Path::new(&entry.path);
    if !workspace_dir.is_dir() {
        return Err(format!(
            "Workspace folder does not exist: `{}`",
            workspace_dir.display()
        ));
    }
    // On non-Windows, check codex installation upfront
    #[cfg(not(windows))]
    {
        let _ = check_codex_installation(codex_bin_for_check.clone(), Some(workspace_dir)).await?;
    }

    let mut command = build_codex_command_with_bin(codex_bin.clone(), Some(workspace_dir));
    apply_codex_args(&mut command, codex_args.as_deref())?;
    command.current_dir(&entry.path);
    command.arg("app-server");
    if let Some(codex_home) = codex_home {
        command.env("CODEX_HOME", codex_home);
    }
    command.stdin(std::process::Stdio::piped());
    command.stdout(std::process::Stdio::piped());
    command.stderr(std::process::Stdio::piped());

    let mut child = match command.spawn() {
        Ok(child) => child,
        Err(err) => {
            if err.kind() == ErrorKind::NotFound && workspace_dir.is_dir() {
                if let Err(error) =
                    check_codex_installation(codex_bin_for_check.clone(), Some(workspace_dir)).await
                {
                    return Err(error);
                }
            }
            return Err(err.to_string());
        }
    };
    let stdin = child.stdin.take().ok_or("missing stdin")?;
    let stdout = child.stdout.take().ok_or("missing stdout")?;
    let stderr = child.stderr.take().ok_or("missing stderr")?;

    let session = Arc::new(WorkspaceSession {
        entry: entry.clone(),
        child: Mutex::new(child),
        stdin: Mutex::new(stdin),
        pending: Mutex::new(HashMap::new()),
        next_id: AtomicU64::new(1),
        background_thread_callbacks: Mutex::new(HashMap::new()),
    });

    let session_clone = Arc::clone(&session);
    let workspace_id = entry.id.clone();
    let event_sink_clone = event_sink.clone();
    tokio::spawn(async move {
        let mut lines = BufReader::new(stdout).lines();
        while let Ok(Some(line)) = lines.next_line().await {
            if line.trim().is_empty() {
                continue;
            }
            let value: Value = match serde_json::from_str(&line) {
                Ok(value) => value,
                Err(err) => {
                    let payload = AppServerEvent {
                        workspace_id: workspace_id.clone(),
                        message: json!({
                            "method": "codex/parseError",
                            "params": { "error": err.to_string(), "raw": line },
                        }),
                    };
                    event_sink_clone.emit_app_server_event(payload);
                    continue;
                }
            };

            let maybe_id = value.get("id").and_then(|id| id.as_u64());
            let has_method = value.get("method").is_some();
            let has_result_or_error = value.get("result").is_some() || value.get("error").is_some();

            // Check if this event is for a background thread
            let thread_id = extract_thread_id(&value);

            if let Some(id) = maybe_id {
                if has_result_or_error {
                    if let Some(tx) = session_clone.pending.lock().await.remove(&id) {
                        let _ = tx.send(value);
                    }
                } else if has_method {
                    // Check for background thread callback
                    let mut sent_to_background = false;
                    if let Some(ref tid) = thread_id {
                        let callbacks = session_clone.background_thread_callbacks.lock().await;
                        if let Some(tx) = callbacks.get(tid) {
                            let _ = tx.send(value.clone());
                            sent_to_background = true;
                        }
                    }
                    // Don't emit to frontend if this is a background thread event
                    if !sent_to_background {
                        let payload = AppServerEvent {
                            workspace_id: workspace_id.clone(),
                            message: value,
                        };
                        event_sink_clone.emit_app_server_event(payload);
                    }
                } else if let Some(tx) = session_clone.pending.lock().await.remove(&id) {
                    let _ = tx.send(value);
                }
            } else if has_method {
                // Check for background thread callback
                let mut sent_to_background = false;
                if let Some(ref tid) = thread_id {
                    let callbacks = session_clone.background_thread_callbacks.lock().await;
                    if let Some(tx) = callbacks.get(tid) {
                        let _ = tx.send(value.clone());
                        sent_to_background = true;
                    }
                }
                // Don't emit to frontend if this is a background thread event
                if !sent_to_background {
                    let payload = AppServerEvent {
                        workspace_id: workspace_id.clone(),
                        message: value,
                    };
                    event_sink_clone.emit_app_server_event(payload);
                }
            }
        }
    });

    let workspace_id = entry.id.clone();
    let event_sink_clone = event_sink.clone();
    tokio::spawn(async move {
        let mut lines = BufReader::new(stderr).lines();
        while let Ok(Some(line)) = lines.next_line().await {
            if line.trim().is_empty() {
                continue;
            }
            let payload = AppServerEvent {
                workspace_id: workspace_id.clone(),
                message: json!({
                    "method": "codex/stderr",
                    "params": { "message": line },
                }),
            };
            event_sink_clone.emit_app_server_event(payload);
        }
    });

    let init_params = json!({
        "clientInfo": {
            "name": "codex_monitor",
            "title": "Codex Monitor",
            "version": client_version
        }
    });
    let init_result = timeout(
        Duration::from_secs(15),
        session.send_request("initialize", init_params),
    )
    .await;
    let init_response = match init_result {
        Ok(response) => response,
        Err(_) => {
            let mut child = session.child.lock().await;
            let _ = child.kill().await;
            return Err(
                "Codex app-server did not respond to initialize. Check that `codex app-server` works in Terminal."
                    .to_string(),
            );
        }
    };
    init_response?;
    session.send_notification("initialized", None).await?;

    let payload = AppServerEvent {
        workspace_id: entry.id.clone(),
        message: json!({
            "method": "codex/connected",
            "params": { "workspaceId": entry.id.clone() }
        }),
    };
    event_sink.emit_app_server_event(payload);

    Ok(session)
}

#[cfg(test)]
mod tests {
    use super::extract_thread_id;
    use serde_json::json;

    #[test]
    fn extract_thread_id_reads_camel_case() {
        let value = json!({ "params": { "threadId": "thread-123" } });
        assert_eq!(extract_thread_id(&value), Some("thread-123".to_string()));
    }

    #[test]
    fn extract_thread_id_reads_snake_case() {
        let value = json!({ "params": { "thread_id": "thread-456" } });
        assert_eq!(extract_thread_id(&value), Some("thread-456".to_string()));
    }

    #[test]
    fn extract_thread_id_returns_none_when_missing() {
        let value = json!({ "params": {} });
        assert_eq!(extract_thread_id(&value), None);
    }
}
