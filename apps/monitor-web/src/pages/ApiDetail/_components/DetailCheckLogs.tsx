import { cn } from "@/utils";
import { MOCK_LOGS } from "@/mock";
import type { ApiStatus } from "@/types";
import type { ApiCheckLog } from "../_types";

const STATUS_CONFIG: Record<ApiStatus, { label: string; color: string }> = {
  healthy: { label: "정상", color: "bg-fg-primary-normal-default" },
  outage: { label: "장애", color: "bg-error" },
  degraded: { label: "지연", color: "bg-accent-error" },
} as const;

const LEGEND_ITEMS = [
  { status: "healthy", label: "정상", count: 24, color: "bg-fg-primary-normal-default" },
  { status: "degraded", label: "지연", count: 1, color: "bg-accent-error" },
  { status: "outage", label: "장애", count: 2, color: "bg-error" },
] as const;

const DetailCheckLogs = () => {
  return (
    <section
      aria-labelledby="logs-title"
      className="flex min-h-0 min-w-0 flex-col gap-4 overflow-hidden rounded-xl border border-border-neutural-normal-default bg-white"
    >
      <div className="space-y-4 bg-fill-neutural-subtle-default px-12 pb-6 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 id="logs-title" className="typo-header3-bold">
              최근 체크 로그
            </h2>
            <span className="typo-caption1-bold block rounded-full border border-border-primary-normal-default bg-white px-2 text-fg-primary-normal-default">
              3시간 주기
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="typo-body2-medium text-layout-body">오늘</span>
            <span className="typo-body2-semibold text-layout-header">00:00 - 24:00</span>
          </div>
        </div>

        <hr className="w-full border border-border-neutural-normal-default" />

        <div className="typo-body2-medium flex items-center gap-4">
          {LEGEND_ITEMS.map(({ status, label, count, color }) => (
            <div key={status} className="flex items-center gap-2">
              <div aria-hidden className={cn("size-3 rounded-full", color)} />
              <div className="space-x-1">
                <span className="text-layout-body">{label}</span>
                <span className="text-layout-header">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        aria-label="로그 목록"
        role="region"
        tabIndex={0}
        className="mb-[15px] flex-1 overflow-y-auto px-12"
      >
        <ul className="flex flex-col gap-4">
          {MOCK_LOGS.map((log) => (
            <DetailCheckLogsItem key={log.id} log={log} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default DetailCheckLogs;

interface DetailCheckLogsItemProps {
  log: ApiCheckLog;
}

const DetailCheckLogsItem = ({ log }: DetailCheckLogsItemProps) => {
  const { status, time, fullDate, message, statusCode, latency } = log;
  const statusInfo = STATUS_CONFIG[status];

  return (
    <li className="flex w-full items-center justify-between py-1">
      <div className="flex min-w-[100px] items-center gap-[6px]">
        <div
          aria-label={statusInfo.label}
          role="img"
          className={cn("size-3 rounded-full", statusInfo.color)}
        />
        <time
          className="text-fg-neutural-normal-default typo-body2-medium"
          dateTime={`${fullDate}T${time}`}
        >
          {time}
        </time>
      </div>

      <span
        className="text-fg-neutural-normal-default typo-body2-regular flex-1 truncate px-4 text-left"
        title={message}
      >
        {message}
      </span>

      <div className="text-fg-neutural-light-default typo-body2-medium flex items-center gap-8">
        <span aria-label={`상태 코드: ${statusCode}`}>{statusCode}</span>
        <span aria-label={`응답 시간: ${latency}`}>{latency}</span>
      </div>
    </li>
  );
};
