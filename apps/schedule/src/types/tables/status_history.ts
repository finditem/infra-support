type StatusHistoryWritable = {
  task_id: string;
  status_id: string;
  reason: string | null;
  created_by: string | null;
  created_at: string | null;
};

export interface StatusHistoryRow extends StatusHistoryWritable {
  id: string;
}

export type StatusHistoryInsert = Omit<
  StatusHistoryWritable,
  "reason" | "created_by" | "created_at"
> & {
  id?: string;
  reason?: string | null;
  created_by?: string | null;
  created_at?: string | null;
};

export type StatusHistoryUpdate = Partial<StatusHistoryWritable>;
