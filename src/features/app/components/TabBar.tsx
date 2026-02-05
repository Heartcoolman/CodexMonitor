import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import FolderKanban from "lucide-react/dist/esm/icons/folder-kanban";
import GitBranch from "lucide-react/dist/esm/icons/git-branch";
import MessagesSquare from "lucide-react/dist/esm/icons/messages-square";
import TerminalSquare from "lucide-react/dist/esm/icons/terminal-square";

type TabKey = "projects" | "codex" | "git" | "log";

type TabBarProps = {
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
};

type TabConfig = { id: TabKey; labelKey: string; icon: ReactNode };

const tabConfigs: TabConfig[] = [
  { id: "projects", labelKey: "tabBar.projects", icon: <FolderKanban className="tabbar-icon" /> },
  { id: "codex", labelKey: "tabBar.codex", icon: <MessagesSquare className="tabbar-icon" /> },
  { id: "git", labelKey: "tabBar.git", icon: <GitBranch className="tabbar-icon" /> },
  { id: "log", labelKey: "tabBar.log", icon: <TerminalSquare className="tabbar-icon" /> },
];

export function TabBar({ activeTab, onSelect }: TabBarProps) {
  const { t } = useTranslation();

  return (
    <nav className="tabbar" aria-label={t("tabBar.primary")}>
      {tabConfigs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tabbar-item ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onSelect(tab.id)}
          aria-current={activeTab === tab.id ? "page" : undefined}
        >
          {tab.icon}
          <span className="tabbar-label">{t(tab.labelKey)}</span>
        </button>
      ))}
    </nav>
  );
}
