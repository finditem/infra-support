import { useMemo } from "react";
import { LogHeader, LogSummaryCards, LogList } from "./_components";
import { useErrorLogListQuery, useUpdateErrorLogCheckedMutation } from "@/queries";
import { LoadingState, ErrorState } from "@/components";
import { getLogSummaryData } from "./_utils";

const ErrorLog = () => {
  const { data, isPending, isError, refetch } = useErrorLogListQuery();
  const { mutate: updateChecked } = useUpdateErrorLogCheckedMutation();

  const items = useMemo(() => data ?? [], [data]);
  const summaryData = useMemo(() => getLogSummaryData(items), [items]);

  const handleCheckedChange = (itemId: string, checked: boolean) => {
    updateChecked({ id: itemId, checked });
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
      <LogSummaryCards data={summaryData} onRefresh={refetch} />
      <LogList items={items} onCheckedChange={handleCheckedChange} />
    </>
  );
};

export default ErrorLog;
