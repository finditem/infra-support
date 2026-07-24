import { useMemo, useState } from "react";
import { LogHeader, LogSummaryCards, LogList } from "./_components";
import { useErrorLogListQuery, useUpdateErrorLogCheckedMutation } from "@/queries";
import { LoadingState, ErrorState } from "@/components";
import { getLogSummaryData } from "./_utils";

const ErrorLog = () => {
  const { data, isPending, isError, refetch } = useErrorLogListQuery();
  const { mutate: updateChecked } = useUpdateErrorLogCheckedMutation();
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const items = useMemo(() => data ?? [], [data]);
  const summaryData = useMemo(() => getLogSummaryData(items), [items]);

  const handleCheckedChange = (itemId: string, checked: boolean) => {
    updateChecked({ id: itemId, checked });
  };

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  };

  if (isPending) {
    return (
      <>
        <LogHeader />
        <LoadingState message="에러 로그를 불러오는 중입니다." />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <LogHeader />
        <ErrorState message="에러 로그를 불러오지 못했습니다." />
      </>
    );
  }

  return (
    <>
      <LogHeader />
      <LogSummaryCards data={summaryData} onRefresh={handleRefresh} />
      {isManualRefreshing ? (
        <LoadingState message="에러 로그를 새로고침하는 중입니다." />
      ) : (
        <LogList items={items} onCheckedChange={handleCheckedChange} />
      )}
    </>
  );
};

export default ErrorLog;
