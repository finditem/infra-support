import { addDays, format, getISOWeek, getISOWeekYear } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { WeeksRow } from "@/types/tables";

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
