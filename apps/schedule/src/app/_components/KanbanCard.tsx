import { format } from "date-fns";
import type { TaskStatusesRow, TasksRow } from "@/types/tables";
import { getInitial, isTaskOverdue } from "../_lib/kanbanUtils";
import type { ProfileWithColor } from "../_types/kanban";

const PRIORITY_BADGE: Record<TasksRow["priority"], { label: string; className: string }> = {
  high: { label: "높음", className: "border-red-200 bg-red-50 text-red-700" },
  medium: { label: "중간", className: "border-amber-200 bg-amber-50 text-amber-700" },
  low: { label: "낮음", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
};

interface KanbanCardProps {
  task: TasksRow;
  assignee: ProfileWithColor | null;
  reporter: ProfileWithColor | null;
  subtaskCount: number;
  statuses: TaskStatusesRow[];
}

const KanbanCard = ({ task, assignee, reporter, subtaskCount, statuses }: KanbanCardProps) => {
  const priority = PRIORITY_BADGE[task.priority];
  const overdue = isTaskOverdue(task, statuses);

  return (
    <article className="flex flex-col gap-2 rounded-[10px] border border-border bg-surface-elevated p-3 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <span
        className={`w-fit rounded-full border px-2 py-[2px] text-[11px] font-semibold ${priority.className}`}
      >
        {priority.label}
      </span>

      <h3 className="text-sm font-semibold text-text-default">{task.title}</h3>

      {task.body && <p className="text-xs text-text-muted">{task.body}</p>}

      <div className="flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-3">
          {assignee && (
            <span className="flex items-center gap-1">
              <span
                className={`flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white ${assignee.colorClassName}`}
              >
                {getInitial(assignee.name)}
              </span>
              {assignee.name}
            </span>
          )}

          {reporter && (
            <span className="flex items-center gap-1">
              <span
                className={`flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white ${reporter.colorClassName}`}
              >
                {getInitial(reporter.name)}
              </span>
              {reporter.name}
            </span>
          )}
        </div>

        {task.due_date && (
          <span className={overdue ? "font-bold text-fg-state-error" : ""}>
            {format(new Date(task.due_date), "M/d")}
            {overdue && " 초과"}
          </span>
        )}
      </div>

      {subtaskCount > 0 && (
        <p className="border-t border-border pt-2 text-xs text-text-muted">
          하위 일정 {subtaskCount}개
        </p>
      )}
    </article>
  );
};

export default KanbanCard;
