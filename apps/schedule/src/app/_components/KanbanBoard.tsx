"use client";

import { useMemo, useState } from "react";
import type { ProfilesRow, TaskStatusesRow, TasksRow } from "@/types/tables";
import {
  buildProfileColorMap,
  calculateMemberProgress,
  filterTasks,
  resolveEffectiveStatusId,
  sortByPriorityDesc,
} from "../_lib/kanbanUtils";
import type { KanbanFilterState } from "../_types/kanban";
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
  currentProfileId: string | null;
  parentId?: string | null;
  parentTitle?: string | null;
}

const KanbanBoard = ({
  weekId,
  statuses,
  profiles,
  tasks: initialTasks,
  currentProfileId,
  parentId = null,
  parentTitle = null,
}: KanbanBoardProps) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<KanbanFilterState>(INITIAL_FILTER);
  const [creatingStatusId, setCreatingStatusId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TasksRow | null>(null);

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
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface-elevated px-8 py-6">
        <KanbanFilters filter={filter} profiles={profiles} onFilterChange={setFilter} />
        <KanbanProgress progress={progress} />
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-4">
          {statuses.map((status) => (
            <KanbanColumn
              key={status.id}
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

      {(creatingStatusId || editingTask) && (
        <TaskCreateModal
          currentProfileId={currentProfileId}
          initialStatusId={creatingStatusId ?? ""}
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
