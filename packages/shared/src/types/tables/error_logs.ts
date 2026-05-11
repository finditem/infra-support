import type { ApisRow } from "./apis";

export interface ErrorLogsRow {
  id: string;
  api_id: ApisRow["id"];
  status: string;
  error_type: string | null;
  error_message: string | null;
  response_time: number | null;
  http_status: number | null;
  is_checked: boolean | null;
  occurred_at: string;
  created_at: string | null;
}

export interface ErrorLogsInsert {
  id?: string;
  api_id: ApisRow["id"];
  status: string;
  error_type?: string | null;
  error_message?: string | null;
  response_time?: number | null;
  http_status?: number | null;
  is_checked?: boolean | null;
  occurred_at: string;
  created_at?: string | null;
}

export interface ErrorLogsUpdate {
  api_id?: ApisRow["id"];
  status?: string;
  error_type?: string | null;
  error_message?: string | null;
  response_time?: number | null;
  http_status?: number | null;
  is_checked?: boolean | null;
  occurred_at?: string;
  created_at?: string | null;
}
