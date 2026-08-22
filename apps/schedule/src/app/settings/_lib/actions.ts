"use server";

import { createClient } from "@/lib/supabase/server";
import type { SprintsInsert, SprintsRow } from "@/types/tables";

interface CreateSprintInput {
  name: string;
  startDate: string;
  endDate: string;
}

export const createSprint = async ({
  name,
  startDate,
  endDate,
}: CreateSprintInput): Promise<SprintsRow | null> => {
  const supabase = await createClient();

  const insertPayload: SprintsInsert = {
    name,
    start_date: startDate,
    end_date: endDate,
  };

  const { data, error } = await supabase.from("sprints").insert(insertPayload).select("*").single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
};
