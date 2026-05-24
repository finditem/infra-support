import { LogHeader, LogSummaryCards, LogList } from "./_components";

const ErrorLog = () => {
  return (
    <>
      <LogHeader />
      <LogSummaryCards
        data={{ totalErrors: 0, unCheckedErrors: 0, recentErrorApiName: "" }}
        onRefresh={() => {}}
      />
      <LogList data={{ total: 13, unChecked: 7, checked: 6 }} />
    </>
  );
};

export default ErrorLog;
