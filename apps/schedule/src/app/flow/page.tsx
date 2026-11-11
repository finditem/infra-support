import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/utils";
import { isReportRange, type ReportRange } from "../report/_lib/report";
import { getFlowGraph } from "./_lib/flowGraph";
import FlowGraph from "./_components/FlowGraph";

interface FlowPageProps {
  searchParams: Promise<{ range?: string }>;
}

const RANGE_TABS: { key: ReportRange; label: string }[] = [
  { key: "week", label: "최근 7일" },
  { key: "month", label: "최근 30일" },
  { key: "quarter", label: "최근 90일" },
];

const FlowPage = async ({ searchParams }: FlowPageProps) => {
  const { range: rawRange } = await searchParams;
  const range: ReportRange = rawRange && isReportRange(rawRange) ? rawRange : "month";

  const supabase = await createClient();
  const data = await getFlowGraph(supabase, range);

  return (
    <>
      <header className="border-b border-border bg-surface-elevated px-4 py-5 sm:px-8">
        <h1 className="text-lg font-semibold text-text-default">작업 흐름</h1>
        <p className="mt-1 text-xs text-text-muted">
          상위 일정을 줄기, 하위 일정을 가지로 그립니다. 하위 일정이 생긴 날 갈라져 나왔다가
          완료되면 줄기로 합류하고, 완료되지 못한 가지는 끊긴 끝점으로 남습니다.
        </p>

        <div className="mt-4 flex items-center gap-1 border-b border-border">
          {RANGE_TABS.map((tab) => (
            <Link
              key={tab.key}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-sm",
                range === tab.key
                  ? "border-primary font-semibold text-text-default"
                  : "border-transparent text-text-muted hover:text-text-default"
              )}
              href={`/flow?range=${tab.key}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </header>

      <div className="flex-1 px-4 py-6 sm:px-8">
        <p className="mb-4 rounded-md border border-border bg-surface-elevated px-3 py-2 text-xs text-text-muted">
          가지 위의 상태 전이 점은 상태 변경 기록이 쌓이기 시작한 시점 이후의 전이만 보여줍니다. 그
          전에 완료된 과거 일정은 중간 점 없이 시작과 완료만 표시됩니다.
        </p>

        {data.parents.length === 0 ? (
          <p className="mt-10 text-center text-sm text-text-muted">
            이 기간에 표시할 작업 흐름이 없습니다. 기간을 넓히거나 상위·하위 일정을 만들어 보세요.
          </p>
        ) : (
          <FlowGraph data={data} />
        )}
      </div>
    </>
  );
};

export default FlowPage;
