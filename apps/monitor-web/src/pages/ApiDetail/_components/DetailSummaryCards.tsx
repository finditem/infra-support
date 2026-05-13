const DetailSummaryCards = () => {
  return (
    <section className="my-8 flex items-center rounded-xl border border-[#DFDFDF] bg-white py-8">
      <div className="flex flex-col gap-[13px] px-12 py-8">
        <span className="text-header1-bold text-[#1D1D1D]">평균 응답 속도</span>
        <div className="text-body1-regular flex items-center gap-3 text-[#1D1D1D]/40">
          <div className="flex items-baseline text-[#1D1D1D]">
            <span className="fond-bold text-[32px]">443</span>
            <span className="text-header1-medium">ms</span>
          </div>
          <span>최고1,230ms</span>
          <span>최저 210ms</span>
        </div>
      </div>

      <div className="flex flex-col gap-[13px] px-12 py-8">
        <span className="text-header1-bold text-[#1D1D1D]">성공률 (24h)</span>
        <span className="text-header1-bold text-[#1D1D1D]">99%</span>
      </div>

      <div className="flex flex-col gap-[13px] px-12 py-8">
        <span className="text-header1-bold text-[#1D1D1D]">장애 횟수 (24h)</span>
        <span className="text-header1-bold text-[#1D1D1D]">1회</span>
      </div>

      <div className="flex flex-col gap-[13px] px-12 py-8">
        <span className="text-header1-bold text-[#1D1D1D]">마지막 장애 발생</span>
        <span className="text-header1-bold text-[#1D1D1D]">2026-04-24 13:20</span>
      </div>
    </section>
  );
};

export default DetailSummaryCards;
