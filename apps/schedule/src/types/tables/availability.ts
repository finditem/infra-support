type AvailabilityWritable = {
  user_id: string;
  available_date: string;
  start_time: string;
  end_time: string;
  /** 한 번의 반복 등록으로 함께 만들어진 행을 묶는 식별자. 반복 없이 등록하면 null이다. */
  recurrence_group_id: string | null;
  created_at: string | null;
};

export interface AvailabilityRow extends AvailabilityWritable {
  id: string;
}

export type AvailabilityInsert = Omit<
  AvailabilityWritable,
  "recurrence_group_id" | "created_at"
> & {
  id?: string;
  recurrence_group_id?: string | null;
  created_at?: string | null;
};

export type AvailabilityUpdate = Partial<AvailabilityWritable>;
