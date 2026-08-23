type TaskCommentsWritable = {
  task_id: string;
  author_id: string;
  body: string;
  created_at: string | null;
  updated_at: string | null;
};

export interface TaskCommentsRow extends TaskCommentsWritable {
  id: string;
}

export type TaskCommentsInsert = Omit<TaskCommentsWritable, "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TaskCommentsUpdate = Partial<TaskCommentsWritable>;
