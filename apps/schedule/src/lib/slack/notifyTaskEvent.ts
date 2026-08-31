import { buildTaskEventMessage } from "./buildTaskEventMessage";
import { postSlackMessage } from "./postSlackMessage";
import type { TaskNotificationPayload } from "./types";

/**
 * 일정 변경을 팀 채널 한 곳에 알린다. 담당자와 보고자에게는 DM을 보내지 않고
 * 채널 메시지 안에서 멘션으로 알린다.
 * 전송 실패는 postSlackMessage 안에서 로그로 흡수되므로 호출부는 결과를 신경 쓰지 않아도 된다.
 */
export const notifyTaskEvent = async (payload: TaskNotificationPayload): Promise<void> => {
  const channel = process.env.SLACK_CHANNEL_ID;

  if (!channel) {
    console.warn("SLACK_CHANNEL_ID가 없어 Slack 알림을 건너뛴다.");
    return;
  }

  await postSlackMessage({ channel, text: buildTaskEventMessage(payload) });
};
