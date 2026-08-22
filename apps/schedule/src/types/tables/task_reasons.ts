type TaskReasonsWritable = {
  task_id: string | null;
  status_id: string | null;
  reason: string | null;
  created_by: string | null;
  created_at: string | null;
};

export interface TaskReasonsRow extends TaskReasonsWritable {
  id: string;
}

export type TaskReasonsInsert = Partial<TaskReasonsWritable> & {
  id?: string;
};

export type TaskReasonsUpdate = Partial<TaskReasonsWritable>;
