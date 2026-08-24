import { format } from "date-fns";
import { getOrCreateWeek } from "@/app/_lib/kanban";
import { getDefaultDueDate, getMonday } from "@/app/_lib/kanbanUtils";
import { notifyTaskCreated } from "@/app/_lib/taskNotification";
import { createServiceClient } from "@/lib/supabase/service";
import type { ProfilesRow, TasksInsert } from "@/types/tables";
import { parseTaskFromMessage } from "../ai/parseTaskFromMessage";
import { escapeSlackText } from "../escapeSlackText";
import { postSlackMessage } from "../postSlackMessage";

const DEFAULT_STATUS_NAME = "할 일";

/**
 * OpenAI 호출 자체를 막는 킬 스위치. 기본값은 비활성(false)이고, 명시적으로 "true"로 설정해야만 켜진다.
 * OPENAI_API_KEY가 설정돼 있어도 이 플래그가 꺼져 있으면 API를 호출하지 않는다 — 크레딧이 없는 상태에서
 * 다른 명령을 테스트하다 실수로 자연어 등록이 트리거돼 토큰이 소모되는 걸 막기 위함.
 */
const isAiTaskCreationEnabled = () => process.env.SLACK_AI_TASK_CREATION_ENABLED === "true";

/** 5-2: 도움말/상태변경/내일정 어디에도 매칭되지 않은 DM을 자연어 일정 등록으로 처리한다. */
export const createTaskFromMessage = async (
  assigneeProfile: ProfilesRow,
  text: string,
  slackUserId: string
) => {
  if (!isAiTaskCreationEnabled()) {
    await postSlackMessage({
      channel: slackUserId,
      text: "⚠️ 자연어 일정 등록은 아직 준비 중이에요. 도움말을 참고해주세요.",
    });
    return;
  }

  const parsed = await parseTaskFromMessage(text);

  if (!parsed) {
    await postSlackMessage({
      channel: slackUserId,
      text: "⚠️ 메시지에서 일정 제목을 찾지 못했어요. 도움말을 참고해서 다시 시도해주세요.",
    });
    return;
  }

  const supabase = createServiceClient();

  const { data: status } = await supabase
    .from("task_statuses")
    .select("id")
    .eq("name", DEFAULT_STATUS_NAME)
    .maybeSingle();

  if (!status) {
    await postSlackMessage({
      channel: slackUserId,
      text: "⚠️ 기본 상태를 찾을 수 없어 일정을 등록하지 못했어요.",
    });
    return;
  }

  const reporterMatch = parsed.reporterName
    ? (
        await supabase
          .from("profiles")
          .select("*")
          .ilike("name", `%${parsed.reporterName}%`)
          .maybeSingle()
      ).data
    : null;

  const dueDateObj = getDefaultDueDate();
  const dueDate = format(dueDateObj, "yyyy-MM-dd");
  const week = await getOrCreateWeek(supabase, getMonday(dueDateObj));

  if (!week) {
    await postSlackMessage({
      channel: slackUserId,
      text: "⚠️ 주차 정보를 만들지 못해 일정을 등록하지 못했어요.",
    });
    return;
  }

  const insertPayload: TasksInsert = {
    title: parsed.title,
    body: parsed.body,
    status_id: status.id,
    week_id: week.id,
    assignee_id: assigneeProfile.id,
    reporter_id: reporterMatch?.id ?? null,
    due_date: dueDate,
    created_by: assigneeProfile.id,
  };

  const { data: task, error } = await supabase
    .from("tasks")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error || !task) {
    console.error("Slack 자연어 일정 등록 실패", error);
    await postSlackMessage({ channel: slackUserId, text: "⚠️ 일정 등록 중 오류가 발생했어요." });
    return;
  }

  await notifyTaskCreated(supabase, task, assigneeProfile.id);

  const lines = ["✅ *일정이 등록됐어요!*", `*제목*: ${escapeSlackText(parsed.title)}`];

  if (parsed.body) lines.push(`*본문*: ${escapeSlackText(parsed.body)}`);
  if (reporterMatch) lines.push(`*보고자*: ${escapeSlackText(reporterMatch.name)}`);
  lines.push(`*담당자*: ${escapeSlackText(assigneeProfile.name)} (자동)`);
  lines.push(`*마감일*: ${dueDate} (이번주 일요일, 자동)`);

  const siteUrl = process.env.SITE_URL;
  if (siteUrl) lines.push(`🔗 *바로 보기*: ${siteUrl}`);

  await postSlackMessage({ channel: slackUserId, text: lines.join("\n") });
};
