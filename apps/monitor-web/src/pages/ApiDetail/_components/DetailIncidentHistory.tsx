import { useState } from "react";
import { BasicButton, Icon } from "@/components";
import { useNavigate } from "react-router-dom";
import { MOCK_ERROR_LOG_ITEMS } from "@/mock";
import { cn } from "@/utils";
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

const DetailIncidentHistory = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState(MOCK_ERROR_LOG_ITEMS);

  const handleResolve = (id: string) => {
    setIncidents((prev) => prev.map((item) => (item.id === id ? { ...item, status: true } : item)));
  };

  return (
    <section
      aria-labelledby="incident-title"
      className="space-y-4 rounded-xl border border-border-neutural-normal-default bg-white px-12 py-8"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h2 id="incident-title" className="typo-header4-bold">
            최근 장애 / 에러 상세 목록
          </h2>
          <span>최근 7일 · 총 {incidents.length}건</span>
        </div>

        <div className="min-h-[624px] overflow-x-auto">
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
              {incidents.map((item) => (
                <DetailIncidentHistoryItem
                  key={item.id}
                  item={item}
                  onNavigate={() => navigate("/error-log")}
                  onResolve={handleResolve}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center">
        {/* TODO(지권): as prop 패턴 적용 후 변경 예정 */}
        <BasicButton className="min-h-[56px] w-[148px]" onClick={() => navigate("/api-detail")}>
          <span className="flex items-center gap-2 text-white">
            <span className="typo-header4-bold">전체보기</span>
            <Icon name="arrowRight" size={23} />
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
  onNavigate: () => void;
}

const DetailIncidentHistoryItem = ({
  item,
  onResolve,
  onNavigate,
}: DetailIncidentHistoryItemProps) => {
  const statusKey = item.errorStatus;
  const statusInfo = statusKey !== "healthy" ? STATUS_CONFIG[statusKey] : null;

  return (
    <tr className="typo-header4-medium py-[10px] pl-6 pr-4 text-layout-header">
      <td className="px-4 py-3 text-layout-body">{item.occurredAt}</td>
      <td className="px-4 py-3 text-center">
        {statusInfo && (
          <span
            className={cn(
              "text-body2-semibold inline-flex h-[32px] w-[72px] items-center justify-center gap-1.5 rounded-full",
              statusInfo.bgColor,
              statusInfo.textColor
            )}
          >
            <span className={cn("typo-body2-semibold size-3 rounded-full", statusInfo.dotColor)} />
            {statusInfo.label}
          </span>
        )}
      </td>
      <td className="px-4 py-3">{item.errorType}</td>
      <td className="max-w-[400px] truncate px-4 py-3" title={item.errorMessage}>
        {item.errorMessage}
      </td>
      <td className="px-4 py-3">
        <BasicButton
          className="typo-body2-semibold rounded-full bg-[#D6F8E1]"
          size="small"
          onClick={() => onResolve(item.id)}
        >
          <span className="flex items-center gap-[5px] text-[#009E53]">
            <Icon name="check" size={14} />
            확인
          </span>
        </BasicButton>
      </td>
      <td className="px-4 py-3 text-center">
        <button
          className="typo-body2-semibold inline-flex h-[43px] w-[103px] items-center justify-center gap-1 rounded-lg border border-border-neutural-normal-default bg-white text-fg-neutural-default transition-colors hover:bg-fill-neutural-subtle-hover"
          onClick={onNavigate}
        >
          <span>더보기</span>
          <Icon name="arrowRight" size={16} />
        </button>
      </td>
    </tr>
  );
};
