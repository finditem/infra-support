import { addDays, format, getISOWeek, getISOWeekYear } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SprintsRow, WeeksRow } from "@/types/tables";

/**
 * 주어진 주(월요일 기준)에 해당하는 weeks 행을 조회하고, 없으면 새로 생성한다.
 */
export const getOrCreateWeek = async (
  supabase: SupabaseClient,
  weekStart: Date
): Promise<WeeksRow | null> => {
  const year = getISOWeekYear(weekStart);
  const weekNumber = getISOWeek(weekStart);

  const { data: existing } = await supabase
    .from("weeks")
    .select("*")
    .eq("year", year)
    .eq("week_number", weekNumber)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("weeks")
    .insert({
      year,
      week_number: weekNumber,
      start_date: format(weekStart, "yyyy-MM-dd"),
      end_date: format(addDays(weekStart, 6), "yyyy-MM-dd"),
    })
    .select("*")
    .single();

  if (error) {
    return null;
  }

  return created;
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
