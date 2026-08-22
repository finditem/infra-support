const SLACK_POST_MESSAGE_URL = "https://slack.com/api/chat.postMessage";

interface PostSlackMessageParams {
  /** 채널 ID(C...) 또는 DM을 보낼 사용자 ID(U...). */
  channel: string;
  text: string;
}

/**
 * Slack chat.postMessage 호출. 토큰이 없거나 전송에 실패해도 예외를 던지지 않고
 * false를 반환한다. 알림 실패가 일정 저장을 막으면 안 되기 때문이다.
 */
export const postSlackMessage = async ({
  channel,
  text,
}: PostSlackMessageParams): Promise<boolean> => {
  const token = process.env.SLACK_BOT_TOKEN;

  if (!token) {
    console.warn("SLACK_BOT_TOKEN이 없어 Slack 알림을 건너뛴다.");
    return false;
  }

  try {
    const response = await fetch(SLACK_POST_MESSAGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel, text, unfurl_links: false, unfurl_media: false }),
    });

    const result = (await response.json()) as { ok: boolean; error?: string };

    if (!result.ok) {
      console.error(`Slack 알림 전송 실패 (${channel}): ${result.error ?? "unknown"}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Slack 알림 전송 중 오류", error);
    return false;
  }
};
