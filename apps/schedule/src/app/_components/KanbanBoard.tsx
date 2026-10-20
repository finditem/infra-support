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
  getEffectiveStatusId,
  groupTasksByParent,
  isStatusDerivedFromSubtasks,
  sortByPriorityDesc,
} from "../_lib/kanbanUtils";
import type { MentionTarget } from "../_lib/mentions";
import type { KanbanFilterState } from "../_types/kanban";
import KanbanCard from "./KanbanCard";
import KanbanColumn from "./KanbanColumn";
import KanbanFilters from "./KanbanFilters";
import TaskCreateModal from "./TaskCreateModal/TaskCreateModal";
import WorkspaceOverview from "./WorkspaceOverview";
import { getProject, type ProjectKey } from "../_lib/projects";

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
  /** 이 보드가 보여줄 프로젝트. 메인은 라우트의 projectKey, 하위 일정 보드는 상위 일정의 프로젝트를 넘긴다. */
  defaultProjectKey: ProjectKey;
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
  defaultProjectKey,
}: KanbanBoardProps) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [comments, setComments] = useState(initialComments);
  const [filter, setFilter] = useState<KanbanFilterState>(INITIAL_FILTER);
  const [creatingStatusId, setCreatingStatusId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TasksRow | null>(null);
  const [activeTask, setActiveTask] = useState<TasksRow | null>(null);
  // 서버 저장이 끝나지 않은 카드의 id. 같은 카드를 연달아 끌면 응답 순서가 뒤바뀌어
  // 나중 드롭이 이전 응답에 덮이거나 되돌려질 수 있으므로, 저장 중에는 드래그를 막는다.
  const [pendingTaskIds, setPendingTaskIds] = useState<Set<string>>(() => new Set());

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

  const childrenByParent = useMemo(() => groupTasksByParent(tasks), [tasks]);

  const subtaskProgressByParent = useMemo(() => {
    const doneStatusId = statuses.find((status) => status.name === "완료")?.id;
    const progressMap = new Map<string, { done: number; total: number }>();

    childrenByParent.forEach((children, taskId) => {
      progressMap.set(taskId, {
        done: children.filter((child) => child.status_id === doneStatusId).length,
        total: children.length,
      });
    });

    return progressMap;
  }, [childrenByParent, statuses]);

  const effectiveStatusId = (task: TasksRow) =>
    getEffectiveStatusId(task, childrenByParent, statuses);

  const derivedStatusTaskIds = useMemo(
    () =>
      new Set(
        scopedTasks
          .filter((task) => isStatusDerivedFromSubtasks(task, childrenByParent, statuses))
          .map((task) => task.id)
      ),
    [scopedTasks, childrenByParent, statuses]
  );

  const setTaskPending = (taskId: string, pending: boolean) => {
    setPendingTaskIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(taskId);
      else next.delete(taskId);
      return next;
    });
  };

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
    setTaskPending(task.id, true);

    const saved = await updateTaskStatus({
      id: task.id,
      statusId: nextStatusId,
      changedBy: currentProfileId,
    });
    setTaskPending(task.id, false);

    if (!saved) {
      console.error(`일정 상태 변경에 실패해 이전 상태로 되돌립니다: ${task.id}`);
      setTaskStatus(task.id, previousStatusId);
      return;
    }

    setTasks((prev) => prev.map((row) => (row.id === saved.id ? saved : row)));
  };

  // 메인 보드는 라우트가 정한 한 프로젝트만 보여준다. 다만 하위 일정 보드는 상위 일정의 하위 전부를
  // 보여준다 — 하위 일정은 상위 일정 상세에서만 접근할 수 있어, 프로젝트가 다르다고 걸러내면
  // 보드 어디에서도 볼 수 없게 되기 때문이다.
  const projectTasks = useMemo(
    () =>
      parentId ? scopedTasks : scopedTasks.filter((task) => task.project_key === defaultProjectKey),
    [defaultProjectKey, parentId, scopedTasks]
  );

  const filteredTasks = useMemo(
    () => filterTasks(projectTasks, filter, currentProfileId),
    [projectTasks, filter, currentProfileId]
  );

  const progress = useMemo(
    () => calculateMemberProgress(projectTasks, Array.from(profileMap.values()), statuses),
    [projectTasks, profileMap, statuses]
  );

  const projectLabel = parentId
    ? (parentTitle ?? "하위 일정")
    : getProject(defaultProjectKey).label;

  return (
    <div className="-mx-4 -my-6 min-h-[calc(100vh-137px)] bg-surface sm:-mx-8">
      <div className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
        {!parentId && (
          <WorkspaceOverview
            childrenByParent={childrenByParent}
            progress={progress}
            projectLabel={projectLabel}
            statuses={statuses}
            tasks={projectTasks}
          />
        )}

        <div className="flex flex-col gap-4 pt-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold text-text-default">칸반보드</h2>
              <p className="mt-0.5 text-xs text-text-muted">
                {projectLabel}의 일정 {filteredTasks.length}개
              </p>
            </div>
            <KanbanFilters filter={filter} profiles={profiles} onFilterChange={setFilter} />
          </div>

          <DndContext
            id="kanban-board"
            collisionDetection={closestCorners}
            sensors={sensors}
            onDragCancel={() => setActiveTask(null)}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
            <div className="overflow-x-auto pb-2">
              <div className="grid min-w-[980px] grid-cols-6 gap-3">
                {statuses.map((status) => (
                  <KanbanColumn
                    key={status.id}
                    activeTask={activeTask}
                    commentCountByTask={commentCountByTask}
                    derivedStatusTaskIds={derivedStatusTaskIds}
                    pendingTaskIds={pendingTaskIds}
                    profileMap={profileMap}
                    status={status}
                    statuses={statuses}
                    subtaskCountByParent={subtaskCountByParent}
                    subtaskProgressByParent={subtaskProgressByParent}
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
                  subtaskProgress={subtaskProgressByParent.get(activeTask.id)}
                  task={activeTask}
                />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {(creatingStatusId || editingTask) && (
        <TaskCreateModal
          comments={editingTaskComments}
          currentProfileId={currentProfileId}
          initialProjectKey={defaultProjectKey}
          initialStatusId={creatingStatusId ?? ""}
          mentionTargets={mentionTargets}
          parentId={parentId}
          parentTitle={parentTitle}
          profiles={Array.from(profileMap.values())}
          statuses={statuses}
          task={editingTask}
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
            const savedIds = new Set(saved.map((row) => row.id));
            const visibleSaved = parentId ? saved : saved.filter((row) => row.week_id === weekId);

            setTasks((prev) => [...prev.filter((row) => !savedIds.has(row.id)), ...visibleSaved]);
            setCreatingStatusId(null);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
