import { useEffect, useState } from "react";
import { Icon } from "@/components";
import { cn } from "@/utils";
import type { LogSummaryData } from "../_types";

const REFRESH_COOLDOWN_SECONDS = 30;

interface LogSummaryCardsProps {
  data: LogSummaryData;
  onRefresh: () => void;
}

const LogSummaryCards = ({ data, onRefresh }: LogSummaryCardsProps) => {
  const [cooldown, setCooldown] = useState(0);

  const isCoolingDown = cooldown > 0;

  useEffect(() => {
    if (!isCoolingDown) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isCoolingDown]);

  const handleRefreshClick = () => {
    onRefresh();
    setCooldown(REFRESH_COOLDOWN_SECONDS);
  };

  return (
    <section
      aria-label="error-summary-cards"
      className="mt-5 flex items-center rounded-xl border border-[#DFDFDF] bg-white py-4"
    >
      <h2 id="error-summary-cards" className="sr-only">
        에러 로그 요약 카드
      </h2>

      <dl className="flex">
        <SummaryCard label="전체 에러" value={`${data.totalErrors ?? 0}건`} />
        <SummaryCard label="확인 전 에러" value={`${data.unCheckedErrors ?? 0}건`} />
        <SummaryCard label="최근 발생 에러 API" value={data.recentErrorApiName || "-"} />
      </dl>

      <button
        aria-label="에러 로그 새로고침"
        className={cn(
          "ml-auto mr-6 size-11 rounded-xl border border-[#DFDFDF] flex-center",
          cooldown > 0 && "text-[#1D1D1D]/40"
        )}
        disabled={cooldown > 0}
        type="button"
        onClick={handleRefreshClick}
      >
        {cooldown > 0 ? (
          <span className="typo-body2-semibold tabular-nums">{cooldown}</span>
        ) : (
          <Icon name="refresh" size={18} />
        )}
      </button>
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
    <div className="flex flex-col gap-1 px-8">
      <dt className="typo-body2-bold">{label}</dt>
      <dd className="typo-header2-bold">{value}</dd>
    </div>
  );
};
