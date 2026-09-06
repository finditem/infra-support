import { addDays, format } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SprintsRow, WeeksRow } from "@/types/tables";
import { getIsoWeekKey } from "./kanbanUtils";
import {
  flattenEmbeddedTasks,
  TASK_EMBED_SELECT,
  type EmbeddedTaskRow,
  type FlattenedTasks,
} from "./taskEmbed";

/**
 * 주어진 주(월요일 기준)에 해당하는 weeks 행을 조회하고, 없으면 새로 생성한다.
 */
export const getOrCreateWeek = async (
  supabase: SupabaseClient,
  weekStart: Date
): Promise<WeeksRow | null> => {
  const { year, weekNumber } = getIsoWeekKey(weekStart);

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
 * 해당 주차의 상위 일정과, 상태 집계에 필요한 모든 하위 일정, 그리고 그 일정들의 댓글을 한 번에 가져온다.
 * 하위 일정은 자체 마감 주차와 관계없이 상위 카드의 개수와 상태 계산에 포함한다.
 *
 * 주차는 weeks를 inner join으로 걸러 특정하므로, 호출하는 쪽에서 weeks 행 조회가 끝나기를
 * 기다리지 않고 다른 조회와 나란히 실행할 수 있다.
 */
export const getWeekBoard = async (
  supabase: SupabaseClient,
  weekStart: Date
): Promise<FlattenedTasks> => {
  const { year, weekNumber } = getIsoWeekKey(weekStart);

  const { data, error } = await supabase
    .from("tasks")
    .select(`*, weeks!inner(year, week_number), ${TASK_EMBED_SELECT}`)
    .eq("weeks.year", year)
    .eq("weeks.week_number", weekNumber)
    .is("parent_id", null)
    .order("created_at")
    .order("created_at", { referencedTable: "subtasks" });

  if (error) {
    console.error(error);
    return { tasks: [], comments: [] };
  }

  return flattenEmbeddedTasks((data ?? []) as EmbeddedTaskRow[]);
};

/**
 * 일정 상세 화면에 필요한 상위 일정과 그 하위 일정, 양쪽의 댓글을 한 번에 가져온다.
 * 첫 번째 원소가 상위 일정이고 나머지가 하위 일정이다.
 *
 * 하위 일정과 댓글이 상위 일정 조회 결과를 기다리지 않도록, id 하나로 임베드해서 받아온다.
 */
export const getTaskWithSubtasks = async (
  supabase: SupabaseClient,
  taskId: string
): Promise<FlattenedTasks> => {
  const { data, error } = await supabase
    .from("tasks")
    .select(`*, ${TASK_EMBED_SELECT}`)
    .eq("id", taskId)
    .order("created_at", { referencedTable: "subtasks" })
    .maybeSingle();

  if (error) {
    console.error(error);
    return { tasks: [], comments: [] };
  }

  return flattenEmbeddedTasks(data ? [data as EmbeddedTaskRow] : []);
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
