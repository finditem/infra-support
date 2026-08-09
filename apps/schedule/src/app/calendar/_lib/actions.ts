"use server";

import { createClient } from "@/lib/supabase/server";
import type { AvailabilityInsert, AvailabilityRow } from "@/types/tables";

interface CreateAvailabilityInput {
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const createAvailability = async ({
  userId,
  date,
  startTime,
  endTime,
}: CreateAvailabilityInput): Promise<AvailabilityRow | null> => {
  const supabase = await createClient();

  const insertPayload: AvailabilityInsert = {
    user_id: userId,
    available_date: date,
    start_time: startTime,
    end_time: endTime,
  };

  const { data, error } = await supabase
    .from("availability")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
};

export const deleteAvailability = async (id: string): Promise<boolean> => {
  const supabase = await createClient();
  const { error } = await supabase.from("availability").delete().eq("id", id);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
};
