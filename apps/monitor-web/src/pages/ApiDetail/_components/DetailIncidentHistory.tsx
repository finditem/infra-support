import { BasicButton, EmptyState, Icon, LoadingState } from "@/components";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/utils";
import { useIncidentResolution } from "../_hooks";
import type { ApiStatus } from "@/types";
import type { LogListItemData } from "@/pages/ErrorLog/_types";

const STATUS_CONFIG: Record<
  Exclude<ApiStatus, "healthy">,
  { label: string; dotColor: string; textColor: string; bgColor: string }
> = {
  outage: {
    label: "장애",
    dotColor: "bg-error",
    textColor: "text-error",
    bgColor: "bg-fill-state-error",
  },
  degraded: {
    label: "지연",
    dotColor: "bg-accent-error",
    textColor: "text-accent-error",
    bgColor: "bg-fill-state-warning",
  },
} as const;

const INCIDENT_COLUMN_COUNT = 6;

interface DetailIncidentHistoryProps {
  incidents: LogListItemData[];
  isPending: boolean;
}

const DetailIncidentHistory = ({ incidents, isPending }: DetailIncidentHistoryProps) => {
  const navigate = useNavigate();
  const { apiId } = useParams<{ apiId: string }>();
  const { items, handleResolve } = useIncidentResolution(incidents);

  return (
    <section
      aria-labelledby="incident-title"
      className="space-y-3 rounded-xl border border-border-neutural-normal-default bg-white px-6 py-5"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <h2 id="incident-title" className="typo-header4-bold">
            최근 장애 / 에러 상세 목록
          </h2>
          <span className="typo-body2-regular text-layout-body">
            {isPending ? "최근 7일" : `최근 7일 · 총 ${items.length}건`}
          </span>
        </div>

        <div className="min-h-[480px] overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="typo-body2-medium border-b border-border-neutural-normal-default text-fg-neutural-inversed-focused">
                <th className="w-[18%] px-4 py-3">발생 시각</th>
                <th className="w-[10%] px-4 py-3 text-center">상태</th>
                <th className="w-[10%] px-4 py-3">에러 타입</th>
                <th className="w-[42%] px-4 py-3">에러 메시지</th>
                <th className="w-[10%] px-4 py-3">확인 처리</th>
                <th className="w-[10%] px-4 py-3 text-center">자세히 보기</th>
              </tr>
            </thead>
            <tbody>
              {isPending && (
                <tr>
                  <td colSpan={INCIDENT_COLUMN_COUNT}>
                    <LoadingState message="장애/에러 목록을 불러오는 중입니다." />
                  </td>
                </tr>
              )}

              {!isPending && items.length === 0 && (
                <tr>
                  <td colSpan={INCIDENT_COLUMN_COUNT}>
                    <EmptyState
                      icon="check"
                      iconClassName="text-fg-primary-normal-default"
                      message="최근 7일간 발생한 장애나 에러가 없습니다."
                    />
                  </td>
                </tr>
              )}

              {!isPending &&
                items.map((item) => (
                  <DetailIncidentHistoryItem
                    key={item.id}
                    item={item}
                    onNavigate={(errorId) => navigate(`/api/${apiId}/errors/${errorId}`)}
                    onResolve={handleResolve}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center">
        <BasicButton className="min-h-[44px] w-[124px]" as={Link} to="/errors">
          <span className="flex items-center gap-2 text-white">
            <span className="typo-header4-bold">전체보기</span>
            <Icon name="arrowRight" size={18} />
          </span>
        </BasicButton>
      </div>
    </section>
  );
};

export default DetailIncidentHistory;

interface DetailIncidentHistoryItemProps {
  item: LogListItemData;
  onResolve: (id: string) => void;
  onNavigate: (errorId: string) => void;
}

const DetailIncidentHistoryItem = ({
  item,
  onResolve,
  onNavigate,
}: DetailIncidentHistoryItemProps) => {
  const statusKey = item.errorStatus;
  const statusInfo = statusKey !== "healthy" ? STATUS_CONFIG[statusKey] : null;

  return (
    <tr className="typo-body2-medium py-2 pl-4 pr-3 text-layout-header">
      <td className="px-4 py-3 text-layout-body">{item.occurredAt}</td>
      <td className="px-4 py-3 text-center">
        {statusInfo && (
          <span
            className={cn(
              "typo-body2-semibold inline-flex h-[26px] w-[64px] items-center justify-center gap-1.5 rounded-full",
              statusInfo.bgColor,
              statusInfo.textColor
            )}
          >
            <span className={cn("size-2 rounded-full", statusInfo.dotColor)} />
            {statusInfo.label}
          </span>
        )}
      </td>
      <td className="px-4 py-3">{item.errorType}</td>
      <td className="max-w-[320px] truncate px-4 py-3" title={item.errorMessage}>
        {item.errorMessage}
      </td>
      <td className="px-4 py-3">
        <BasicButton
          className="typo-body2-semibold rounded-full bg-[#D6F8E1]"
          disabled={item.status}
          size="small"
          onClick={() => onResolve(item.id)}
        >
          <span className="flex items-center gap-1 text-[#009E53]">
            <Icon name="check" size={14} />
            확인
          </span>
        </BasicButton>
      </td>
      <td className="px-4 py-3 text-center">
        <button
          className="typo-body2-semibold inline-flex h-[36px] w-[88px] items-center justify-center gap-1 rounded-lg border border-border-neutural-normal-default bg-white text-fg-neutural-default transition-colors hover:bg-fill-neutural-subtle-hover"
          onClick={() => onNavigate(item.id)}
        >
          <span>더보기</span>
          <Icon name="arrowRight" size={16} />
        </button>
      </td>
    </tr>
  );
};
