"use server";

import { createClient } from "@/lib/supabase/server";
import type { SprintsInsert, SprintsRow, SprintsUpdate } from "@/types/tables";

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

interface UpdateSprintInput {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export const updateSprint = async ({
  id,
  name,
  startDate,
  endDate,
}: UpdateSprintInput): Promise<SprintsRow | null> => {
  const supabase = await createClient();

  const updatePayload: SprintsUpdate = {
    name,
    start_date: startDate,
    end_date: endDate,
  };

  const { data, error } = await supabase
    .from("sprints")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
};

export const deleteSprint = async (id: string): Promise<boolean> => {
  const supabase = await createClient();
  const { error } = await supabase.from("sprints").delete().eq("id", id);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
};
