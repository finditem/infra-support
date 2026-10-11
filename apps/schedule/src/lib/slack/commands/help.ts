import { postSlackMessage } from "../postSlackMessage";

const HELP_MESSAGE = `안녕하세요! 사용 가능한 명령어를 알려드릴게요 🙋

*📌 일정 추가*
  일정추가 [제목] [담당자(선택)] [날짜(선택)]
  예) 일정추가 필드브레인워크 이지은 7/10
  또는 첫 줄에 제목, 다음 줄에 본문(선택), 마지막 줄에 보고자(선택)를 적어 보내주세요.
  담당자/날짜를 생략하면 각각 보낸 사람, 이번주 일요일로 자동 설정돼요.

*✅ 상태 변경*
  [상태] [일정 제목]
  예) 완료 퍼블리싱작업

*📋 내 일정 조회*
  내 일정

*❓ 도움말*
  도움말`;

/** 매칭되는 명령이 없을 때도 이 메시지로 폴백한다. */
export const sendHelpMessage = async (slackUserId: string) => {
  await postSlackMessage({ channel: slackUserId, text: HELP_MESSAGE });
};
