"use client";

import { useDroppable } from "@dnd-kit/core";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { TaskStatusesRow, TasksRow } from "@/types/tables";
import { cn } from "@/utils";
import { getStatusColor, sortByPriorityDesc } from "../_lib/kanbanUtils";
import type { ProfileWithColor } from "../_types/kanban";
import KanbanCard from "./KanbanCard";

const DERIVED_STATUS_TITLE = "하위 일정의 상태로 결정되는 일정입니다";

interface KanbanColumnProps {
  status: TaskStatusesRow;
  statuses: TaskStatusesRow[];
  tasks: TasksRow[];
  profileMap: Map<string, ProfileWithColor>;
  subtaskCountByParent: Map<string, number>;
  commentCountByTask: Map<string, number>;
  /** 하위 일정의 상태로 표시 컬럼이 결정되어 드래그할 수 없는 상위 일정의 id 집합. */
  derivedStatusTaskIds: Set<string>;
  /** 드롭 후 서버 저장이 끝나지 않아 잠시 드래그를 막는 카드의 id 집합. */
  pendingTaskIds: Set<string>;
  /** 드래그 중인 카드. 이 컬럼 위에 올라와 있으면 놓일 자리에 점선 자리표시를 그린다. */
  activeTask: TasksRow | null;
  onAddTask: (statusId: string) => void;
  onSelectTask: (task: TasksRow) => void;
}

const KanbanColumn = ({
  status,
  statuses,
  tasks,
  profileMap,
  subtaskCountByParent,
  commentCountByTask,
  derivedStatusTaskIds,
  pendingTaskIds,
  activeTask,
  onAddTask,
  onSelectTask,
}: KanbanColumnProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { isOver, setNodeRef } = useDroppable({ id: status.id });

  // 다른 컬럼에서 끌어온 카드가 올라와 있을 때만, 우선순위 정렬상 실제로 들어갈 위치에 자리표시를 둔다.
  const isDropTarget = isOver && !!activeTask && !tasks.some((task) => task.id === activeTask.id);
  const placeholderIndex = isDropTarget
    ? sortByPriorityDesc([...tasks, activeTask]).findIndex((task) => task.id === activeTask.id)
    : -1;

  const renderCard = (task: TasksRow) => (
    <KanbanCard
      key={task.id}
      assignee={task.assignee_id ? (profileMap.get(task.assignee_id) ?? null) : null}
      commentCount={commentCountByTask.get(task.id) ?? 0}
      dragDisabled={derivedStatusTaskIds.has(task.id) || pendingTaskIds.has(task.id)}
      dragDisabledTitle={derivedStatusTaskIds.has(task.id) ? DERIVED_STATUS_TITLE : undefined}
      reporter={task.reporter_id ? (profileMap.get(task.reporter_id) ?? null) : null}
      statuses={statuses}
      subtaskCount={subtaskCountByParent.get(task.id) ?? 0}
      task={task}
      onSelect={() => onSelectTask(task)}
    />
  );

  // 드래그 중인 카드를 보이지 않게 렌더해 자리표시의 높이를 실제 카드와 맞춘다.
  const placeholder = activeTask && (
    <div
      key="drop-placeholder"
      aria-hidden
      className="rounded-[10px] border-2 border-dashed border-primary bg-fill-neutural-subtle-default"
    >
      <div className="invisible">
        <KanbanCard
          assignee={
            activeTask.assignee_id ? (profileMap.get(activeTask.assignee_id) ?? null) : null
          }
          commentCount={commentCountByTask.get(activeTask.id) ?? 0}
          reporter={
            activeTask.reporter_id ? (profileMap.get(activeTask.reporter_id) ?? null) : null
          }
          statuses={statuses}
          subtaskCount={subtaskCountByParent.get(activeTask.id) ?? 0}
          task={activeTask}
        />
      </div>
    </div>
  );

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
        <div
          ref={setNodeRef}
          className={cn(
            "flex min-h-[120px] flex-col gap-2 rounded-[10px] transition-colors",
            isDropTarget && "bg-fill-neutural-subtle-default"
          )}
        >
          {tasks
            .slice(0, placeholderIndex === -1 ? tasks.length : placeholderIndex)
            .map(renderCard)}
          {placeholderIndex !== -1 && placeholder}
          {placeholderIndex !== -1 && tasks.slice(placeholderIndex).map(renderCard)}
        </div>

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
