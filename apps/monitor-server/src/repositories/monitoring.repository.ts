import { createSupabaseClient } from "@/lib/supabase";
import type { ErrorLogsInsert, MonitoringResultsInsert } from "@infra-support/shared";

/**
 * 모니터링 결과를 저장하는 함수입니다.
 *
 * @param payload - monitoring_results 테이블 insert payload
 *
 * @author junyeol
 */

export const insertMonitoringResult = async (payload: MonitoringResultsInsert): Promise<void> => {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("monitoring_results").insert(payload);
  if (error) throw new Error(`monitoring_results 저장 실패: ${error.message}`);
};

/**
 * 에러 로그를 저장하는 함수입니다.
 *
 * @param payload - error_logs 테이블 insert payload
 *
 * @author junyeol
 */

export const insertErrorLog = async (payload: ErrorLogsInsert): Promise<void> => {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("error_logs").insert(payload);
  if (error) throw new Error(`error_logs 저장 실패: ${error.message}`);
};
