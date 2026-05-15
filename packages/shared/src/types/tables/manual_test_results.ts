import type { ApisRow } from "./apis";

type ManualTestResultsWritable = {
  api_id: ApisRow["id"];
  status: string;
  response_time: number | null;
  http_status: number | null;
  error_type: string | null;
  error_message: string | null;
  tested_at: string;
  created_at: string | null;
};

export interface ManualTestResultsRow extends ManualTestResultsWritable {
  id: string;
}

export type ManualTestResultsInsert =
  Omit<ManualTestResultsWritable, "created_at"> & {
    id?: string;
    created_at?: string | null;
  };

export type ManualTestResultsUpdate = Partial<ManualTestResultsWritable>;
