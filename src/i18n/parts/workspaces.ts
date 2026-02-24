export const dict: Record<string, string> = {
  // ── ClonePrompt ──────────────────────────────────────────────
  "New clone agent": "新建克隆智能体",
  "Copy name": "副本名称",
  "Copies folder": "副本文件夹",
  "Not set": "未设置",
  "Choose…": "选择…",
  "Clear": "清除",
  "Suggested": "建议",
  "Suggested copies folder": "建议的副本文件夹",
  "Copy": "复制",
  "Use suggested": "使用建议",
  "Cancel": "取消",
  "Create": "创建",

  // ── MobileRemoteWorkspacePrompt ──────────────────────────────
  "Add remote workspace paths": "添加远程工作区路径",
  "Add project directories": "添加项目目录",
  "Enter directories on the connected server.": "输入已连接服务器上的目录。",
  "Paths": "路径",
  "One path per line. Comma and semicolon separators also work.":
    "每行一个路径。也支持逗号和分号分隔。",
  "Add": "添加",

  // ── WorkspaceFromUrlPrompt ───────────────────────────────────
  "Add workspace from URL": "从 URL 添加工作区",
  "Remote Git URL": "远程 Git URL",
  "Target folder name (optional)": "目标文件夹名称（可选）",
  "Defaults to repo name": "默认为仓库名称",
  "Destination parent folder": "目标父文件夹",
  "Cloning…": "正在克隆…",
  "Clone and Add": "克隆并添加",

  // ── WorkspaceHome ────────────────────────────────────────────
  "Send": "发送",
  "Loading…": "加载中…",
  "Saving…": "保存中…",
  "Not found": "未找到",
  "Truncated": "已截断",
  "Save": "保存",
  "AGENTS.md": "AGENTS.md",
  "Add workspace instructions for the agent…":
    "为智能体添加工作区指令…",
  "Showing the first part of a large file.":
    "仅显示大文件的前部分内容。",

  // ── WorkspaceHomeGitInitBanner ───────────────────────────────
  "Git setup": "Git 设置",
  "Git is not initialized for this project.":
    "此项目尚未初始化 Git。",
  "Initializing...": "正在初始化...",
  "Initialize Git": "初始化 Git",

  // ── WorkspaceHomeHistory ─────────────────────────────────────
  "Recent runs": "最近的运行",
  "Start a run to see its instances tracked here.":
    "启动一次运行，即可在此处追踪其实例。",
  "Local": "本地",
  "Worktree": "工作树",
  "instance": "个实例",
  "instances": "个实例",
  "Failed": "失败",
  "Partial": "部分完成",
  "No instances were started.": "没有启动任何实例。",
  "Instances are preparing...": "实例准备中...",
  "Recent threads": "最近的会话",
  "Threads from the sidebar will appear here.":
    "侧边栏中的会话将显示在这里。",
  "Agents activity": "智能体活动",
  "thread": "个会话",
  "threads": "个会话",
  "more": "更多",

  // ── WorkspaceHomeRunControls ─────────────────────────────────
  "Select run mode": "选择运行模式",
  "Toggle run mode menu": "切换运行模式菜单",
  "Select models": "选择模型",
  "Toggle models menu": "切换模型菜单",
  "Connect this workspace to load available models.":
    "连接此工作区以加载可用模型。",
  "Collaboration mode": "协作模式",
  "Thinking mode": "思考模式",
  "Default": "默认",

  // ── workspaceHomeHelpers ─────────────────────────────────────
  "Default model": "默认模型",

  // ── workspaceGroups ──────────────────────────────────────────
  "Ungrouped": "未分组",

  // ── useClonePrompt ───────────────────────────────────────────
  "Copy name is required.": "副本名称为必填项。",
  "Copies folder is required.": "副本文件夹为必填项。",

  // ── useWorkspaceCrud ─────────────────────────────────────────
  "Remote Git URL is required.": "远程 Git URL 为必填项。",
  "Destination folder is required.": "目标文件夹为必填项。",

  // ── useWorkspaceGroupOps ─────────────────────────────────────
  "Group name is required.": "分组名称为必填项。",
  "Group name already exists.": "分组名称已存在。",

  // ── useRenameWorktreePrompt ──────────────────────────────────
  "Branch name is required.": "分支名称为必填项。",
  "Worktree renamed.": "工作树已重命名。",
  "Upstream branch updated.": "上游分支已更新。",

  // ── useWorkspaceHome ─────────────────────────────────────────
  "New run": "新运行",
  "Select at least one model to run in a worktree.":
    "请至少选择一个模型以在工作树中运行。",
  "Failed to start a local thread.": "无法启动本地会话。",
  "Failed to create worktree.": "无法创建工作树。",
  "Failed to start a worktree thread.": "无法启动工作树会话。",
  "Failed to start any instances.": "无法启动任何实例。",

  // ── useWorktreeOps ───────────────────────────────────────────

  // ── WorktreePrompt ───────────────────────────────────────────
  "New worktree agent": "新建工作树智能体",
  "Name": "名称",
  "(Optional)": "（可选）",
  "Branch name": "分支名称",
  "No matching branches": "没有匹配的分支",
  "No branches found": "未找到分支",
  "Environment setup script": "环境设置脚本",
  "Stored on the project (Settings → Environments) and runs once in a dedicated terminal after each new worktree is created.":
    "保存在项目中（设置 → 环境），每创建一个新工作树后在专用终端中运行一次。",

  // ── useWorkspaceAgentMd ──────────────────────────────────────
  "Couldn't load AGENTS.md": "无法加载 AGENTS.md",
  "Couldn't save AGENTS.md": "无法保存 AGENTS.md",

  // ── WorktreePrompt checkbox ──────────────────────────────────
  "Copy AGENTS.md into the worktree": "将 AGENTS.md 复制到工作树中",
};
