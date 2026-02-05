import type { ReactNode } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Folder from "lucide-react/dist/esm/icons/folder";
import GitBranch from "lucide-react/dist/esm/icons/git-branch";
import ScrollText from "lucide-react/dist/esm/icons/scroll-text";

export type PanelTabId = "git" | "files" | "prompts";

type PanelTab = {
  id: PanelTabId;
  label: string;
  icon: ReactNode;
};

type PanelTabsProps = {
  active: PanelTabId;
  onSelect: (id: PanelTabId) => void;
  tabs?: PanelTab[];
};

export function PanelTabs({ active, onSelect, tabs }: PanelTabsProps) {
  const { t } = useTranslation();

  const defaultTabs: PanelTab[] = useMemo(() => [
    { id: "git", label: t("panelTabs.git"), icon: <GitBranch aria-hidden /> },
    { id: "files", label: t("panelTabs.files"), icon: <Folder aria-hidden /> },
    { id: "prompts", label: t("panelTabs.prompts"), icon: <ScrollText aria-hidden /> },
  ], [t]);

  const tabsToRender = tabs ?? defaultTabs;

  return (
    <div className="panel-tabs" role="tablist" aria-label={t("panelTabs.panel")}>
      {tabsToRender.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`panel-tab${isActive ? " is-active" : ""}`}
            onClick={() => onSelect(tab.id)}
            aria-current={isActive ? "page" : undefined}
            aria-label={tab.label}
            title={tab.label}
          >
            <span className="panel-tab-icon" aria-hidden>
              {tab.icon}
            </span>
          </button>
        );
      })}
    </div>
  );
}
