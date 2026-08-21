"use server";

import { createClient } from "@/lib/supabase/server";
import type { WeeksRow, WeeksUpdate } from "@/types/tables";

export const updateWeekSprintName = async (
  weekId: string,
  sprintName: string | null
): Promise<WeeksRow | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("weeks")
    .update({ sprint_name: sprintName } satisfies WeeksUpdate)
    .eq("id", weekId)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
};
