import { differenceInCalendarDays, isAfter } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfilesRow } from "@/types/tables";

export type ReportRange = "week" | "month" | "quarter";

const RANGE_DAYS: Record<ReportRange, number> = { week: 7, month: 30, quarter: 90 };

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const isReportRange = (value: string): value is ReportRange => value in RANGE_DAYS;

/** 특정 순간을 KST 달력 날짜 키(yyyy-MM-dd)로 환산한다. */
const toKstDateKey = (epochMs: number) =>
  new Date(epochMs + KST_OFFSET_MS).toISOString().slice(0, 10);

/**
 * 오늘을 끝으로 하는 롤링 기간. 기획서/스프린트 주차와는 독립적으로, 선택한 기간만큼의 최근 날짜를 본다.
 * 날짜 경계는 서버 실행 환경의 로컬 타임존(Vercel 기본 UTC)이 아니라 KST로 고정한다. 그러지 않으면
 * 00:00~09:00 KST 사이에는 전날 UTC 날짜가 잡혀, 당일 마감 건과 당일 이른 시각의 기록이 빠진다.
 * start/end는 tasks.due_date(date 타입) 비교용 날짜 문자열이고, startTimestamp/endTimestamp는
 * task_comments/status_history의 created_at(timestamptz) 비교용으로 KST 당일 시작·끝 시각을 담는다.
 */
export const getReportPeriod = (range: ReportRange, now: Date = new Date()) => {
  const todayKey = toKstDateKey(now.getTime());
  const endMidnightKstEpoch = Date.parse(`${todayKey}T00:00:00+09:00`);
  const startMidnightKstEpoch = endMidnightKstEpoch - (RANGE_DAYS[range] - 1) * DAY_MS;

  return {
    start: toKstDateKey(startMidnightKstEpoch),
    end: todayKey,
    startTimestamp: new Date(startMidnightKstEpoch).toISOString(),
    endTimestamp: new Date(endMidnightKstEpoch + DAY_MS - 1).toISOString(),
  };
};

export interface MemberReportStats {
  profile: ProfilesRow;
  /** 기간 내 마감일이 있는 담당 일정 수. */
  totalAssigned: number;
  completedCount: number;
  completionRate: number | null;
  bodyFilledCount: number;
  hasSubtaskCount: number;
  commentCount: number;
  /** status_history 기록이 쌓이기 시작한 이후 완료된 건만 집계한다(과거 데이터는 소급 불가). */
  trackedCompletionCount: number;
  onTimeCount: number;
  onTimeRate: number | null;
  avgCompletionDays: number | null;
}

/**
 * 기간 내 팀원별 일정 활용 지표를 계산한다.
 *
 * - 완료율/설명 작성률/하위일정 보유율: tasks.due_date가 기간에 걸리는 담당 일정 기준.
 * - 마감일 준수율/평균 완료 소요 시간: status_history에 "완료" 전환이 기록된 건만 집계한다.
 *   이 테이블은 최근에 기록을 시작했기 때문에, 과거에 완료된 일정은 포함되지 않는다
 *   (trackedCompletionCount로 표본 수를 함께 보여줘 "아직 데이터가 쌓이는 중"임을 구분한다).
 * - 댓글 활동량: task_comments.created_at이 기간에 포함되는 건 기준.
 */
