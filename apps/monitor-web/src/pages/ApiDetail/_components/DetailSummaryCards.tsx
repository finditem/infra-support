import { Icon, IconName } from "@/components";
import { cn } from "@/utils";
import type { ApiStatus } from "@/types";
import type { ApiSummaryData } from "../_types";

const EMPTY_VALUE = "-";

const STATUS_CONFIG: Record<ApiStatus, { label: string; dotColor: string; textColor: string }> = {
  healthy: {
    label: "정상",
    dotColor: "bg-fg-primary-normal-default",
    textColor: "text-fg-primary-normal-default",
  },
  degraded: { label: "지연", dotColor: "bg-accent-error", textColor: "text-accent-error" },
  outage: { label: "장애", dotColor: "bg-error", textColor: "text-error" },
} as const;

interface DetailSummaryCardsProps {
  summaryData: ApiSummaryData;
}

const DetailSummaryCards = ({ summaryData }: DetailSummaryCardsProps) => {
  const { status, lastCheckedAt, lastResponseTime, successRate } = summaryData;
  const statusInfo = status ? STATUS_CONFIG[status] : null;

  const summaryCards: SummaryCardProps[] = [
    {
      label: "상태",
      value: statusInfo?.label ?? EMPTY_VALUE,
      icon: "activity",
      statusInfo,
    },
    {
      label: "마지막 체크 시간",
      value: lastCheckedAt,
      icon: "clockBackward",
      iconClassName: "text-fill-primary-strong-default",
    },
    { label: "마지막 응답 속도", value: lastResponseTime, icon: "lightningFilled" },
    { label: "성공률 (24h)", value: successRate, icon: "trendUp" },
  ];

  return (
    <section className="mb-3 mt-6 grid w-full grid-cols-4 gap-3">
      {summaryCards.map((item) => (
        <SummaryCard key={item.label} {...item} />
      ))}
    </section>
  );
};

export default DetailSummaryCards;

interface SummaryCardProps {
  label: string;
  icon: IconName;
  iconClassName?: string;
  value: string;
  statusInfo?: { dotColor: string; textColor: string } | null;
}

const SummaryCard = ({ label, icon, iconClassName, value, statusInfo }: SummaryCardProps) => (
  <div className="flex items-center gap-4 rounded-xl border border-border-neutural-normal-default bg-white p-8">
    <div className="size-16 rounded-full bg-fill-primary-normal-disabled flex-center">
      <Icon className={iconClassName} name={icon} size={32} />
    </div>
    <div className="flex flex-col gap-2">
      <span className="typo-body2-medium text-layout-body">{label}</span>
      <div className="flex items-center gap-[11px]">
        {statusInfo && (
          <div aria-hidden className={cn("size-3 rounded-full", statusInfo.dotColor)} />
        )}
        <span className={cn("typo-header4-bold", statusInfo?.textColor)}>{value}</span>
      </div>
    </div>
  </div>
);
