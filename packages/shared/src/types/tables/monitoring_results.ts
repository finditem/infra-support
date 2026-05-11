import type { ApisRow } from "./apis";

export interface MonitoringResultsRow {
  id: string;
  api_id: ApisRow["id"];
  status: string;
  response_time: number | null;
  http_status: number | null;
  error_message: string | null;
  error_type: string | null;
  checked_at: string;
  created_at: string | null;
}

export interface MonitoringResultsInsert {
  id?: string;
  api_id: ApisRow["id"];
  status: string;
  response_time?: number | null;
  http_status?: number | null;
  error_message?: string | null;
  error_type?: string | null;
  checked_at: string;
  created_at?: string | null;
}

export interface MonitoringResultsUpdate {
  api_id?: ApisRow["id"];
  status?: string;
  response_time?: number | null;
  http_status?: number | null;
  error_message?: string | null;
  error_type?: string | null;
  checked_at?: string;
  created_at?: string | null;
}
