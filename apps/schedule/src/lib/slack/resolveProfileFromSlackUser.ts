import { createServiceClient } from "@/lib/supabase/service";
import type { ProfilesRow } from "@/types/tables";

/**
 * Slack 이벤트/인터랙션 payload의 user id로 연결된 profiles 행을 찾는다.
 * profiles.slack_user_id가 비어 있으면(계정 미연결) null을 반환한다.
 */
export const resolveProfileFromSlackUser = async (
  slackUserId: string
): Promise<ProfilesRow | null> => {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("slack_user_id", slackUserId)
    .maybeSingle();

  return data;
};
