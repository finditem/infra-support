import { supabase } from "../utils/supabase";

export type MonitoringResultInsert = {
  api_id: string;
  status: "healthy" | "degraded" | "outage";
  response_time: number | null;
  http_status: number | null;
  error_type: string | null;
  error_message: string | null;
  checked_at: string;
};

export type ErrorLogInsert = {
  api_id: string;
  status: "healthy" | "degraded" | "outage";
  error_type: string | null;
  error_message: string | null;
  response_time: number | null;
  http_status: number | null;
  is_checked: boolean;
  occurred_at: string;
};

export const insertMonitoringResult = async (payload: MonitoringResultInsert): Promise<void> => {
  const { error } = await supabase.from("monitoring_results").insert(payload);
  if (error) throw new Error(`monitoring_results 저장 실패: ${error.message}`);
};

export const insertErrorLog = async (payload: ErrorLogInsert): Promise<void> => {
  const { error } = await supabase.from("error_logs").insert(payload);
  if (error) throw new Error(`error_logs 저장 실패: ${error.message}`);
};
