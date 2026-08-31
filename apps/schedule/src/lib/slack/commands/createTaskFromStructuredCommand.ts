import { format, isValid, parse } from "date-fns";
import { getDefaultDueDate } from "@/app/_lib/kanbanUtils";
import { createServiceClient } from "@/lib/supabase/service";
import type { ProfilesRow } from "@/types/tables";
import { escapeSlackText } from "../escapeSlackText";
import { postSlackMessage } from "../postSlackMessage";
import { insertTaskAndNotify } from "./insertTaskAndNotify";

const DATE_TOKEN_PATTERN = /^\d{1,2}\/\d{1,2}$/;

const parseDueDateToken = (token: string): Date | null => {
  const parsed = parse(token, "M/d", new Date());

  return isValid(parsed) ? parsed : null;
};

/**
 * 5-1: "일정추가 [제목] [담당자(선택)] [날짜(선택)]".
 * 제목에 공백이 있어도 뒤 토큰이 담당자로 잘못 넘어가지 않도록, 왼쪽이 아니라 오른쪽부터
 * 날짜(패턴 일치) → 담당자(실제 프로필 이름 일치) 순으로 떼어내고 남는 부분 전체를 제목으로 쓴다.
 */
export const createTaskFromStructuredCommand = async (
  senderProfile: ProfilesRow,
  remainder: string,
  slackUserId: string
) => {
  const tokens = remainder.trim().split(/\s+/).filter(Boolean);

  let dueDateObj = getDefaultDueDate();
  let dueDateIsAuto = true;

  if (tokens.length > 0 && DATE_TOKEN_PATTERN.test(tokens[tokens.length - 1])) {
    const parsedDate = parseDueDateToken(tokens[tokens.length - 1]);

    if (parsedDate) {
      tokens.pop();
      dueDateObj = parsedDate;
      dueDateIsAuto = false;
    }
  }

  let assigneeProfile = senderProfile;
  let assigneeIsAuto = true;

  if (tokens.length > 0) {
    const { data: matchedAssignee } = await createServiceClient()
      .from("profiles")
      .select("*")
      .eq("name", tokens[tokens.length - 1])
      .maybeSingle();

    if (matchedAssignee) {
      tokens.pop();
      assigneeProfile = matchedAssignee;
      assigneeIsAuto = false;
    }
  }

  const title = tokens.join(" ").trim();

  if (title.length === 0) {
    await postSlackMessage({
      channel: slackUserId,
      text: "⚠️ 일정 제목을 찾지 못했어요.\n예) 일정추가 필드브레인워크 이지은 7/10",
    });
    return;
  }

  const task = await insertTaskAndNotify({
    title,
    body: null,
    assigneeId: assigneeProfile.id,
    reporterId: null,
    dueDate: dueDateObj,
    createdBy: senderProfile.id,
    slackUserId,
  });

  if (!task) return;

  const dueDateLabel = format(dueDateObj, "yyyy-MM-dd");
  const lines = ["✅ *일정이 등록됐어요!*", `*제목*: ${escapeSlackText(title)}`];

  lines.push(
    `*담당자*: ${escapeSlackText(assigneeProfile.name)}${assigneeIsAuto ? " (자동)" : ""}`
  );
  lines.push(`*마감일*: ${dueDateLabel}${dueDateIsAuto ? " (이번주 일요일, 자동)" : ""}`);

  const siteUrl = process.env.SITE_URL;
  if (siteUrl) lines.push(`🔗 *바로 보기*: ${siteUrl}`);

  await postSlackMessage({ channel: slackUserId, text: lines.join("\n") });
};
