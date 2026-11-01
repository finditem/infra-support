import { differenceInCalendarDays, endOfWeek, format, startOfToday, startOfWeek } from "date-fns";
import { createServiceClient } from "@/lib/supabase/service";
import type { ProfilesRow } from "@/types/tables";
import { classifyQuery } from "../ai/classifyQuery";
import { escapeSlackText } from "../escapeSlackText";
import { postSlackMessage } from "../postSlackMessage";
import { sendHelpMessage } from "./help";
import { sendMyTasks } from "./myTasks";

/**
 * AI 조회의 LLM 호출 킬 스위치. 기본값은 비활성(false)이고, 명시적으로 "true"로 설정해야만 켜진다.
 * 꺼져 있으면 LLM을 호출하지 않고 바로 도움말로 안내해 의도치 않은 토큰 소모를 막는다.
 */
const isAiQueryEnabled = () => process.env.SLACK_AI_QUERY_ENABLED === "true";

/**
 * 어느 명령에도 매칭되지 않은 DM을 자연어 조회로 처리한다.
 * LLM은 의도 분류/슬롯 추출에만 쓰고, 날짜·완료율 같은 수치는 전부 아래 코드가 DB에서 계산한다.
 * 분류 실패하거나 지원하지 않는 의도면 도움말로 안내한다 (일정 등록은 조회로 추측하지 않는다).
 */
export const answerQuery = async (profile: ProfilesRow, text: string, slackUserId: string) => {
  if (!isAiQueryEnabled()) {
    await sendHelpMessage(slackUserId);
    return;
  }

  const query = await classifyQuery(text);

  if (!query || query.intent === "unknown") {
    await sendHelpMessage(slackUserId);
    return;
  }

  if (query.intent === "days_remaining") {
    await answerDaysRemaining(query.taskQuery, slackUserId);
    return;
  }

  if (query.intent === "completion_rate") {
    await answerCompletionRate(profile, query.scope, slackUserId);
    return;
  }

  // remaining_tasks: "남은 일정"은 요청자 본인의 미완료 일정을 뜻하므로 "내 일정"과 동일하게 처리한다.
  await sendMyTasks(profile.id, slackUserId);
};

/** days_remaining: 제목으로 일정을 찾아 마감일까지 남은 일수를 계산해 답한다. */
const answerDaysRemaining = async (taskQuery: string | null, slackUserId: string) => {
  if (!taskQuery) {
    await postSlackMessage({
      channel: slackUserId,
      text: "어떤 일정의 마감을 물어보는지 알려주세요. 예) 퍼블리싱작업 며칠 남았어?",
    });
    return;
  }

  const { data: matches } = await createServiceClient()
    .from("tasks")
    .select("title, due_date")
    .ilike("title", `%${taskQuery}%`);

  const tasks = matches ?? [];

  if (tasks.length === 0) {
    await postSlackMessage({
      channel: slackUserId,
      text: `⚠️ "${escapeSlackText(taskQuery)}" 일정을 찾을 수 없어요.`,
    });
    return;
  }

  if (tasks.length > 1) {
    const titles = tasks.map((task) => `• ${escapeSlackText(task.title)}`).join("\n");
    await postSlackMessage({
      channel: slackUserId,
      text: `🔍 "${escapeSlackText(taskQuery)}"로 검색된 일정이 여러 개예요. 더 정확한 제목으로 다시 물어봐 주세요.\n${titles}`,
    });
    return;
  }

  const task = tasks[0];
  const title = escapeSlackText(task.title);

  if (!task.due_date) {
    await postSlackMessage({ channel: slackUserId, text: `📌 *${title}*는 마감일이 없어요.` });
    return;
  }

  const diff = differenceInCalendarDays(new Date(task.due_date), startOfToday());

  await postSlackMessage({
    channel: slackUserId,
    text: buildDaysRemainingText(title, task.due_date, diff),
  });
};

const buildDaysRemainingText = (title: string, dueDate: string, diff: number) => {
  if (diff > 0) return `📌 *${title}*는 마감까지 *${diff}일* 남았어요. (마감일: ${dueDate})`;
  if (diff === 0) return `📌 *${title}*는 오늘이 마감이에요! (마감일: ${dueDate})`;
  return `📌 *${title}*는 마감일이 *${Math.abs(diff)}일* 지났어요. (마감일: ${dueDate})`;
};

/** completion_rate: 이번 주(월~일) 마감 일정 기준으로 본인 또는 팀 전체 완료율을 계산해 답한다. */
const answerCompletionRate = async (
  profile: ProfilesRow,
  scope: "me" | "all",
  slackUserId: string
) => {
  const supabase = createServiceClient();

  const today = startOfToday();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  const sunday = endOfWeek(today, { weekStartsOn: 1 });

  const { data: statuses } = await supabase.from("task_statuses").select("id, name");
  const doneStatusId = (statuses ?? []).find((status) => status.name === "완료")?.id ?? null;

  let query = supabase
    .from("tasks")
    .select("status_id")
    .gte("due_date", format(monday, "yyyy-MM-dd"))
    .lte("due_date", format(sunday, "yyyy-MM-dd"));

  if (scope === "me") {
    query = query.eq("assignee_id", profile.id);
  }

  const { data: tasks } = await query;
  const rows = tasks ?? [];
  const subject = scope === "me" ? `${escapeSlackText(profile.name)}님의 이번 주` : "이번 주 팀";

  if (rows.length === 0) {
    await postSlackMessage({
      channel: slackUserId,
      text: `📈 ${subject} 마감인 일정이 없어요.`,
    });
    return;
  }

  const completed = rows.filter((task) => task.status_id === doneStatusId).length;
  const rate = Math.round((completed / rows.length) * 100);

  await postSlackMessage({
    channel: slackUserId,
    text: `📈 ${subject} 완료율은 *${rate}%* 예요. (완료 ${completed} / 전체 ${rows.length})`,
  });
};
