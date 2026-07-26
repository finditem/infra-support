type TaskPriority = "high" | "medium" | "low";

type TasksWritable = {
  title: string;
  body: string | null;
  status_id: string;
  assignee_id: string | null;
  reporter_id: string | null;
  priority: TaskPriority;
  due_date: string | null;
  parent_id: string | null;
  week_id: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export interface TasksRow extends TasksWritable {
  id: string;
}

export type TasksInsert = Omit<
  TasksWritable,
  | "body"
  | "assignee_id"
  | "reporter_id"
  | "priority"
  | "due_date"
  | "parent_id"
  | "week_id"
  | "created_by"
  | "created_at"
  | "updated_at"
> & {
  id?: string;
  body?: string | null;
  assignee_id?: string | null;
  reporter_id?: string | null;
  priority?: TaskPriority;
  due_date?: string | null;
  parent_id?: string | null;
  week_id?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TasksUpdate = Partial<TasksWritable>;
