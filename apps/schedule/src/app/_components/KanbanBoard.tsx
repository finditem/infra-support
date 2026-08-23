"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import type { ProfilesRow, TaskCommentsRow, TaskStatusesRow, TasksRow } from "@/types/tables";
import { updateTaskStatus } from "../_lib/actions";
import {
  buildProfileColorMap,
  calculateMemberProgress,
  filterTasks,
  isStatusDerivedFromSubtasks,
  resolveEffectiveStatusId,
  sortByPriorityDesc,
} from "../_lib/kanbanUtils";
import type { MentionTarget } from "../_lib/mentions";
import type { KanbanFilterState } from "../_types/kanban";
import KanbanCard from "./KanbanCard";
import KanbanColumn from "./KanbanColumn";
import KanbanFilters from "./KanbanFilters";
import KanbanProgress from "./KanbanProgress";
import TaskCreateModal from "./TaskCreateModal/TaskCreateModal";

const INITIAL_FILTER: KanbanFilterState = {
  assigneeId: null,
  reporterId: null,
  priority: null,
  onlyMine: false,
};

interface KanbanBoardProps {
  weekId: string | null;
  statuses: TaskStatusesRow[];
  profiles: ProfilesRow[];
  tasks: TasksRow[];
  /** 이 보드가 다루는 일정들의 댓글 전부. 카드의 개수 배지와 편집 모달이 같은 배열을 본다. */
  comments: TaskCommentsRow[];
  /** 댓글에서 언급할 수 있는 팀과 팀원 목록. */
  mentionTargets: MentionTarget[];
  currentProfileId: string | null;
  parentId?: string | null;
  parentTitle?: string | null;
}

const KanbanBoard = ({
  weekId,
  statuses,
  profiles,
  tasks: initialTasks,
  comments: initialComments,
  mentionTargets,
  currentProfileId,
  parentId = null,
  parentTitle = null,
}: KanbanBoardProps) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [comments, setComments] = useState(initialComments);
  const [filter, setFilter] = useState<KanbanFilterState>(INITIAL_FILTER);
  const [creatingStatusId, setCreatingStatusId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TasksRow | null>(null);
  const [activeTask, setActiveTask] = useState<TasksRow | null>(null);

  // 5px 미만의 움직임은 클릭으로 남겨 드래그 직후 상세 모달이 열리는 문제를 막는다.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const profileMap = useMemo(() => buildProfileColorMap(profiles), [profiles]);

  const scopedTasks = useMemo(
    () => tasks.filter((task) => task.parent_id === parentId),
    [tasks, parentId]
  );

  const subtaskCountByParent = useMemo(() => {
    const counts = new Map<string, number>();
    tasks.forEach((task) => {
      if (task.parent_id) counts.set(task.parent_id, (counts.get(task.parent_id) ?? 0) + 1);
    });
    return counts;
  }, [tasks]);

  const commentCountByTask = useMemo(() => {
    const counts = new Map<string, number>();
    comments.forEach((comment) => {
      counts.set(comment.task_id, (counts.get(comment.task_id) ?? 0) + 1);
    });
    return counts;
  }, [comments]);

  const editingTaskComments = useMemo(
    () => (editingTask ? comments.filter((comment) => comment.task_id === editingTask.id) : []),
    [comments, editingTask]
  );

  const childrenByParent = useMemo(() => {
    const map = new Map<string, TasksRow[]>();
    tasks.forEach((task) => {
      if (!task.parent_id) return;
      map.set(task.parent_id, [...(map.get(task.parent_id) ?? []), task]);
    });
    return map;
  }, [tasks]);

  const effectiveStatusId = (task: TasksRow) =>
    resolveEffectiveStatusId(childrenByParent.get(task.id) ?? [], statuses) ?? task.status_id;

  const dragDisabledTaskIds = useMemo(
    () =>
      new Set(
        scopedTasks
          .filter((task) => isStatusDerivedFromSubtasks(task, childrenByParent, statuses))
          .map((task) => task.id)
      ),
    [scopedTasks, childrenByParent, statuses]
  );

  const setTaskStatus = (taskId: string, statusId: string) => {
    setTasks((prev) =>
      prev.map((row) => (row.id === taskId ? { ...row, status_id: statusId } : row))
    );
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveTask(tasks.find((task) => task.id === active.id) ?? null);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveTask(null);

    const task = tasks.find((row) => row.id === active.id);
    if (!task || !over) return;

    const nextStatusId = String(over.id);
    if (effectiveStatusId(task) === nextStatusId) return;

    // 낙관적으로 먼저 옮기고, 서버 저장이 실패하면 이전 상태로 되돌린다.
    const previousStatusId = task.status_id;
    setTaskStatus(task.id, nextStatusId);

    const saved = await updateTaskStatus({ id: task.id, statusId: nextStatusId });

    if (!saved) {
      console.error(`일정 상태 변경에 실패해 이전 상태로 되돌립니다: ${task.id}`);
      setTaskStatus(task.id, previousStatusId);
      return;
    }

    setTasks((prev) => prev.map((row) => (row.id === saved.id ? saved : row)));
  };

  const filteredTasks = useMemo(
    () => filterTasks(scopedTasks, filter, currentProfileId),
    [scopedTasks, filter, currentProfileId]
  );

  const progress = useMemo(
    () => calculateMemberProgress(scopedTasks, Array.from(profileMap.values()), statuses),
    [scopedTasks, profileMap, statuses]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface-elevated px-4 py-6 sm:px-8">
        <KanbanFilters filter={filter} profiles={profiles} onFilterChange={setFilter} />
        <KanbanProgress progress={progress} />
      </div>

      <DndContext
        collisionDetection={closestCorners}
        sensors={sensors}
        onDragCancel={() => setActiveTask(null)}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-4">
            {statuses.map((status) => (
              <KanbanColumn
                key={status.id}
                activeTask={activeTask}
                commentCountByTask={commentCountByTask}
                dragDisabledTaskIds={dragDisabledTaskIds}
                profileMap={profileMap}
                status={status}
                statuses={statuses}
                subtaskCountByParent={subtaskCountByParent}
                tasks={sortByPriorityDesc(
                  filteredTasks.filter((task) => effectiveStatusId(task) === status.id)
                )}
                onAddTask={setCreatingStatusId}
                onSelectTask={setEditingTask}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask && (
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
          )}
        </DragOverlay>
      </DndContext>

      {(creatingStatusId || editingTask) && (
        <TaskCreateModal
          comments={editingTaskComments}
          currentProfileId={currentProfileId}
          initialStatusId={creatingStatusId ?? ""}
          mentionTargets={mentionTargets}
          parentId={parentId}
          parentTitle={parentTitle}
          profiles={Array.from(profileMap.values())}
          statuses={statuses}
          task={editingTask}
          weekId={weekId}
          onClose={() => {
            setCreatingStatusId(null);
            setEditingTask(null);
          }}
          onCommentsChange={(next) => {
            if (!editingTask) return;

            setComments((prev) => [
              ...prev.filter((comment) => comment.task_id !== editingTask.id),
              ...next,
            ]);
          }}
          onDeleted={(deletedIds) => {
            setTasks((prev) => prev.filter((row) => !deletedIds.includes(row.id)));
            setCreatingStatusId(null);
            setEditingTask(null);
          }}
          onSaved={(saved) => {
            setTasks((prev) =>
              saved.reduce(
                (acc, row) =>
                  acc.some((existing) => existing.id === row.id)
                    ? acc.map((existing) => (existing.id === row.id ? row : existing))
                    : [...acc, row],
                prev
              )
            );
            setCreatingStatusId(null);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
