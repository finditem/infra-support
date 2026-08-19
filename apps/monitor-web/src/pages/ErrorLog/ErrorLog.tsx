import { useMemo, useState } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { BasicButton, ErrorBoundary, ErrorState } from "@/components";
import { useErrorLogListQuery, useUpdateErrorLogCheckedMutation } from "@/queries";
import { LogHeader, LogLoadingState, LogSummaryCards, LogList } from "./_components";
import { getLogSummaryData } from "./_utils";

// 쿼리를 호출하는 컴포넌트는 ErrorBoundary의 자식이어야 에러가 포착되므로, 페이지를 껍데기와 내용으로 나눈다.
const ErrorLog = () => {
  const { reset: resetQueryErrors } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      fallback={(_error, resetBoundary) => (
        <>
          <LogHeader />
          <ErrorState
            icon="errorErrorlog"
            iconSize={60}
            message="에러 로그 조회에 실패했어요."
            messageClassName="typo-header3-bold text-layout-header"
          >
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

  return (
    <>
      <LogHeader />
      <LogSummaryCards data={summaryData} onRefresh={handleRefresh} />
      {isPending || isManualRefreshing ? (
        <LogLoadingState />
      ) : (
        <LogList items={items} onCheckedChange={handleCheckedChange} />
      )}
    </>
  );
};
