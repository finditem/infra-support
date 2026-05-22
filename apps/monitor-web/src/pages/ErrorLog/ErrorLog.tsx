import { LogHeader, LogSummaryCards } from "./_components";

const ErrorLog = () => {
  return (
    <>
      <LogHeader />
      <LogSummaryCards
        data={{ totalErrors: 0, unCheckedErrors: 0, recentErrorApiName: "" }}
        onRefresh={() => {}}
      />
    </>
  );
};

export default ErrorLog;
