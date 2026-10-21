import type { TaskStatusesRow, TasksRow } from "@/types/tables";
import { getEffectiveStatusId, isStatusOverdue } from "../_lib/kanbanUtils";
import type { KanbanProgressEntry } from "../_types/kanban";
import KanbanProgress from "./KanbanProgress";

interface WorkspaceOverviewProps {
  projectLabel: string;
  progress: KanbanProgressEntry[];
  statuses: TaskStatusesRow[];
  tasks: TasksRow[];
  /** 하위 일정 묶음. 상위 일정의 표시 상태를 하위 일정에서 산출하는 데 쓴다. */
  childrenByParent: Map<string, TasksRow[]>;
}

// 완료(DB의 "완료" 상태 색과 동일) / 정상 진행 / 지연(기존 overdue 강조색과 동일) — 서로 겹치지 않아 합이 전체와 같다.
const SEGMENT_COLORS = {
  done: "#10B981",
  onTrack: "var(--color-primary)",
  overdue: "var(--color-fg-state-error)",
} as const;

const toPercent = (value: number, total: number) => (total === 0 ? 0 : (value / total) * 100);

const WorkspaceOverview = ({
  projectLabel,
  progress,
  statuses,
  tasks,
  childrenByParent,
}: WorkspaceOverviewProps) => {
  const idByName = (name: string) => statuses.find((status) => status.name === name)?.id;
  const doneStatusId = idByName("완료");
  const delayedStatusId = idByName("지연됨");
  const incompleteStatusId = idByName("미완료");

  // 보드에 실제로 표시되는 상태(하위 일정으로 결정되면 그 상태) 기준으로 집계한다.
  const effectiveStatusIdOf = (task: TasksRow) =>
    getEffectiveStatusId(task, childrenByParent, statuses);

  const done = tasks.filter((task) => effectiveStatusIdOf(task) === doneStatusId).length;

  // 지연으로 묶는 기준: 마감이 지났거나(완료 제외), 상태 자체가 지연됨/미완료인 일정.
  // 마감이 아직 남았어도 지연됨/미완료로 표시된 일정은 정상 진행으로 세지 않는다.
  const isDelayed = (task: TasksRow) => {
    const statusId = effectiveStatusIdOf(task);
    if (statusId === doneStatusId) return false;
    if (statusId === delayedStatusId || statusId === incompleteStatusId) return true;
    return isStatusOverdue(task, statusId, statuses);
  };
  const overdue = tasks.filter(isDelayed).length;
  // done·overdue와 겹치지 않으므로 세 구간의 합이 전체와 같다.
  const onTrack = tasks.length - done - overdue;
  const completion = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);

  // 막대와 범례가 같은 구간 정의를 공유하도록 한곳에서 선언한다.
  const segments = [
    { key: "done", label: "완료", value: done, color: SEGMENT_COLORS.done },
    { key: "onTrack", label: "정상 진행", value: onTrack, color: SEGMENT_COLORS.onTrack },
    { key: "overdue", label: "지연", value: overdue, color: SEGMENT_COLORS.overdue },
  ];

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
            {segments.map((segment) => (
              <div
                key={segment.key}
                className="h-full first:rounded-l-sm last:rounded-r-sm"
                style={{
                  width: `${toPercent(segment.value, tasks.length)}%`,
                  backgroundColor: segment.color,
                }}
                title={`${segment.label} ${segment.value}건`}
              />
            ))}
            {tasks.length === 0 && (
              <div className="h-full w-full rounded-sm bg-fill-neutural-subtle-default" />
            )}
          </div>

          <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
            {segments.map((segment) => (
              <li key={segment.key} className="flex items-center gap-1.5 text-xs text-text-muted">
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                {segment.label}{" "}
                <span className="tabular-nums text-text-default">{segment.value}</span>
              </li>
            ))}
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
