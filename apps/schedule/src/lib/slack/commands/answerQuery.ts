import { createServiceClient } from "@/lib/supabase/service";
import type { ProfilesRow } from "@/types/tables";
import { classifyQuery } from "../ai/classifyQuery";
import { escapeSlackText } from "../escapeSlackText";
import { postSlackMessage } from "../postSlackMessage";
import { sendHelpMessage } from "./help";
import { sendMyTasks } from "./myTasks";

// 날짜 경계는 서버 실행 환경의 로컬 타임존(Vercel 기본 UTC)이 아니라 KST로 고정한다. 그러지 않으면
// 00:00~09:00 KST 사이 요청에서 전날 UTC 날짜가 잡혀, 당일 마감 건이 "하루 더 남음"으로 계산되거나
// 이번 주 완료율 범위가 지난주로 밀린다. src/app/report/_lib/report.ts의 날짜 경계 처리와 같은 방식이다.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 특정 순간을 KST 달력 날짜 키(yyyy-MM-dd)로 환산한다. */
const toKstDateKey = (epochMs: number) =>
  new Date(epochMs + KST_OFFSET_MS).toISOString().slice(0, 10);

/** 오늘(KST) 날짜 키. */
const kstTodayKey = () => toKstDateKey(Date.now());

/** 날짜 키(yyyy-MM-dd) 두 개 사이의 달력 일수 차이(target - base). */
const diffKstCalendarDays = (targetKey: string, baseKey: string) =>
  Math.round(
    (Date.parse(`${targetKey}T00:00:00+09:00`) - Date.parse(`${baseKey}T00:00:00+09:00`)) / DAY_MS
  );

/** 이번 주(KST 기준 월~일)의 월요일/일요일 날짜 키. */
const kstThisWeekRange = () => {
  const todayMidnightEpoch = Date.parse(`${kstTodayKey()}T00:00:00+09:00`);
  const kstWeekday = new Date(todayMidnightEpoch + KST_OFFSET_MS).getUTCDay(); // 0=일 ~ 6=토
  const mondayEpoch = todayMidnightEpoch - ((kstWeekday + 6) % 7) * DAY_MS;

  return {
    monday: toKstDateKey(mondayEpoch),
    sunday: toKstDateKey(mondayEpoch + 6 * DAY_MS),
  };
};

/**
 * AI 조회의 LLM 호출 킬 스위치. 기본값은 비활성(false)이고, 명시적으로 "true"로 설정해야만 켜진다.
 * 꺼져 있으면 LLM을 호출하지 않고 바로 도움말로 안내해 의도치 않은 토큰 소모를 막는다.
 */
const isAiQueryEnabled = () => process.env.SLACK_AI_TASK_QUERY_ENABLED === "true";

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

  const diff = diffKstCalendarDays(task.due_date, kstTodayKey());

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

  const { monday, sunday } = kstThisWeekRange();

  const { data: statuses } = await supabase.from("task_statuses").select("id, name");
  const doneStatusId = (statuses ?? []).find((status) => status.name === "완료")?.id ?? null;

  let query = supabase
    .from("tasks")
    .select("status_id")
    .gte("due_date", monday)
    .lte("due_date", sunday);

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
