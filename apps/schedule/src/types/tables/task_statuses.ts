type TaskStatusesWritable = {
  name: string;
  color: string;
  color_dark: string;
  order_index: number;
  created_at: string | null;
};

export interface TaskStatusesRow extends TaskStatusesWritable {
  id: string;
}

export type TaskStatusesInsert = Omit<TaskStatusesWritable, "created_at"> & {
  id?: string;
  created_at?: string | null;
};

export type TaskStatusesUpdate = Partial<TaskStatusesWritable>;
