import { supabase } from "../utils/supabase";
import type { ErrorLogsInsert, MonitoringResultsInsert } from "@infra-support/shared";

export const insertMonitoringResult = async (payload: MonitoringResultsInsert): Promise<void> => {
  const { error } = await supabase.from("monitoring_results").insert(payload);
  if (error) throw new Error(`monitoring_results 저장 실패: ${error.message}`);
};

export const insertErrorLog = async (payload: ErrorLogsInsert): Promise<void> => {
  const { error } = await supabase.from("error_logs").insert(payload);
  if (error) throw new Error(`error_logs 저장 실패: ${error.message}`);
};
