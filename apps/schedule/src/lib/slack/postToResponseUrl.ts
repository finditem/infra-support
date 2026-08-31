import type { SlackBlock } from "./postSlackMessage";

const RESPONSE_URL_TIMEOUT_MS = 5000;

interface PostToResponseUrlParams {
  responseUrl: string;
  text: string;
  blocks?: SlackBlock[];
}

/**
 * 인터랙션(버튼 클릭) payload의 response_url로 원본 메시지를 대체한다.
 * chat.update와 달리 봇 토큰이 필요 없고 channel/ts를 따로 추적하지 않아도 된다.
 */
export const postToResponseUrl = async ({
  responseUrl,
  text,
  blocks,
}: PostToResponseUrlParams): Promise<void> => {
  try {
    await fetch(responseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ text, blocks, replace_original: true }),
      signal: AbortSignal.timeout(RESPONSE_URL_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Slack 인터랙션 응답 갱신 실패", error);
  }
};
