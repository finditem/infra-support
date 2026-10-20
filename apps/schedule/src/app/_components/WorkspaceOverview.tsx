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

const WorkspaceOverview = ({
  projectLabel,
  progress,
  statuses,
  tasks,
  childrenByParent,
}: WorkspaceOverviewProps) => {
  const doneStatusId = statuses.find((status) => status.name === "완료")?.id;
  // 보드에 실제로 표시되는 상태(하위 일정으로 결정되면 그 상태) 기준으로 집계한다.
  const effectiveStatusIdOf = (task: TasksRow) =>
    getEffectiveStatusId(task, childrenByParent, statuses);
  const done = tasks.filter((task) => effectiveStatusIdOf(task) === doneStatusId).length;
  const overdue = tasks.filter((task) =>
    isStatusOverdue(task, effectiveStatusIdOf(task), statuses)
  ).length;
  const active = tasks.length - done;
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

      <div className="grid border-y border-border sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["전체 일정", tasks.length],
          ["진행할 일정", active],
          ["지연 일정", overdue],
          ["완료율", `${completion}%`],
        ].map(([label, value], index) => (
          <div
            key={label}
            className={`px-4 py-3 ${index > 0 ? "border-t border-border sm:border-l sm:border-t-0" : ""} ${index === 2 ? "sm:border-t xl:border-t-0" : ""}`}
          >
            <p className="text-xs text-text-muted">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-text-default">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <h2 className="mb-3 text-xs font-semibold text-text-default">팀원별 완료율</h2>
        <KanbanProgress progress={progress} />
      </div>
    </section>
  );
};

export default WorkspaceOverview;
