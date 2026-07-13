import { Icon } from "@/components";
import type { IconName } from "@/components";
import { cn } from "@/utils";

interface SummaryCard {
  id: string;
  icon: IconName;
  iconSize?: number;
  iconBgClassName?: string;
  iconClassName?: string;
  title: string;
  mainValue: string;
  subValues?: string[];
}

const SUMMARY_CARDS: SummaryCard[] = [
  {
    id: "response-time",
    icon: "lightningFilled",
    title: "평균 응답 속도",
    mainValue: "443ms",
    subValues: ["최고 1,230ms", "최저 210ms"],
  },
  {
    id: "supabase-status",
    icon: "activity",
    title: "Supabase 연결/조회 상태",
    mainValue: "정상",
  },
  {
    id: "last-outage",
    icon: "clockBackward",
    iconBgClassName: "bg-fill-state-error",
    iconClassName: "text-fg-state-error",
    title: "마지막 장애 발생",
    mainValue: "2026-04-24 13:20",
  },
  {
    id: "outage-api",
    icon: "sidebarDetail",
    iconSize: 24,
    iconClassName: "text-fill-primary-strong-default",
    title: "장애 발생 API",
    mainValue: "Kakao MAP API",
  },
];

const DashboardSummaryCard = () => {
  return (
    <section className="grid grid-cols-4 gap-3">
      {SUMMARY_CARDS.map((card) => (
        <article
          key={card.id}
          className="rounded-xl border border-border-divider-default bg-bg-layout-1depth px-8 py-8"
        >
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "size-16 rounded-full flex-center",
                card.iconBgClassName ?? "bg-fill-primary-normal-disabled"
              )}
            >
              <Icon className={card.iconClassName} name={card.icon} size={card.iconSize ?? 32} />
            </span>

            <div className="flex flex-col gap-2">
              <p className="typo-body2-medium text-layout-body">{card.title}</p>
              <div className="flex items-baseline gap-3">
                <span className="typo-header4-bold text-layout-header">{card.mainValue}</span>

                {card.subValues && (
                  <div className="flex items-center gap-3">
                    {card.subValues.map((subValue) => (
                      <span key={subValue} className="typo-body2-medium text-layout-body">
                        {subValue}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
};

export default DashboardSummaryCard;
