import { Icon, IconName } from "@/components";
import { cn } from "@/utils";

const SUMMARY_CARD_DATA = [
  { label: "상태", value: "정상", icon: "activity", isStatus: true },
  { label: "마지막 체크 시간", value: "2026-04-24 13:20", icon: "clockBackward" },
  { label: "마지막 응답 속도", value: "443ms", icon: "lightningFilled" },
  { label: "성공률 (24h)", value: "99%", icon: "trendUp" },
] as const;

const DetailSummaryCards = () => {
  return (
    <section className="mb-3 mt-6 grid w-full grid-cols-4 gap-3">
      {SUMMARY_CARD_DATA.map((item) => (
        <SummaryCard key={item.label} {...item} />
      ))}
    </section>
  );
};

export default DetailSummaryCards;

interface SummaryCardProps {
  label: string;
  icon: IconName;
  value: string;
  isStatus?: boolean;
}

const SummaryCard = ({ label, icon, value, isStatus }: SummaryCardProps) => (
  <div className="flex items-center gap-4 rounded-xl border border-border-neutural-normal-default bg-white p-8">
    <div className="size-16 rounded-full bg-fill-primary-normal-disabled flex-center">
      <Icon name={icon} size={32} />
    </div>
    <div className="flex flex-col gap-2">
      <span className="typo-body2-medium text-layout-body">{label}</span>
      <div className="flex items-center gap-[11px]">
        {isStatus && (
          <div aria-hidden className="size-3 rounded-full bg-fg-primary-normal-default" />
        )}
        <span className={cn("typo-header4-bold", isStatus && "text-fg-primary-normal-default")}>
          {value}
        </span>
      </div>
    </div>
  </div>
);
