import type { ApisRow } from "./apis";

export interface ManualTestResultsRow {
  id: string;
  api_id: ApisRow["id"];
  status: string;
  response_time: number | null;
  http_status: number | null;
  error_type: string | null;
  error_message: string | null;
  tested_at: string;
  created_at: string | null;
}

export interface ManualTestResultsInsert {
  id?: string;
  api_id: ApisRow["id"];
  status: string;
  response_time?: number | null;
  http_status?: number | null;
  error_type?: string | null;
  error_message?: string | null;
  tested_at: string;
  created_at?: string | null;
}

export interface ManualTestResultsUpdate {
  api_id?: ApisRow["id"];
  status?: string;
  response_time?: number | null;
  http_status?: number | null;
  error_type?: string | null;
  error_message?: string | null;
  tested_at?: string;
  created_at?: string | null;
}
