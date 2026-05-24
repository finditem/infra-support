import { IconButton } from "@/components";
import type { LogSummaryData } from "../_types";

interface LogSummaryCardsProps {
  data: LogSummaryData;
  onRefresh: () => void;
}

const LogSummaryCards = ({ data, onRefresh }: LogSummaryCardsProps) => {
  return (
    <section
      aria-label="error-summary-cards"
      className="mt-8 flex items-center rounded-xl border border-[#DFDFDF] bg-white py-6"
    >
      <h2 id="error-summary-cards" className="sr-only">
        에러 로그 요약 카드
      </h2>

      <dl className="flex">
        <SummaryCard label="전체 에러" value={`${data.totalErrors ?? 0}건`} />
        <SummaryCard label="확인 전 에러" value={`${data.unCheckedErrors ?? 0}건`} />
        <SummaryCard label="최근 발생 에러 API" value={data.recentErrorApiName || "-"} />
      </dl>

      <IconButton
        aria-label="에러 로그 새로고침"
        className="size-[60px] rounded-xl border border-[#DFDFDF] flex-center"
        iconName="refresh"
        iconSize={20}
        onClick={onRefresh}
      />
    </section>
  );
};

export default LogSummaryCards;

interface SummaryCardProps {
  label: string;
  value?: string;
}

const SummaryCard = ({ label, value }: SummaryCardProps) => {
  return (
    <div className="flex flex-col gap-2 px-12">
      <dt className="typo-body2-bold">{label}</dt>
      <dd className="text-[26px] font-bold leading-[36px]">{value}</dd>
    </div>
  );
};
