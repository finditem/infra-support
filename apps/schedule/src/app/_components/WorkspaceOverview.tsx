import type { TaskStatusesRow, TasksRow } from "@/types/tables";
import { isTaskOverdue } from "../_lib/kanbanUtils";
import type { KanbanProgressEntry } from "../_types/kanban";
import KanbanProgress from "./KanbanProgress";

interface WorkspaceOverviewProps {
  projectLabel: string;
  progress: KanbanProgressEntry[];
  statuses: TaskStatusesRow[];
  tasks: TasksRow[];
}

// 완료(DB의 "완료" 상태 색과 동일) / 정상 진행 / 지연(기존 overdue 강조색과 동일) — 서로 겹치지 않아 합이 전체와 같다.
const SEGMENT_COLORS = {
  done: "#10B981",
  onTrack: "var(--color-primary)",
  overdue: "var(--color-fg-state-error)",
} as const;

const toPercent = (value: number, total: number) => (total === 0 ? 0 : (value / total) * 100);

const WorkspaceOverview = ({ projectLabel, progress, statuses, tasks }: WorkspaceOverviewProps) => {
  const doneStatusId = statuses.find((status) => status.name === "완료")?.id;
  const done = tasks.filter((task) => task.status_id === doneStatusId).length;
  const overdue = tasks.filter((task) => isTaskOverdue(task, statuses)).length;
  // isTaskOverdue가 이미 완료 상태를 제외하고 판정하므로, onTrack(정상 진행)은 overdue와 겹치지 않는다.
  const onTrack = tasks.length - done - overdue;
  const completion = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);

  return (
    <section aria-labelledby="workspace-overview-title" className="border-b border-border pb-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-primary">이번 주 업무</p>
          <h1 id="workspace-overview-title" className="mt-1 text-2xl font-bold text-text-default">
            {projectLabel}
          </h1>
        </div>
        <p className="hidden max-w-md text-right text-xs leading-5 text-text-muted sm:block">
          일정 수와 팀원별 완료 현황을 실제 등록된 작업 기준으로 보여줍니다.
        </p>
      </div>

      <div className="grid gap-x-8 gap-y-5 border-y border-border py-4 sm:grid-cols-2">
        <div className="px-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs text-text-muted">전체 일정</p>
            <p className="text-xl font-semibold tabular-nums text-text-default">{tasks.length}</p>
          </div>

          <div aria-hidden className="mt-2 flex h-2 gap-[2px] rounded-sm border border-border p-px">
            <div
              className="h-full first:rounded-l-sm last:rounded-r-sm"
              style={{
                width: `${toPercent(done, tasks.length)}%`,
                backgroundColor: SEGMENT_COLORS.done,
              }}
              title={`완료 ${done}건`}
            />
            <div
              className="h-full first:rounded-l-sm last:rounded-r-sm"
              style={{
                width: `${toPercent(onTrack, tasks.length)}%`,
                backgroundColor: SEGMENT_COLORS.onTrack,
              }}
              title={`정상 진행 ${onTrack}건`}
            />
            <div
              className="h-full first:rounded-l-sm last:rounded-r-sm"
              style={{
                width: `${toPercent(overdue, tasks.length)}%`,
                backgroundColor: SEGMENT_COLORS.overdue,
              }}
              title={`지연 ${overdue}건`}
            />
            {tasks.length === 0 && (
              <div className="h-full w-full rounded-sm bg-fill-neutural-subtle-default" />
            )}
          </div>

          <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
            <li className="flex items-center gap-1.5 text-xs text-text-muted">
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ backgroundColor: SEGMENT_COLORS.done }}
              />
              완료 <span className="tabular-nums text-text-default">{done}</span>
            </li>
            <li className="flex items-center gap-1.5 text-xs text-text-muted">
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ backgroundColor: SEGMENT_COLORS.onTrack }}
              />
              정상 진행 <span className="tabular-nums text-text-default">{onTrack}</span>
            </li>
            <li className="flex items-center gap-1.5 text-xs text-text-muted">
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ backgroundColor: SEGMENT_COLORS.overdue }}
              />
              지연 <span className="tabular-nums text-text-default">{overdue}</span>
            </li>
          </ul>
        </div>

        <div className="border-t border-border px-4 pt-5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs text-text-muted">완료율</p>
            <p className="text-xl font-semibold tabular-nums text-text-default">{completion}%</p>
          </div>
          <div
            aria-hidden
            className="mt-2 h-[6px] overflow-hidden rounded-full border border-border bg-fill-neutural-subtle-default"
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h2 className="mb-3 text-xs font-semibold text-text-default">팀원별 완료율</h2>
        <KanbanProgress progress={progress} />
      </div>
    </section>
  );
};

export default WorkspaceOverview;
