"use client";

import { useMemo, useState } from "react";
import type { ProfilesRow, TaskStatusesRow, TasksRow } from "@/types/tables";
import { buildProfileColorMap, calculateMemberProgress, filterTasks } from "../_lib/kanbanUtils";
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
  weekId: string;
  statuses: TaskStatusesRow[];
  profiles: ProfilesRow[];
  tasks: TasksRow[];
  currentProfileId: string | null;
}

const KanbanBoard = ({
  weekId,
  statuses,
  profiles,
  tasks: initialTasks,
  currentProfileId,
}: KanbanBoardProps) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<KanbanFilterState>(INITIAL_FILTER);
  const [creatingStatusId, setCreatingStatusId] = useState<string | null>(null);

  const profileMap = useMemo(() => buildProfileColorMap(profiles), [profiles]);

  const topLevelTasks = useMemo(() => tasks.filter((task) => !task.parent_id), [tasks]);

  const subtaskCountByParent = useMemo(() => {
    const counts = new Map<string, number>();
    tasks.forEach((task) => {
      if (task.parent_id) counts.set(task.parent_id, (counts.get(task.parent_id) ?? 0) + 1);
    });
    return counts;
  }, [tasks]);

  const filteredTasks = useMemo(
    () => filterTasks(topLevelTasks, filter, currentProfileId),
    [topLevelTasks, filter, currentProfileId]
  );

  const progress = useMemo(
    () => calculateMemberProgress(topLevelTasks, Array.from(profileMap.values()), statuses),
    [topLevelTasks, profileMap, statuses]
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
              tasks={filteredTasks.filter((task) => task.status_id === status.id)}
              onAddTask={setCreatingStatusId}
            />
          ))}
        </div>
      </div>

      {creatingStatusId && (
        <TaskCreateModal
          currentProfileId={currentProfileId}
          initialStatusId={creatingStatusId}
          profiles={Array.from(profileMap.values())}
          statuses={statuses}
          weekId={weekId}
          onClose={() => setCreatingStatusId(null)}
          onCreated={(created) => {
            setTasks((prev) => [...prev, created]);
            setCreatingStatusId(null);
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
