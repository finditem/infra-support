import { format, isValid, parse } from "date-fns";
import { getDefaultDueDate } from "@/app/_lib/kanbanUtils";
import { createServiceClient } from "@/lib/supabase/service";
import { escapeSlackText } from "../escapeSlackText";
import { postSlackMessage } from "../postSlackMessage";
import { resolveProfileFromSlackUser } from "../resolveProfileFromSlackUser";
import { resolveReporterForAssignee } from "../resolveReporterForAssignee";
import { insertTaskAndNotify } from "./insertTaskAndNotify";

/** view.state.values[block_id][action_id] 한 칸. 요소 종류에 따라 채워지는 필드가 다르다. */
interface ModalFieldState {
  value?: string;
  selected_option?: { value: string } | null;
  selected_date?: string | null;
}

/** view.state.values 전체(block_id -> action_id -> 상태). */
export type ModalStateValues = Record<string, Record<string, ModalFieldState>>;

const ACTION_ID = "input";

/**
 * /일정추가 모달 제출(view_submission)을 처리한다. 제목/담당자/마감일/본문을 읽고,
 * 보고자는 담당자가 속한 팀의 팀장으로 자동 지정한 뒤 일정을 등록하고 DM으로 결과를 알린다.
 */
export const createTaskFromModalSubmission = async (
  slackUserId: string,
  state: ModalStateValues
) => {
  const title = state.title?.[ACTION_ID]?.value?.trim() ?? "";
  const selectedAssigneeId = state.assignee?.[ACTION_ID]?.selected_option?.value ?? null;
  const dueDateStr = state.due_date?.[ACTION_ID]?.selected_date ?? null;
  const body = state.body?.[ACTION_ID]?.value?.trim() || null;

  const senderProfile = await resolveProfileFromSlackUser(slackUserId);

  if (!senderProfile) {
    await postSlackMessage({
      channel: slackUserId,
      text: "⚠️ Slack 계정이 아직 팀원 프로필과 연결되지 않았어요. 관리자에게 연결을 요청해주세요.",
    });
    return;
  }

  if (title.length === 0) {
    await postSlackMessage({ channel: slackUserId, text: "⚠️ 일정 제목을 입력해주세요." });
    return;
  }

  const supabase = createServiceClient();

  const assigneeIsAuto = !selectedAssigneeId;
  let assigneeProfile = senderProfile;

  if (selectedAssigneeId && selectedAssigneeId !== senderProfile.id) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", selectedAssigneeId)
      .maybeSingle();

    if (data) assigneeProfile = data;
  }

  const reporterId = await resolveReporterForAssignee(supabase, assigneeProfile.id);

  let dueDateObj = getDefaultDueDate();
  let dueDateIsAuto = true;

  if (dueDateStr) {
    const parsed = parse(dueDateStr, "yyyy-MM-dd", new Date());

    if (isValid(parsed)) {
      dueDateObj = parsed;
      dueDateIsAuto = false;
    }
  }

  const task = await insertTaskAndNotify({
    title,
    body,
    assigneeId: assigneeProfile.id,
    reporterId,
    dueDate: dueDateObj,
    createdBy: senderProfile.id,
    slackUserId,
  });

  if (!task) return;

  let reporterName: string | null = null;

  if (reporterId) {
    const { data } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", reporterId)
      .maybeSingle();
    reporterName = data?.name ?? null;
  }

  const dueDateLabel = format(dueDateObj, "yyyy-MM-dd");
  const lines = ["✅ *일정이 등록됐어요!*", `*제목*: ${escapeSlackText(title)}`];

  if (body) lines.push(`*본문*: ${escapeSlackText(body)}`);
  lines.push(
    `*담당자*: ${escapeSlackText(assigneeProfile.name)}${assigneeIsAuto ? " (자동)" : ""}`
  );
  if (reporterName) lines.push(`*보고자*: ${escapeSlackText(reporterName)} (팀장, 자동)`);
  lines.push(`*마감일*: ${dueDateLabel}${dueDateIsAuto ? " (이번주 일요일, 자동)" : ""}`);

  const siteUrl = process.env.SITE_URL;
  if (siteUrl) lines.push(`🔗 *바로 보기*: ${siteUrl}`);

  await postSlackMessage({ channel: slackUserId, text: lines.join("\n") });
};
