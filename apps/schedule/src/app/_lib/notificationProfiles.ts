import type { SupabaseClient } from "@supabase/supabase-js";
import type { SlackNotificationProfile } from "@/lib/slack";

/** 알림에 필요한 profiles 컬럼만 뽑은 행. */
export interface NotificationProfileRow {
  id: string;
  name: string;
  slack_user_id: string | null;
}

export const toNotificationProfile = (
  profile: NotificationProfileRow | undefined
): SlackNotificationProfile | null =>
  profile ? { name: profile.name, slackUserId: profile.slack_user_id } : null;

/**
 * 알림에 등장하는 사람들을 한 번에 읽어 id로 찾을 수 있게 담는다.
 * 같은 사람이 여러 역할로 겹쳐 들어오므로 중복과 null을 걸러낸 뒤 조회한다.
 */
export const loadNotificationProfileMap = async (
  supabase: SupabaseClient,
  ids: (string | null)[]
) => {
  const uniqueIds = Array.from(new Set(ids.filter((id): id is string => !!id)));

  if (uniqueIds.length === 0) return new Map<string, NotificationProfileRow>();

  const { data } = await supabase
    .from("profiles")
    .select("id, name, slack_user_id")
    .in("id", uniqueIds);

  return new Map((data ?? []).map((profile: NotificationProfileRow) => [profile.id, profile]));
};
