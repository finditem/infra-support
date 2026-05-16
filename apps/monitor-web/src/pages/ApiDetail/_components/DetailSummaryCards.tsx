import { ReactNode } from "react";
import type { ApiSummaryData } from "../_types";

interface DetailSummaryCardsProps {
  data: ApiSummaryData;
}

const DetailSummaryCards = ({ data }: DetailSummaryCardsProps) => {
  return (
    <section className="my-8 flex items-center rounded-xl border border-[#DFDFDF] bg-white py-8">
      <dl className="flex w-full">
        <SummaryCard label="평균 응답 속도">
          <div className="flex items-baseline gap-3">
            <div className="flex items-baseline gap-1 text-[#1D1D1D]">
              <span className="text-[32px] font-bold leading-tight">{data.avgResponseTime}</span>
              <span className="text-header1-medium">ms</span>
            </div>
            <div className="text-body1-regular flex gap-3 whitespace-nowrap text-[#1D1D1D]/40">
              <span>최고 {data.maxResponseTime}ms</span>
              <span>최저 {data.minResponseTime}ms</span>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard label="성공률 (24h)" value={`${data.successRate}%`} />

        <SummaryCard label="장애 횟수 (24h)" value={`${data.errorCount}회`} />

        <SummaryCard label="마지막 장애 발생" value={data.lastErrorAt} />
      </dl>
    </section>
  );
};

export default DetailSummaryCards;

interface SummaryCardProps {
  label: string;
  value?: string;
  children?: ReactNode;
}

const SummaryCard = ({ label, value, children }: SummaryCardProps) => (
  <div className="flex flex-col gap-[13px] px-12 py-8">
    <dt className="text-header1-bold text-[#1D1D1D]">{label}</dt>
    <dd className="text-header1-bold text-[#1D1D1D]">{children || <span>{value}</span>}</dd>
  </div>
);
