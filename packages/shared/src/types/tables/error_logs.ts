import type { ApisRow } from "./apis";

type ErrorLogsWritable = {
  api_id: ApisRow["id"];
  status: string;
  error_type: string | null;
  error_message: string | null;
  response_time: number | null;
  http_status: number | null;
  is_checked: boolean | null;
  occurred_at: string;
  created_at: string | null;
};

export interface ErrorLogsRow extends ErrorLogsWritable {
  id: string;
}

export type ErrorLogsInsert =
  Omit<ErrorLogsWritable, "created_at"> & {
    id?: string;
    created_at?: string | null;
  };

export type ErrorLogsUpdate = Partial<ErrorLogsWritable>;
