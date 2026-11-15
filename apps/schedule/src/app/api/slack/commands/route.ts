import { after, NextResponse } from "next/server";
import { openTaskCreateModal } from "@/lib/slack/commands/openTaskCreateModal";
import { verifySlackRequest } from "@/lib/slack/verifySlackRequest";

/**
 * Slack 슬래시 커맨드 수신 엔드포인트. Slack App 대시보드 > Slash Commands에서 `/일정추가`를
 * 만들고 Request URL을 이 경로로 등록해야 한다(봇에 commands 스코프 필요).
 * 요청은 x-www-form-urlencoded로 오며 trigger_id로 즉시 모달을 띄운다.
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

  const params = new URLSearchParams(rawBody);
  const triggerId = params.get("trigger_id");

  // 슬래시 커맨드는 3초 안에 ack해야 한다. 모달 열기(프로필 조회 + views.open)가 느려지면
  // ack가 그만큼 늦어져 operation_timeout이 뜰 수 있으므로, 응답을 먼저 보내고 모달 열기는
  // after()로 넘긴다. trigger_id도 발급 후 짧은 시간 안에 써야 하므로 after()에서 지체 없이 소비한다.
  if (triggerId) {
    after(() => openTaskCreateModal(triggerId));
  }

  // 빈 200으로 ack하면 채널에 아무 메시지도 남기지 않는다.
  return new NextResponse(null, { status: 200 });
};
