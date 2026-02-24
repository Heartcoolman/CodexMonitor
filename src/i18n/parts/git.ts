export const dict: Record<string, string> = {
  // === GitDiffPanel.tsx - mode selector ===
  "Diff": "差异",
  "Agent edits": "智能体编辑",
  "Log": "日志",
  "Issues": "议题",
  "PRs": "拉取请求",

  // === GitDiffPanel.tsx - aria / tooltip ===
  "Git panel": "Git 面板",
  "Git panel view": "Git 面板视图",
  "Apply changes to parent workspace": "将更改应用到父工作区",
  "Apply worktree changes": "应用工作树更改",

  // === GitDiffPanel.tsx - context menu ===
  "Copy SHA": "复制 SHA",
  "Open on GitHub": "在 GitHub 上打开",
  "Copy file name": "复制文件名",
  "Copy file path": "复制文件路径",

  // === GitDiffPanel.tsx - discard dialog ===
  "Discard changes": "放弃更改",
  "This cannot be undone.": "此操作无法撤销。",

  // === GitDiffPanel.tsx - context menu (dynamic) ===
  "Unstage file": "取消暂存文件",
  "Stage file": "暂存文件",

  // === GitDiffPanel.tsx - push error ===
  "Remote has new commits. Sync (pull then push) before retrying.": "远程有新提交。请先同步（拉取后推送）再重试。",
  "Syncing...": "同步中...",
  "Sync (pull then push)": "同步（先拉取后推送）",

  // === GitDiffPanel.tsx - log labels ===
  "commit": "次提交",
  "commits": "次提交",
  "No commits": "暂无提交",
  "No upstream configured": "未配置上游",

  // === GitDiffPanel.tsx - file status ===
  "files": "个文件",
  "edits": "处编辑",

  // === GitDiffPanelModeContent.tsx - GitPanelModeStatus ===
  "GitHub issues": "GitHub 议题",
  "GitHub pull requests": "GitHub 拉取请求",
  "open": "个打开",

  // === GitDiffPanelModeContent.tsx - GitBranchRow ===
  "unknown": "未知",
  "Fetching remote...": "正在拉取远程...",
  "Fetch remote": "拉取远程",
  "Fetching remote": "正在拉取远程",

  // === GitDiffPanelModeContent.tsx - GitRootCurrentPath ===
  "Path:": "路径：",
  "Change": "更改",

  // === GitDiffPanelModeContent.tsx - GitPerFileModeContent ===
  "No agent edits in this thread yet.": "此会话中暂无智能体编辑。",
  "edit": "处编辑",

  // === GitDiffPanelModeContent.tsx - GitDiffModeContent ===
  "Git root folder not found.": "未找到 Git 根目录。",
  "This workspace isn't a Git repository yet.": "此工作区尚未初始化为 Git 仓库。",
  "Choose a repo for this workspace.": "为此工作区选择一个仓库。",
  "Initializing...": "正在初始化...",
  "Initialize Git": "初始化 Git",
  "Scan workspace": "扫描工作区",
  "Depth": "深度",
  "Pick folder": "选择文件夹",
  "Use workspace root": "使用工作区根目录",
  "Scanning for repositories...": "正在扫描仓库...",
  "No repositories found.": "未找到仓库。",
  "Active": "已激活",
  "Commit message...": "提交信息...",
  "Generate commit message": "生成提交信息",
  "No changes detected.": "未检测到更改。",

  // === GitDiffPanelModeContent.tsx - push/pull/sync section ===
  "Pulling...": "正在拉取...",
  "Pull": "拉取",
  "Push": "推送",
  "Remote is ahead. Pull first, or use Sync.": "远程领先。请先拉取，或使用同步。",
  "Pull latest changes and push your local commits": "拉取最新更改并推送本地提交",

  // === GitDiffPanelModeContent.tsx - log mode ===
  "Loading commits...": "正在加载提交...",
  "No commits yet.": "暂无提交。",
  "To push": "待推送",
  "To pull": "待拉取",
  "Recent commits": "最近的提交",

  // === GitDiffPanelModeContent.tsx - issues mode ===
  "No open issues.": "暂无打开的议题。",

  // === GitDiffPanelModeContent.tsx - PRs mode ===
  "No open pull requests.": "暂无打开的拉取请求。",
  "Draft": "草稿",

  // === GitDiffPanelShared.tsx - CommitButton ===
  "Enter a commit message": "请输入提交信息",
  "No changes to commit": "没有可提交的更改",
  "Commit staged changes": "提交已暂存的更改",
  "Commit all unstaged changes": "提交所有未暂存的更改",
  "Committing...": "正在提交...",
  "Commit": "提交",

  // === GitDiffPanelShared.tsx - SidebarError ===
  "Dismiss error": "关闭错误",

  // === GitDiffPanelShared.tsx - DiffFileRow ===
  "Stage Changes": "暂存更改",
  "Unstage Changes": "取消暂存更改",
  "Discard Changes": "放弃更改",
  "File actions": "文件操作",

  // === GitDiffPanelShared.tsx - DiffSection ===
  "Staged": "已暂存",
  "Unstaged": "未暂存",
  "Review Uncommitted Changes": "审查未提交的更改",
  "Review uncommitted changes": "审查未提交的更改",
  "Stage All Changes": "暂存所有更改",
  "Stage all changes": "暂存所有更改",
  "Unstage All Changes": "取消暂存所有更改",
  "Unstage all changes": "取消暂存所有更改",
  "Discard All Changes": "放弃所有更改",
  "Discard all changes": "放弃所有更改",

  // === GitDiffPanelShared.tsx - GitLogEntryRow ===
  "No message": "无信息",
  "Unknown": "未知",

  // === GitDiffViewer.tsx - empty state ===
  "No file changes in this pull request": "此拉取请求中没有文件更改",
  "The pull request loaded, but there are no diff hunks to render for this selection.": "拉取请求已加载，但当前选择没有可显示的差异内容。",
  "Try switching to another pull request or commit from the Git panel.": "请尝试从 Git 面板切换到其他拉取请求或提交。",
  "Working tree is clean": "工作树是干净的",
  "No local changes were detected for the current workspace.": "当前工作区未检测到本地更改。",
  "Make an edit, stage a file, or select a commit to inspect changes here.": "编辑文件、暂存文件或选择提交以在此处查看更改。",

  // === GitDiffViewer.tsx - sticky header / actions ===
  "Discard changes in this file": "放弃此文件中的更改",
  "Refreshing diff...": "正在刷新差异...",

  // === GitDiffViewerDiffCard.tsx ===
  "Loading diff...": "正在加载差异...",
  "No non-whitespace changes.": "无非空白字符更改。",
  "Diff unavailable.": "差异不可用。",
  "PR selection actions": "拉取请求选择操作",
  "Clear": "清除",
  "Last review thread:": "上次审查会话：",

  // === GitDiffViewerPullRequestSummary.tsx ===
  "Pull request summary": "拉取请求摘要",
  "Jump to first file": "跳转到第一个文件",
  "Checking out...": "正在检出...",
  "Checkout Branch": "检出分支",
  "No description provided.": "未提供描述。",
  "Activity": "活动",
  "comment": "条评论",
  "comments": "条评论",
  "Show all": "显示全部",
  "Collapse": "收起",
  "Loading comments…": "正在加载评论…",
  "No comments yet.": "暂无评论。",
  "No comment body.": "无评论内容。",

  // === ImageDiffCard.tsx ===
  "Image preview unavailable.": "图片预览不可用。",
  "Previous version": "上一版本",
  "Current version": "当前版本",
  "New image": "新图片",
  "Deleted image": "已删除的图片",

  // === BranchSwitcherPrompt.tsx ===
  "Switch branch": "切换分支",
  "Search branches...": "搜索分支...",
  "No branches found": "未找到分支",
  "current": "当前",
  "worktree": "工作树",

  // === InitGitRepoPrompt.tsx ===
  "Initial branch": "初始分支",
  "main": "main",
  "Create GitHub repository and set up": "创建 GitHub 仓库并设置",
  "GitHub repo": "GitHub 仓库",
  "owner/repo or repo": "所有者/仓库 或 仓库名",
  "Private repo": "私有仓库",
  "Cancel": "取消",
  "Initialize": "初始化",

  // === InitGitRepoPrompt.tsx - dynamic subtitle ===
  "Create a new repository under": "在以下位置创建新仓库：",
  "and make an initial commit.": "并创建初始提交。",

  // === useGitActions.ts - dialogs ===
  "Revert all changes": "还原所有更改",
  "Revert all changes in this repo?": "还原此仓库中的所有更改？",
  "This will discard all staged and unstaged changes, including untracked files.": "这将放弃所有已暂存和未暂存的更改，包括未跟踪的文件。",
  "No active workspace.": "没有活动的工作区。",
  "Workspace changed.": "工作区已更改。",
  "Push failed:": "推送失败：",
  "Failed to set default branch:": "设置默认分支失败：",
  "Remote repo was created, but setup was incomplete.": "远程仓库已创建，但设置未完成。",

  // === useGitActions.ts - init git ===
  "Initialize Git in this folder?": "在此文件夹中初始化 Git？",
  "This will create a .git directory, set the initial branch to": "这将创建 .git 目录，将初始分支设置为",
  "and create an initial commit.": "并创建初始提交。",
  "This folder contains": "此文件夹包含",
  "existing item": "个现有项目",
  "existing items": "个现有项目",
  "Git was initialized, but the initial commit failed.": "Git 已初始化，但初始提交失败。",
  "You may need to set git user.name and user.email, then commit manually.": "你可能需要设置 git user.name 和 user.email，然后手动提交。",

  // === useInitGitRepoPrompt.ts ===
  "Branch name is required.": "分支名称不能为空。",
  "Repository name is required.": "仓库名称不能为空。",
  "Repository name cannot contain spaces.": "仓库名称不能包含空格。",
  "Failed to initialize Git repository.": "初始化 Git 仓库失败。",

  // === branchValidation.ts ===
  "Branch name cannot be '.' or '..'.": "分支名称不能为 '.' 或 '..'。",
  "Branch name cannot contain spaces.": "分支名称不能包含空格。",
  "Branch name cannot start or end with '/'.": "分支名称不能以 '/' 开头或结尾。",
  "Branch name cannot contain '//'.": "分支名称不能包含 '//'。",
  "Branch name cannot end with '.lock'.": "分支名称不能以 '.lock' 结尾。",
  "Branch name cannot contain '..'.": "分支名称不能包含 '..'。",
  "Branch name cannot contain '@{'.": "分支名称不能包含 '@{'。",
  "Branch name contains invalid characters.": "分支名称包含无效字符。",
  "Branch name cannot end with '.'.": "分支名称不能以 '.' 结尾。",

  // === usePullRequestReviewActions.ts ===
  "Review PR": "审查拉取请求",
  "Risk Scan": "风险扫描",
  "Test Plan": "测试计划",
  "Summarize": "总结",
  "PR review failed": "拉取请求审查失败",
  "Failed to start a review thread.": "启动审查会话失败。",

  // === usePullRequestComposer.ts ===
  "Ask PR": "询问拉取请求",

  // === GitDiffPanel.tsx - file menu (dynamic) ===
  "Show in": "在…中显示",
  "Couldn't show file in": "无法在…中显示文件",
  "Select a git root first.": "请先选择一个 Git 根目录。",
  "Discard change": "放弃更改",

  // === Upstream label ===
  "Upstream": "上游",
};
