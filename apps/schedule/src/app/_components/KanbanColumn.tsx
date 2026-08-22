"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { TaskStatusesRow, TasksRow } from "@/types/tables";
import { getStatusColor } from "../_lib/kanbanUtils";
import type { ProfileWithColor } from "../_types/kanban";
import KanbanCard from "./KanbanCard";

interface KanbanColumnProps {
  status: TaskStatusesRow;
  statuses: TaskStatusesRow[];
  tasks: TasksRow[];
  profileMap: Map<string, ProfileWithColor>;
  subtaskCountByParent: Map<string, number>;
  onAddTask: (statusId: string) => void;
  onSelectTask: (task: TasksRow) => void;
}

const KanbanColumn = ({
  status,
  statuses,
  tasks,
  profileMap,
  subtaskCountByParent,
  onAddTask,
  onSelectTask,
}: KanbanColumnProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-[260px] shrink-0">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2 rounded-full"
            style={{ backgroundColor: getStatusColor(status, mounted && resolvedTheme === "dark") }}
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
            onSelect={() => onSelectTask(task)}
          />
        ))}

        <button
          className="mt-1 rounded-[10px] border border-dashed border-border py-2 text-xs font-medium text-text-muted hover:border-primary hover:text-primary"
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
