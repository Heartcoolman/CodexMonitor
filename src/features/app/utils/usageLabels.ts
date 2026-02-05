import type { RateLimitSnapshot } from "../../../types";
import { formatRelativeTime } from "../../../utils/time";
import type { TFunction } from "i18next";

type UsageLabels = {
  sessionPercent: number | null;
  weeklyPercent: number | null;
  sessionResetLabel: string | null;
  weeklyResetLabel: string | null;
  creditsLabel: string | null;
  showWeekly: boolean;
};

const clampPercent = (value: number) =>
  Math.min(Math.max(Math.round(value), 0), 100);

function formatResetLabel(t: TFunction, resetsAt?: number | null) {
  if (typeof resetsAt !== "number" || !Number.isFinite(resetsAt)) {
    return null;
  }
  const resetMs = resetsAt > 1_000_000_000_000 ? resetsAt : resetsAt * 1000;
  const relative = formatRelativeTime(resetMs).replace(/^in\s+/i, "");
  return t("sidebar.resetsIn", { time: relative });
}

function formatCreditsLabel(t: TFunction, accountRateLimits: RateLimitSnapshot | null) {
  const credits = accountRateLimits?.credits ?? null;
  if (!credits?.hasCredits) {
    return null;
  }
  if (credits.unlimited) {
    return t("sidebar.creditsUnlimited");
  }
  const balance = credits.balance?.trim() ?? "";
  if (!balance) {
    return null;
  }
  const intValue = Number.parseInt(balance, 10);
  if (Number.isFinite(intValue) && intValue > 0) {
    return t("sidebar.creditsCount", { count: intValue });
  }
  const floatValue = Number.parseFloat(balance);
  if (Number.isFinite(floatValue) && floatValue > 0) {
    const rounded = Math.round(floatValue);
    return rounded > 0 ? t("sidebar.creditsCount", { count: rounded }) : null;
  }
  return null;
}

export function getUsageLabels(
  t: TFunction,
  accountRateLimits: RateLimitSnapshot | null,
  showRemaining: boolean,
): UsageLabels {
  const usagePercent = accountRateLimits?.primary?.usedPercent;
  const globalUsagePercent = accountRateLimits?.secondary?.usedPercent;
  const sessionPercent =
    typeof usagePercent === "number"
      ? showRemaining
        ? 100 - clampPercent(usagePercent)
        : clampPercent(usagePercent)
      : null;
  const weeklyPercent =
    typeof globalUsagePercent === "number"
      ? showRemaining
        ? 100 - clampPercent(globalUsagePercent)
        : clampPercent(globalUsagePercent)
      : null;

  return {
    sessionPercent,
    weeklyPercent,
    sessionResetLabel: formatResetLabel(t, accountRateLimits?.primary?.resetsAt),
    weeklyResetLabel: formatResetLabel(t, accountRateLimits?.secondary?.resetsAt),
    creditsLabel: formatCreditsLabel(t, accountRateLimits),
    showWeekly: Boolean(accountRateLimits?.secondary),
  };
}
