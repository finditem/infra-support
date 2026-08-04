import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { TaskStatusesRow, TasksRow } from "@/types/tables";
import { cn } from "@/utils";
import { getInitial, isTaskOverdue, PRIORITY_META } from "../_lib/kanbanUtils";
import type { ProfileWithColor } from "../_types/kanban";

interface KanbanCardProps {
  task: TasksRow;
  assignee: ProfileWithColor | null;
  reporter: ProfileWithColor | null;
  subtaskCount: number;
  statuses: TaskStatusesRow[];
  onSelect: () => void;
}

const KanbanCard = ({
  task,
  assignee,
  reporter,
  subtaskCount,
  statuses,
  onSelect,
}: KanbanCardProps) => {
  const priority = PRIORITY_META[task.priority];
  const overdue = isTaskOverdue(task, statuses);

  return (
    <article
      role="button"
      tabIndex={0}
      className={cn(
        "flex cursor-pointer flex-col gap-2 rounded-[10px] border bg-surface-elevated p-3 text-left transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
        priority.cardBorderClassName
      )}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "w-fit rounded-full border px-2 py-[2px] text-[11px] font-semibold",
            priority.badgeClassName
          )}
        >
          {priority.label}
        </span>

        {!task.parent_id && (
          <Link
            className="flex items-center gap-0.5 rounded-md border border-border px-2 py-[2px] text-[11px] font-medium text-text-muted hover:bg-fill-neutural-subtle-hover"
            href={`/task/${task.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            바로가기
            <ExternalLink aria-hidden className="size-3" />
          </Link>
        )}
      </div>

      <h3 className="text-sm font-semibold text-text-default">{task.title}</h3>

      {task.body && <p className="text-xs text-text-muted">{task.body}</p>}

      <div className="flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-3">
          {assignee && (
            <span className="flex items-center gap-1">
              <span
                className="flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ backgroundColor: assignee.color }}
              >
                {getInitial(assignee.name)}
              </span>
              {assignee.name}
            </span>
          )}

          {reporter && (
            <span className="flex items-center gap-1">
              <span
                className="flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ backgroundColor: reporter.color }}
              >
                {getInitial(reporter.name)}
              </span>
              {reporter.name}
            </span>
          )}
        </div>

        {task.due_date && (
          <span className={cn(overdue && "font-bold text-fg-state-error")}>
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