export const getMemberReportStats = async (
  supabase: SupabaseClient,
  profiles: ProfilesRow[],
  range: ReportRange
): Promise<MemberReportStats[]> => {
  const { start, end, startTimestamp, endTimestamp } = getReportPeriod(range);

  const [{ data: doneStatus }, { data: periodTasks, error: tasksError }, { data: comments }] =
    await Promise.all([
      supabase.from("task_statuses").select("id").eq("name", "완료").maybeSingle(),
      supabase
        .from("tasks")
        .select("id, assignee_id, body, status_id, due_date, created_at")
        .is("parent_id", null)
        .gte("due_date", start)
        .lte("due_date", end),
      supabase
        .from("task_comments")
        .select("author_id")
        .gte("created_at", startTimestamp)
        .lte("created_at", endTimestamp),
    ]);

  if (tasksError) console.error(tasksError);

  const taskIds = (periodTasks ?? []).map((task) => task.id);

  const { data: subtasks } =
    taskIds.length === 0
      ? { data: [] as { parent_id: string | null }[] }
      : await supabase.from("tasks").select("parent_id").in("parent_id", taskIds);

  const subtaskCountByParent = new Map<string, number>();
  (subtasks ?? []).forEach((row) => {
    if (!row.parent_id) return;
    subtaskCountByParent.set(row.parent_id, (subtaskCountByParent.get(row.parent_id) ?? 0) + 1);
  });

  const { data: trackedCompletions } = doneStatus
    ? await supabase
        .from("status_history")
        .select("task_id, created_at, tasks!inner(assignee_id, due_date, created_at)")
        .eq("status_id", doneStatus.id)
        .gte("created_at", startTimestamp)
        .lte("created_at", endTimestamp)
    : { data: [] };

  // 같은 일정이 기간 안에서 완료→재오픈→완료를 반복하면 "완료" 전환이 여러 번 기록된다.
  // 일정당 가장 최근 완료 한 건만 표본으로 남겨, 한 일정이 준수율 분모와 평균 소요 시간에 중복으로 들어가지 않게 한다.
  const latestCompletionByTask = new Map<
    string,
    {
      created_at: string;
      tasks: { assignee_id: string | null; due_date: string | null; created_at: string };
    }
  >();
  (
    (trackedCompletions ?? []) as unknown as Array<{
      task_id: string;
      created_at: string;
      tasks: { assignee_id: string | null; due_date: string | null; created_at: string };
    }>
  ).forEach((row) => {
    const existing = latestCompletionByTask.get(row.task_id);
    if (!existing || row.created_at > existing.created_at) {
      latestCompletionByTask.set(row.task_id, row);
    }
  });
  const uniqueCompletions = Array.from(latestCompletionByTask.values());

  return profiles.map((profile) => {
    const assignedTasks = (periodTasks ?? []).filter((task) => task.assignee_id === profile.id);
    const completedCount = assignedTasks.filter((task) => task.status_id === doneStatus?.id).length;
    const bodyFilledCount = assignedTasks.filter((task) => !!task.body?.trim()).length;
    const hasSubtaskCount = assignedTasks.filter(
      (task) => (subtaskCountByParent.get(task.id) ?? 0) > 0
    ).length;
    const commentCount = (comments ?? []).filter(
      (comment) => comment.author_id === profile.id
    ).length;

    const memberTrackedCompletions = uniqueCompletions.filter(
      (row) => row.tasks.assignee_id === profile.id
    );

    // 마감일 준수율은 마감일이 있는 완료 건만 대상으로 한다. 마감일이 없는 일정은 지킬 기한이 없어
    // 분자(onTimeCount)에도 분모(dueDateTrackedCount)에도 넣지 않는다.
    const dueDateTrackedCompletions = memberTrackedCompletions.filter(
      (row) => !!row.tasks.due_date
    );
    const onTimeCount = dueDateTrackedCompletions.filter((row) => {
      // due_date는 날짜만 있고 완료 기록은 타임스탬프라, KST 기준 마감일 당일 끝까지는 기한 내로 본다.
      const dueDateEnd = new Date(`${row.tasks.due_date}T23:59:59+09:00`);
      return !isAfter(new Date(row.created_at), dueDateEnd);
    }).length;

    const completionDays = memberTrackedCompletions.map((row) =>
      differenceInCalendarDays(new Date(row.created_at), new Date(row.tasks.created_at))
    );
    const avgCompletionDays =
      completionDays.length === 0
        ? null
        : Math.round(
            (completionDays.reduce((sum, days) => sum + days, 0) / completionDays.length) * 10
          ) / 10;

    return {
      profile,
      totalAssigned: assignedTasks.length,
      completedCount,
      completionRate:
        assignedTasks.length === 0
          ? null
          : Math.round((completedCount / assignedTasks.length) * 100),
      bodyFilledCount,
      hasSubtaskCount,
      commentCount,
      trackedCompletionCount: memberTrackedCompletions.length,
      onTimeCount,
      onTimeRate:
        dueDateTrackedCompletions.length === 0
          ? null
          : Math.round((onTimeCount / dueDateTrackedCompletions.length) * 100),
      avgCompletionDays,
    };
  });
};
