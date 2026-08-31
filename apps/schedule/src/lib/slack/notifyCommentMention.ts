import { buildCommentMentionMessage } from "./buildCommentMentionMessage";
import { postSlackMessage } from "./postSlackMessage";
import type { CommentMentionNotificationPayload } from "./types";

/**
 * 댓글 언급을 언급된 사람 개인 DM으로 알린다. 일정 변경 알림(팀 채널 한 곳)과 달리
 * 당사자에게만 필요한 내용이라 채널에 올리지 않는다.
 *
 * Slack 계정이 연결되지 않은(`slack_user_id`가 없는) 팀원은 보낼 곳이 없어 건너뛴다.
 * 전송 실패는 postSlackMessage 안에서 로그로 흡수되므로 호출부는 결과를 신경 쓰지 않아도 된다.
 */
export const notifyCommentMention = async (
  payload: CommentMentionNotificationPayload
): Promise<void> => {
  const slackUserIds = payload.mentioned
    .map((profile) => profile.slackUserId)
    .filter((slackUserId): slackUserId is string => !!slackUserId);

  if (slackUserIds.length === 0) return;

  const text = buildCommentMentionMessage(payload);

  await Promise.all(
    slackUserIds.map((slackUserId) => postSlackMessage({ channel: slackUserId, text }))
  );
};
