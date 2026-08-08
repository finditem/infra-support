import { useMemo, useState } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { BasicButton, ErrorBoundary, ErrorState, LoadingState } from "@/components";
import { useErrorLogListQuery, useUpdateErrorLogCheckedMutation } from "@/queries";
import { LogHeader, LogSummaryCards, LogList } from "./_components";
import { getLogSummaryData } from "./_utils";

// 쿼리를 호출하는 컴포넌트는 ErrorBoundary의 자식이어야 에러가 포착되므로, 페이지를 껍데기와 내용으로 나눈다.
const ErrorLog = () => {
  const { reset: resetQueryErrors } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      fallback={(_error, resetBoundary) => (
        <>
          <LogHeader />
          <ErrorState icon="clear" message="에러 로그를 불러오지 못했습니다.">
            <BasicButton
              onClick={() => {
                resetQueryErrors();
                resetBoundary();
              }}
            >
              다시 시도
            </BasicButton>
          </ErrorState>
        </>
      )}
    >
      <ErrorLogContent />
    </ErrorBoundary>
  );
};

export default ErrorLog;

const ErrorLogContent = () => {
  const { data, isPending, refetch } = useErrorLogListQuery();
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

  // 조회 실패는 ErrorBoundary로 던져지므로 여기서는 로딩만 처리한다.
  if (isPending) {
    return (
      <>
        <LogHeader />
        <LoadingState message="에러 로그를 불러오는 중입니다." />
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
