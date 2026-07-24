import type { ProfilesRow, TasksRow } from "@/types/tables";

export type ProfileWithColor = ProfilesRow & { colorClassName: string };

export interface KanbanFilterState {
  assigneeId: string | null;
  reporterId: string | null;
  priority: TasksRow["priority"] | null;
  onlyMine: boolean;
}

export interface KanbanProgressEntry {
  profile: ProfileWithColor;
  total: number;
  done: number;
  percent: number;
}
