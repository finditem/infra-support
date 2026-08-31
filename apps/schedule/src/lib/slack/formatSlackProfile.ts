import { escapeSlackText } from "./escapeSlackText";
import type { SlackNotificationProfile } from "./types";

/**
 * 사람을 메시지에 표기한다. Slack 계정이 연결된 팀원은 언급으로 적어 본인에게 알림이 가게 하고,
 * 연결되지 않았으면 이름만 적는다. 대상이 없으면 "없음"으로 표기한다.
 */
export const formatSlackProfile = (profile: SlackNotificationProfile | null) => {
  if (!profile) return "없음";
  if (profile.slackUserId) return `<@${profile.slackUserId}>`;
  return escapeSlackText(profile.name);
};
