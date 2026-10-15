import { differenceInCalendarDays, endOfDay, format, isAfter, startOfDay, subDays } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfilesRow } from "@/types/tables";

export type ReportRange = "week" | "month" | "quarter";

const RANGE_DAYS: Record<ReportRange, number> = { week: 7, month: 30, quarter: 90 };

export const isReportRange = (value: string): value is ReportRange => value in RANGE_DAYS;

/**
 * 오늘을 끝으로 하는 롤링 기간. 기획서/스프린트 주차와는 독립적으로, 선택한 기간만큼의 최근 날짜를 본다.
 * end는 tasks.due_date(date 타입) 비교용 날짜 문자열이고, endTimestamp는 task_comments/status_history의
 * created_at(timestamptz) 비교용으로 당일 끝 시각까지 포함한다 — 날짜 문자열만 쓰면 당일 자정 이전,
 * 즉 end 당일 기록이 전부 빠진다.
 */
export const getReportPeriod = (range: ReportRange, today: Date = new Date()) => {
  const end = startOfDay(today);
  const start = subDays(end, RANGE_DAYS[range] - 1);
  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
    endTimestamp: endOfDay(end).toISOString(),
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
  const { start, end, endTimestamp } = getReportPeriod(range);

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
        .gte("created_at", start)
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
        .gte("created_at", start)
        .lte("created_at", endTimestamp)
    : { data: [] };

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

    const memberTrackedCompletions = (
      (trackedCompletions ?? []) as unknown as Array<{
        created_at: string;
        tasks: { assignee_id: string | null; due_date: string | null; created_at: string };
      }>
    ).filter((row) => row.tasks.assignee_id === profile.id);

    const onTimeCount = memberTrackedCompletions.filter((row) => {
      if (!row.tasks.due_date) return false;
      // due_date는 날짜만 있고 완료 기록은 타임스탬프라, 마감일 당일 끝까지는 기한 내로 본다.
      const dueDateEnd = new Date(`${row.tasks.due_date}T23:59:59`);
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
        memberTrackedCompletions.length === 0
          ? null
          : Math.round((onTimeCount / memberTrackedCompletions.length) * 100),
      avgCompletionDays,
    };
  });
};
