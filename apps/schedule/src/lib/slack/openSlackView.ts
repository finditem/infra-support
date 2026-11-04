import type { SlackBlock } from "./postSlackMessage";

const SLACK_VIEWS_OPEN_URL = "https://slack.com/api/views.open";

/** Slack 응답을 기다리는 최대 시간(postSlackMessage와 동일 기준). */
const SLACK_REQUEST_TIMEOUT_MS = 5000;

export interface SlackModalView {
  type: "modal";
  callback_id: string;
  title: { type: "plain_text"; text: string };
  submit?: { type: "plain_text"; text: string };
  close?: { type: "plain_text"; text: string };
  blocks: SlackBlock[];
}

/**
 * Slack views.open 호출로 모달을 띄운다. trigger_id는 발급 후 약 3초 안에 써야 유효하므로,
 * 이 함수는 슬래시 커맨드 핸들러가 응답을 보내기 전에 await로 호출한다.
 * 토큰이 없거나 실패해도 예외를 던지지 않고 false를 반환한다.
 */
export const openSlackView = async (triggerId: string, view: SlackModalView): Promise<boolean> => {
  const token = process.env.SLACK_BOT_TOKEN;

  if (!token) {
    console.warn("SLACK_BOT_TOKEN이 없어 Slack 모달을 열 수 없다.");
    return false;
  }

  try {
    const response = await fetch(SLACK_VIEWS_OPEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ trigger_id: triggerId, view }),
      signal: AbortSignal.timeout(SLACK_REQUEST_TIMEOUT_MS),
    });

    const result = (await response.json()) as { ok: boolean; error?: string };

    if (!result.ok) {
      console.error(`Slack 모달 열기 실패: ${result.error ?? "unknown"}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Slack 모달 열기 중 오류", error);
    return false;
  }
};
