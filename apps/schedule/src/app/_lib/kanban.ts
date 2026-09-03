import { addDays, format, getISOWeek, getISOWeekYear } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SprintsRow, TaskCommentsRow, TasksRow, WeeksRow } from "@/types/tables";

/**
 * 주어진 주(월요일 기준)에 해당하는 weeks 행을 조회하고, 없으면 새로 생성한다.
 */
export const getOrCreateWeek = async (
  supabase: SupabaseClient,
  weekStart: Date
): Promise<WeeksRow | null> => {
  const year = getISOWeekYear(weekStart);
  const weekNumber = getISOWeek(weekStart);

  let existing: WeeksRow | null = null;

  // 일시적인 조회 실패로 이미 존재하는 주차를 놓치지 않도록 한 번 더 조회한다.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data, error } = await supabase
      .from("weeks")
      .select("*")
      .eq("year", year)
      .eq("week_number", weekNumber)
      .maybeSingle();

    if (!error) {
      existing = data;
      break;
    }

    console.error(error);
    if (attempt === 1) return null;
  }

  if (existing) return existing;

  const { data: created, error: insertError } = await supabase
    .from("weeks")
    .insert({
      year,
      week_number: weekNumber,
      start_date: format(weekStart, "yyyy-MM-dd"),
      end_date: format(addDays(weekStart, 6), "yyyy-MM-dd"),
    })
    .select("*")
    .single();

  if (insertError) {
    // 동시 요청이 같은 주차를 먼저 만들었다면 unique(year, week_number) 위반이 나므로,
    // 실패로 보지 않고 방금 생성된 행을 다시 조회해 반환한다.
    if (insertError.code === "23505") {
      const { data: existingAfterConflict, error: refetchError } = await supabase
        .from("weeks")
        .select("*")
        .eq("year", year)
        .eq("week_number", weekNumber)
        .maybeSingle();

      if (refetchError) {
        console.error(refetchError);
        return null;
      }

      return existingAfterConflict;
    }

    console.error(insertError);
    return null;
  }

  return created;
};

/**
 * 여러 일정의 댓글을 한 번의 쿼리로 가져온다.
 *
 * 칸반 카드마다 개수를 세려고 일정별로 조회하면 곧바로 N+1이 되므로,
 * 페이지 서버 컴포넌트에서 화면에 필요한 일정 전체를 묶어 한 번만 조회한다.
 */
export const getCommentsForTasks = async (
  supabase: SupabaseClient,
  taskIds: string[]
): Promise<TaskCommentsRow[]> => {
  if (taskIds.length === 0) return [];

  const { data, error } = await supabase
    .from("task_comments")
    .select("*")
    .in("task_id", taskIds)
    .order("created_at");

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
};

/**
 * 해당 주차의 상위 일정과 상태 집계에 필요한 모든 하위 일정을 가져온다.
 * 하위 일정은 자체 마감 주차와 관계없이 상위 카드의 개수와 상태 계산에 포함한다.
 */
export const getTasksForWeek = async (
  supabase: SupabaseClient,
  weekId: string
): Promise<TasksRow[]> => {
  const { data: rootTasks, error: rootError } = await supabase
    .from("tasks")
    .select("*")
    .eq("week_id", weekId)
    .is("parent_id", null)
    .order("created_at");

  if (rootError) {
    console.error(rootError);
    return [];
  }

  if (!rootTasks || rootTasks.length === 0) return [];

  const { data: childTasks, error: childError } = await supabase
    .from("tasks")
    .select("*")
    .in(
      "parent_id",
      rootTasks.map((task) => task.id)
    )
    .order("created_at");

  if (childError) {
    console.error(childError);
    return rootTasks;
  }

  return [...rootTasks, ...(childTasks ?? [])];
};

/**
 * 주어진 주(월요일 기준) 시작일이 속하는 스프린트를 기간(start_date~end_date) 기준으로 조회한다.
 */
export const getSprintForWeek = async (
  supabase: SupabaseClient,
  weekStart: Date
): Promise<SprintsRow | null> => {
  const weekStartDate = format(weekStart, "yyyy-MM-dd");

  const { data } = await supabase
    .from("sprints")
    .select("*")
    .lte("start_date", weekStartDate)
    .gte("end_date", weekStartDate)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
};
