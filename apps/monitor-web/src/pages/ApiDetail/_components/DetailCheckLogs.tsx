const DetailCheckLogs = () => {
  return (
    <section className="flex min-h-0 min-w-0 flex-col gap-[60px] rounded-xl border border-[#DFDFDF] bg-white px-12 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-header1-semibold">최근 체크 로그</h2>
        <span className="text-body1-medium block text-[#1D1D1D]/40">10분 주기</span>
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-[6px]">
            <div className="size-3 rounded-full bg-fg-primary-normal-default" />
            <time dateTime="">15:30</time>
          </div>
          <span>에러 메세지</span>
          <span>HTTP 200</span>
          <span>428ms</span>
        </div>
      </div>
    </section>
  );
};

export default DetailCheckLogs;
