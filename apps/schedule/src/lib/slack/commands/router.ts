import { answerQuery } from "./answerQuery";
import { createTaskFromStructuredCommand } from "./createTaskFromStructuredCommand";
import { postSlackMessage } from "../postSlackMessage";
import { resolveProfileFromSlackUser } from "../resolveProfileFromSlackUser";
import { sendHelpMessage } from "./help";
import { matchTaskCreateCommand } from "./matchTaskCreateCommand";
import { sendMyTasks } from "./myTasks";
import { handleStatusChange, matchStatusCommand } from "./updateStatus";

const HELP_TRIGGERS = new Set(["도움말", "도와줘", "help"]);

interface RouteSlackMessageParams {
  text: string;
  slackUserId: string;
}

/**
 * 봇 DM으로 들어온 메시지를 명령별로 분기한다.
 * 일정 등록은 구조화 명령(`일정추가 ...`)으로만 받는다. 도움말/내일정/상태변경/구조화 일정추가
 * 어디에도 매칭되지 않으면 자유 텍스트를 AI 조회(읽기 전용)로 넘긴다. 조회 의도로도 분류되지
 * 않으면(또는 조회 기능이 꺼져 있으면) 등록으로 추측하지 않고 사용법(도움말)을 안내한다.
 */
export const routeSlackMessage = async ({ text, slackUserId }: RouteSlackMessageParams) => {
  const trimmed = text.trim();

  if (trimmed.length === 0 || HELP_TRIGGERS.has(trimmed.toLowerCase())) {
    await sendHelpMessage(slackUserId);
    return;
  }

  const profile = await resolveProfileFromSlackUser(slackUserId);

  if (!profile) {
    await postSlackMessage({
      channel: slackUserId,
      text: "⚠️ Slack 계정이 아직 팀원 프로필과 연결되지 않았어요. 관리자에게 연결을 요청해주세요.",
    });
    return;
  }

  if (trimmed === "내 일정") {
    await sendMyTasks(profile.id, slackUserId);
    return;
  }

  const statusCommand = matchStatusCommand(trimmed);

  if (statusCommand) {
    const [statusName, titleQuery] = statusCommand;
    await handleStatusChange(profile, statusName, titleQuery, slackUserId);
    return;
  }

  const taskCreateRemainder = matchTaskCreateCommand(trimmed);

  if (taskCreateRemainder !== null) {
    await createTaskFromStructuredCommand(profile, taskCreateRemainder, slackUserId);
    return;
  }

  await answerQuery(profile, trimmed, slackUserId);
};
