import { after, NextResponse } from "next/server";
import {
  createTaskFromModalSubmission,
  type ModalStateValues,
} from "@/lib/slack/commands/createTaskFromModalSubmission";
import { routeSlackInteraction } from "@/lib/slack/interactions/router";
import { verifySlackRequest } from "@/lib/slack/verifySlackRequest";
import { TASK_CREATE_CALLBACK_ID } from "@/lib/slack/views/taskCreateModalView";

interface SlackInteractionPayload {
  type: string;
  user: { id: string };
  response_url?: string;
  actions?: { action_id: string; value?: string }[];
  view?: { callback_id: string; state: { values: ModalStateValues } };
}

/**
 * Slack Interactivity(버튼 클릭) 수신 엔드포인트. Slack App 대시보드에서 Interactivity의
 * Request URL을 이 경로로 등록해야 클릭 이벤트가 들어온다.
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

  // Interactivity 요청은 x-www-form-urlencoded로 오고, 실제 payload는 그 안의 payload 필드에
  // JSON 문자열로 담긴다 (Events API의 순수 JSON 바디와 다르다).
  const params = new URLSearchParams(rawBody);
  const payloadRaw = params.get("payload");

  if (!payloadRaw) {
    return NextResponse.json({ ok: true });
  }

  const payload = JSON.parse(payloadRaw) as SlackInteractionPayload;

  // /일정추가 모달 제출. 빈 200으로 ack하면 모달이 닫히므로, 실제 등록은 after()로 응답 이후에 처리한다.
  if (payload.type === "view_submission" && payload.view?.callback_id === TASK_CREATE_CALLBACK_ID) {
    const { id: slackUserId } = payload.user;
    const state = payload.view.state.values;

    after(() => createTaskFromModalSubmission(slackUserId, state));

    return NextResponse.json({});
  }

  const action = payload.actions?.[0];

  // Slack은 버튼 클릭에 3초 안에 ack해야 한다. DB/Slack 호출을 다 기다렸다가 응답하면
  // 이 시간을 쉽게 넘겨 버튼이 실패한 것처럼 보이므로, 실제 처리는 after()로 응답 이후에 수행한다.
  if (payload.type === "block_actions" && action?.value && payload.response_url) {
    const { action_id: actionId, value: taskId } = action;
    const { id: slackUserId } = payload.user;
    const { response_url: responseUrl } = payload;

    after(() => routeSlackInteraction({ actionId, taskId, slackUserId, responseUrl }));
  }

  return NextResponse.json({ ok: true });
};
