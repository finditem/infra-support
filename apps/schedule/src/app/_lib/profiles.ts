import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfilesRow } from "@/types/tables";

/**
 * 가입을 마친 팀원 목록을 이름순으로 조회한다.
 * 초대만 되고 비밀번호 설정을 마치지 않은 사용자는 registered_at이 null이라 제외된다.
 */
export const getRegisteredProfiles = async (supabase: SupabaseClient): Promise<ProfilesRow[]> => {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .not("registered_at", "is", null)
    .order("name");

  return data ?? [];
};
