import { createSupabaseClient } from "@/lib/supabase";
import { ApisRow } from "@infra-support/shared";

export type ActiveApiRow = Pick<ApisRow, "id" | "name" | "source_url" | "is_active">;

/**
 * 모니터링 대상 API 목록을 조회하는 함수입니다.
 *
 * @returns 활성화되어 있고 source_url이 존재하는 API 목록
 *
 * @author junyeol
 */

const getActiveApis = async (): Promise<ActiveApiRow[]> => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("apis")
    .select("id, name, source_url, is_active")
    .eq("is_active", true)
    .not("source_url", "is", null);

  if (error) throw new Error(`apis 조회 실패: ${error.message}`);
  return (data ?? []) as ActiveApiRow[];
};

export default getActiveApis;
