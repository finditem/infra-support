import { postSlackMessage } from "../postSlackMessage";
import { resolveProfileFromSlackUser } from "../resolveProfileFromSlackUser";
import { sendHelpMessage } from "./help";
import { sendMyTasks } from "./myTasks";

const HELP_TRIGGERS = new Set(["도움말", "도와줘", "help"]);

interface RouteSlackMessageParams {
  text: string;
  slackUserId: string;
}

/**
 * 봇 DM으로 들어온 메시지를 명령별로 분기한다.
 * 상태 변경(5-3), 자연어 일정 등록(5-2)은 이후 커밋에서 이 라우터에 분기를 추가한다.
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
      text: "Slack 계정이 아직 팀원 프로필과 연결되지 않았어요. 관리자에게 연결을 요청해주세요.",
    });
    return;
  }

  if (trimmed === "내 일정") {
    await sendMyTasks(profile.id, slackUserId);
    return;
  }

  await sendHelpMessage(slackUserId);
};
