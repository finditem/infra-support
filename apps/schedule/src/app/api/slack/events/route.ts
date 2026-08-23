import { NextResponse } from "next/server";
import { routeSlackMessage } from "@/lib/slack/commands/router";
import { verifySlackRequest } from "@/lib/slack/verifySlackRequest";

interface SlackMessageEvent {
  type: string;
  subtype?: string;
  bot_id?: string;
  channel_type?: string;
  user?: string;
  text?: string;
}

type SlackEventBody =
  | { type: "url_verification"; challenge: string }
  | { type: "event_callback"; event: SlackMessageEvent }
  | { type: string };

/**
 * Slack Events API 수신 엔드포인트. Slack App 대시보드에서 Event Subscriptions의
 * Request URL을 이 경로로 등록하고 message.im을 구독해야 이벤트가 들어온다.
 */
export const POST = async (request: Request) => {
  const rawBody = await request.text();

  const verified = verifySlackRequest({
    rawBody,
    timestamp: request.headers.get("x-slack-request-timestamp"),
    signature: request.headers.get("x-slack-signature"),
  });

  if (!verified) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody) as SlackEventBody;

  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: (body as { challenge: string }).challenge });
  }

  // Slack이 3초 안에 200을 못 받으면 같은 이벤트를 재전송한다. 재시도 요청은 그대로 ack만 하고
  // 다시 처리하지 않는다 — 안 그러면 자연어 일정 등록 같은 부수효과가 중복 실행될 수 있다.
  if (request.headers.get("x-slack-retry-num")) {
    return NextResponse.json({ ok: true });
  }

  if (body.type === "event_callback") {
    const { event } = body as { type: "event_callback"; event: SlackMessageEvent };

    if (
      event.type === "message" &&
      event.channel_type === "im" &&
      !event.bot_id &&
      !event.subtype &&
      event.user &&
      event.text
    ) {
      await routeSlackMessage({ text: event.text, slackUserId: event.user });
    }
  }

  return NextResponse.json({ ok: true });
};
