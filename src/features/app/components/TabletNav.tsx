import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import GitBranch from "lucide-react/dist/esm/icons/git-branch";
import MessagesSquare from "lucide-react/dist/esm/icons/messages-square";
import TerminalSquare from "lucide-react/dist/esm/icons/terminal-square";

type TabletNavTab = "codex" | "git" | "log";

type TabletNavProps = {
  activeTab: TabletNavTab;
  onSelect: (tab: TabletNavTab) => void;
};

const tabIcons: Record<TabletNavTab, ReactNode> = {
  codex: <MessagesSquare className="tablet-nav-icon" />,
  git: <GitBranch className="tablet-nav-icon" />,
  log: <TerminalSquare className="tablet-nav-icon" />,
};

export function TabletNav({ activeTab, onSelect }: TabletNavProps) {
  const { t } = useTranslation();

  const tabs: { id: TabletNavTab; labelKey: string }[] = [
    { id: "codex", labelKey: "tabBar.codex" },
    { id: "git", labelKey: "tabBar.git" },
    { id: "log", labelKey: "tabBar.log" },
  ];

  return (
    <nav className="tablet-nav" aria-label={t("tabletNav.workspace")}>
      <div className="tablet-nav-group">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tablet-nav-item ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onSelect(tab.id)}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            {tabIcons[tab.id]}
            <span className="tablet-nav-label">{t(tab.labelKey)}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
