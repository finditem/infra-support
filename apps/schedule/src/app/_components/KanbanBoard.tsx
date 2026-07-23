"use client";

import { useMemo, useState, useTransition } from "react";
import type { ProfilesRow, TaskStatusesRow, TasksRow } from "@/types/tables";
import { addQuickTask } from "../_lib/actions";
import { buildProfileColorMap, calculateMemberProgress, filterTasks } from "../_lib/kanbanUtils";
import type { KanbanFilterState } from "../_types/kanban";
import KanbanColumn from "./KanbanColumn";
import KanbanFilters from "./KanbanFilters";
import KanbanProgress from "./KanbanProgress";

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
  const [isPending, startTransition] = useTransition();

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

  const handleAddTask = (statusId: string) => {
    startTransition(async () => {
      const created = await addQuickTask({
        weekId,
        statusId,
        assigneeId: currentProfileId,
        reporterId: currentProfileId,
      });

      if (created) setTasks((prev) => [...prev, created]);
    });
  };

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
              disabled={isPending}
              profileMap={profileMap}
              status={status}
              statuses={statuses}
              subtaskCountByParent={subtaskCountByParent}
              tasks={filteredTasks.filter((task) => task.status_id === status.id)}
              onAddTask={handleAddTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
