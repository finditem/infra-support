import { Icon } from "@/components";
import type { IconName } from "@/components";
import { useApiResponseTimeQuery } from "@/queries";
import { cn, formatDateTime } from "@/utils";
import type { DashboardTimeRangeProps } from "../_types";
import { calculateResponseTimeStats, filterLatest24HourData, findLatestOutage } from "../_utils";

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

type DashboardSummaryCardProps = Pick<DashboardTimeRangeProps, "range">;

const DashboardSummaryCard = ({ range }: DashboardSummaryCardProps) => {
  const { data: responseTimeData, isLoading } = useApiResponseTimeQuery();
  const responseTimeList = responseTimeData ?? [];

  const supabaseStatusLabel = isLoading ? "확인 중" : "정상";

  const data = range === "24h" ? filterLatest24HourData(responseTimeList) : responseTimeList;

  const stats = calculateResponseTimeStats(data);
  const latestOutage = findLatestOutage(data);

  const summaryCards: SummaryCard[] = [
    {
      id: "response-time",
      icon: "lightningFilled",
      title: "평균 응답 속도",
      mainValue: stats ? `${stats.average.toLocaleString()}ms` : "데이터 없음",
      subValues: stats
        ? [`최고 ${stats.max.toLocaleString()}ms`, `최저 ${stats.min.toLocaleString()}ms`]
        : undefined,
    },
    {
      id: "supabase-status",
      icon: "activity",
      title: "Supabase 연결/조회 상태",
      mainValue: supabaseStatusLabel,
    },
    {
      id: "last-outage",
      icon: "clockBackward",
      iconBgClassName: "bg-fill-state-error",
      iconClassName: "text-fg-state-error",
      title: "마지막 장애 발생",
      mainValue: latestOutage ? formatDateTime(latestOutage.checkedAt) : "없음",
    },
    {
      id: "outage-api",
      icon: "sidebarDetail",
      iconSize: 24,
      iconClassName: "text-fill-primary-strong-default",
      title: "장애 발생 API",
      mainValue: latestOutage ? latestOutage.apiName : "없음",
    },
  ];

  return (
    <section className="grid grid-cols-4 gap-3">
      {summaryCards.map((card) => (
        <article
          key={card.id}
          className="rounded-xl border border-border-divider-default bg-bg-layout-1depth px-8 py-8"
        >
          <div className="flex min-w-0 items-center gap-4">
            <span
              className={cn(
                "size-16 shrink-0 rounded-full flex-center",
                card.iconBgClassName ?? "bg-fill-primary-normal-disabled"
              )}
            >
              <Icon className={card.iconClassName} name={card.icon} size={card.iconSize ?? 32} />
            </span>

            <div className="flex min-w-0 flex-col gap-2">
              <p className="typo-body2-medium truncate text-layout-body" title={card.title}>
                {card.title}
              </p>
              <div className="flex min-w-0 items-baseline gap-3">
                <span
                  className="typo-header4-bold truncate text-layout-header"
                  title={card.mainValue}
                >
                  {card.mainValue}
                </span>

                {card.subValues && (
                  <div className="flex min-w-0 shrink-0 items-center gap-3">
                    {card.subValues.map((subValue) => (
                      <span
                        key={subValue}
                        className="typo-body2-medium truncate text-layout-body"
                        title={subValue}
                      >
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
