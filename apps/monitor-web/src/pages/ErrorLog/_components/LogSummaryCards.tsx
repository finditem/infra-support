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

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRefreshClick = () => {
    onRefresh();
    setCooldown(REFRESH_COOLDOWN_SECONDS);
  };

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

      <button
        aria-label="에러 로그 새로고침"
        className={cn(
          "size-[60px] rounded-xl border border-[#DFDFDF] flex-center",
          cooldown > 0 && "text-[#1D1D1D]/40"
        )}
        disabled={cooldown > 0}
        type="button"
        onClick={handleRefreshClick}
      >
        {cooldown > 0 ? (
          <span className="typo-body2-semibold tabular-nums">{cooldown}</span>
        ) : (
          <Icon name="refresh" size={20} />
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
    <div className="flex flex-col gap-2 px-12">
      <dt className="typo-body2-bold">{label}</dt>
      <dd className="text-[26px] font-bold leading-[36px]">{value}</dd>
    </div>
  );
};
