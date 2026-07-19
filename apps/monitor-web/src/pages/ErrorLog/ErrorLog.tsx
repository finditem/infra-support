import { useMemo, useState } from "react";
import { LogHeader, LogSummaryCards, LogList } from "./_components";
import { MOCK_ERROR_LOG_ITEMS } from "@/mock";
import { getLogSummaryData } from "./_utils";
import type { LogListItemData } from "./_types";

const ErrorLog = () => {
  const [items, setItems] = useState<LogListItemData[]>(MOCK_ERROR_LOG_ITEMS);

  const summaryData = useMemo(() => getLogSummaryData(items), [items]);

  const handleCheckedChange = (itemId: number, checked: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: checked } : item))
    );
  };

  const handleRefresh = () => {
    setItems(MOCK_ERROR_LOG_ITEMS);
  };

  return (
    <>
      <LogHeader />
      <LogSummaryCards data={summaryData} onRefresh={handleRefresh} />
      <LogList items={items} onCheckedChange={handleCheckedChange} />
    </>
  );
};

export default ErrorLog;
