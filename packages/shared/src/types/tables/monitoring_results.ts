import type { ApisRow } from "./apis";

type MonitoringResultsWritable = {
  api_id: ApisRow["id"];
  status: string;
  response_time: number | null;
  http_status: number | null;
  error_message: string | null;
  error_type: string | null;
  checked_at: string;
  created_at: string | null;
};

export interface MonitoringResultsRow extends MonitoringResultsWritable {
  id: string;
}

export type MonitoringResultsInsert =
  Omit<MonitoringResultsWritable, "created_at"> & {
    id?: string;
    created_at?: string | null;
  };

export type MonitoringResultsUpdate = Partial<MonitoringResultsWritable>;
