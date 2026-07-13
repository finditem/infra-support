import type { LogListItemData, LogSummaryData } from "../_types";

export const getLogSummaryData = (items: LogListItemData[]): LogSummaryData => {
  const unCheckedErrors = items.filter((item) => !item.status).length;
  const recentErrorApiName = items.reduce<LogListItemData | undefined>(
    (latest, item) => (!latest || item.occurredAt > latest.occurredAt ? item : latest),
    undefined
  )?.apiName;

  return {
    totalErrors: items.length,
    unCheckedErrors,
    recentErrorApiName: recentErrorApiName ?? "",
  };
};
