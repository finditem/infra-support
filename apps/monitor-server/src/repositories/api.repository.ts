import { createSupabaseClient } from "@/lib/supabase";
import { ApisRow } from "@infra-support/shared";

export type ActiveApiRow = Pick<
  ApisRow,
  "id" | "name" | "request_url" | "http_method" | "is_active"
>;

/**
 * 모니터링 대상 API 목록을 조회하는 함수입니다.
 *
 * @remarks
 * - 호출 대상은 `source_url`이 아니라 `request_url`입니다. `source_url`은 출처/문서 링크 표시용입니다.
 *
 * @returns 활성화되어 있고 request_url이 존재하는 API 목록
 *
 * @author junyeol
 */

const getActiveApis = async (): Promise<ActiveApiRow[]> => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("apis")
    .select("id, name, request_url, http_method, is_active")
    .eq("is_active", true)
    .not("request_url", "is", null);

  if (error) throw new Error(`apis 조회 실패: ${error.message}`);
  return (data ?? []) as ActiveApiRow[];
};

/**
 * 단일 API를 id로 조회하는 함수입니다.
 *
 * @remarks
 * - 수동 체크처럼 특정 API 하나만 점검할 때 사용합니다.
 * - `is_active`와 `request_url` 조건으로 거르지 않고 그대로 반환합니다. 점검 가능 여부 판단은 서비스 계층이 담당합니다.
 *
 * @param apiId - 조회할 API의 id
 *
 * @returns 해당 API 행. 존재하지 않으면 `null`
 *
 * @author jikwon
 */

export const getApiById = async (apiId: string): Promise<ActiveApiRow | null> => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("apis")
    .select("id, name, request_url, http_method, is_active")
    .eq("id", apiId)
    .maybeSingle();

  if (error) throw new Error(`apis 조회 실패: ${error.message}`);
  return (data as ActiveApiRow | null) ?? null;
};

export default getActiveApis;
