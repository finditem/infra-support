"use server";

import { createClient } from "@/lib/supabase/server";
import type { AvailabilityInsert, AvailabilityRow } from "@/types/tables";

interface CreateAvailabilityInput {
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface CreateAvailabilityResult {
  data: AvailabilityRow | null;
  isOverlap: boolean;
}

// exclusion_violation: DB의 availability_no_overlap 제약(0003_availability_no_overlap.sql)이
// 같은 사용자의 겹치는 시간대 등록을 막을 때 발생한다.
const EXCLUSION_VIOLATION_CODE = "23P01";

export const createAvailability = async ({
  userId,
  date,
  startTime,
  endTime,
}: CreateAvailabilityInput): Promise<CreateAvailabilityResult> => {
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
    return { data: null, isOverlap: error.code === EXCLUSION_VIOLATION_CODE };
  }

  return { data, isOverlap: false };
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
