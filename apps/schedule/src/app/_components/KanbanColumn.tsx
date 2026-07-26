import type { TaskStatusesRow, TasksRow } from "@/types/tables";
import type { ProfileWithColor } from "../_types/kanban";
import KanbanCard from "./KanbanCard";

interface KanbanColumnProps {
  status: TaskStatusesRow;
  statuses: TaskStatusesRow[];
  tasks: TasksRow[];
  profileMap: Map<string, ProfileWithColor>;
  subtaskCountByParent: Map<string, number>;
  disabled: boolean;
  onAddTask: (statusId: string) => void;
}

const KanbanColumn = ({
  status,
  statuses,
  tasks,
  profileMap,
  subtaskCountByParent,
  disabled,
  onAddTask,
}: KanbanColumnProps) => {
  return (
    <div className="w-[260px] shrink-0">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <span className="text-sm font-semibold text-text-default">{status.name}</span>
        </div>
        <span className="rounded-full bg-fill-neutural-subtle-default px-2 py-[1px] text-xs font-semibold text-text-muted">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            assignee={task.assignee_id ? (profileMap.get(task.assignee_id) ?? null) : null}
            reporter={task.reporter_id ? (profileMap.get(task.reporter_id) ?? null) : null}
            statuses={statuses}
            subtaskCount={subtaskCountByParent.get(task.id) ?? 0}
            task={task}
          />
        ))}

        <button
          className="mt-1 rounded-[10px] border border-dashed border-border py-2 text-xs font-medium text-text-muted hover:border-primary hover:text-primary disabled:opacity-50"
          disabled={disabled}
          type="button"
          onClick={() => onAddTask(status.id)}
        >
          + 일정 추가
        </button>
      </div>
    </div>
  );
};

export default KanbanColumn;
