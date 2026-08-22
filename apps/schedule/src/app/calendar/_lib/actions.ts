"use server";

import { createClient } from "@/lib/supabase/server";
import type { AvailabilityInsert, AvailabilityRow } from "@/types/tables";
import { rangesOverlap } from "./time";

interface CreateAvailabilityInput {
  /** 가능 시간을 등록할 팀원. 팀을 고른 경우 소속 팀원으로 펼쳐진 뒤 넘어온다. */
  userIds: string[];
  /** 반복을 펼친 "yyyy-MM-dd" 날짜 목록. 반복이 없으면 하루만 들어온다. */
  dates: string[];
  startTime: string;
  endTime: string;
}

interface CreateAvailabilityResult {
  data: AvailabilityRow[];
  /** 이미 등록된 시간대와 겹쳐 등록하지 않은 건수. */
  skippedCount: number;
  hasError: boolean;
}

// exclusion_violation: DB의 availability_no_overlap 제약(0003_availability_no_overlap.sql)이
// 같은 사용자의 겹치는 시간대 등록을 막을 때 발생한다.
const EXCLUSION_VIOLATION_CODE = "23P01";

const EMPTY_RESULT: CreateAvailabilityResult = { data: [], skippedCount: 0, hasError: false };

/**
 * 대상 팀원 × 반복 날짜만큼 가능 시간을 한 번에 등록한다.
 *
 * 이미 등록된 시간대와 겹치는 조합은 등록하지 않고 건너뛴 개수만 돌려준다. 여러 건을 한 문장으로
 * 넣기 때문에 한 건이라도 DB의 겹침 제약에 걸리면 나머지까지 함께 실패하는데, 반복 등록에서는
 * 이미 잡아둔 날짜가 하나 섞이는 일이 흔해 전부 실패시키는 대신 그 조합만 빼는 편이 낫다.
 *
 * 날짜가 둘 이상이면 함께 만들어진 행에 같은 recurrence_group_id를 부여해 이후 묶음 삭제에 쓴다.
 */
export const createAvailability = async ({
  userIds,
  dates,
  startTime,
  endTime,
}: CreateAvailabilityInput): Promise<CreateAvailabilityResult> => {
  if (userIds.length === 0 || dates.length === 0) return EMPTY_RESULT;

  const supabase = await createClient();
  const sortedDates = [...dates].sort();

  const { data: existing } = await supabase
    .from("availability")
    .select("user_id, available_date, start_time, end_time")
    .in("user_id", userIds)
    .gte("available_date", sortedDates[0])
    .lte("available_date", sortedDates[sortedDates.length - 1]);

  const hasOverlap = (userId: string, date: string) =>
    (existing ?? []).some(
      (block) =>
        block.user_id === userId &&
        block.available_date === date &&
        rangesOverlap(startTime, endTime, block.start_time, block.end_time)
    );

  const recurrenceGroupId = sortedDates.length > 1 ? crypto.randomUUID() : null;
  const insertPayload: AvailabilityInsert[] = userIds.flatMap((userId) =>
    sortedDates
      .filter((date) => !hasOverlap(userId, date))
      .map((date) => ({
        user_id: userId,
        available_date: date,
        start_time: startTime,
        end_time: endTime,
        recurrence_group_id: recurrenceGroupId,
      }))
  );

  const skippedCount = userIds.length * sortedDates.length - insertPayload.length;

  if (insertPayload.length === 0) return { data: [], skippedCount, hasError: false };

  const { data, error } = await supabase.from("availability").insert(insertPayload).select("*");

  if (error) {
    console.error(error);

    // 겹침 검사와 저장 사이에 다른 사람이 같은 시간대를 등록한 경우다. 다시 시도하면 그 조합만 걸러진다.
    return {
      data: [],
      skippedCount: error.code === EXCLUSION_VIOLATION_CODE ? skippedCount : 0,
      hasError: true,
    };
  }

  return { data: data ?? [], skippedCount, hasError: false };
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

/**
 * 한 팀원의 반복 묶음 중 기준일 이후(기준일 포함) 블록을 모두 지우고 지워진 id를 돌려준다.
 * 여러 팀원을 대상으로 등록한 반복도 묶음 id는 하나라, 클릭한 블록의 주인만 지우도록 user_id로 좁힌다.
 * 실패하면 빈 배열을 돌려주므로 호출한 쪽 화면은 그대로 남는다.
 */
export const deleteAvailabilitySeries = async (
  recurrenceGroupId: string,
  userId: string,
  fromDate: string
): Promise<string[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability")
    .delete()
    .eq("recurrence_group_id", recurrenceGroupId)
    .eq("user_id", userId)
    .gte("available_date", fromDate)
    .select("id");

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map((row) => row.id as string);
};
