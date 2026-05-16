import { cn } from "@/utils";
import { MOCK_LOGS } from "@/mock";
import type { ApiStatus } from "@/types";

const STATUS_CONFIG: Record<ApiStatus, { label: string; color: string }> = {
  healthy: { label: "정상", color: "bg-fg-primary-normal-default" },
  outage: { label: "장애", color: "bg-[#FF4D4F]" },
  degraded: { label: "지연", color: "bg-[#FAAD14]" },
} as const;

const DetailCheckLogs = () => {
  return (
    <section
      aria-labelledby="logs-title"
      className="flex min-h-0 min-w-0 flex-col gap-10 rounded-xl border border-[#DFDFDF] bg-white px-12 py-8"
    >
      <div className="flex items-center justify-between">
        <h2 id="logs-title" className="text-header1-semibold">
          최근 체크 로그
        </h2>
        <span className="text-body1-medium block text-[#1D1D1D]/40">10분 주기</span>
      </div>

      <div
        aria-label="로그 목록"
        role="region"
        tabIndex={0}
        className="flex flex-col gap-4 overflow-y-auto"
      >
        <ul className="flex flex-col gap-4">
          {MOCK_LOGS.map((log) => (
            <li
              key={log.id}
              className="flex w-full items-center justify-between border-b border-[#F5F5F5] pb-4 last:border-0"
            >
              <div className="flex min-w-[100px] items-center gap-[6px]">
                <div
                  aria-label={STATUS_CONFIG[log.status].label}
                  role="img"
                  className={cn("size-3 rounded-full", STATUS_CONFIG[log.status].color)}
                />
                <time dateTime={`${log.fullDate}T${log.time}`}>{log.time}</time>
              </div>

              <span className="flex-1 truncate px-4 text-left text-[#1D1D1D]" title={log.message}>
                {log.message}
              </span>

              <div className="text-body1-regular flex items-center gap-8 text-[#1D1D1D]/60">
                <span aria-label="상태 코드">{log.statusCode}</span>
                <span aria-label="응답 시간">{log.latency}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default DetailCheckLogs;
