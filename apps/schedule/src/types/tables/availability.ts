type AvailabilityWritable = {
  user_id: string;
  available_date: string;
  start_time: string;
  end_time: string;
  created_at: string | null;
};

export interface AvailabilityRow extends AvailabilityWritable {
  id: string;
}

export type AvailabilityInsert = Omit<AvailabilityWritable, "created_at"> & {
  id?: string;
  created_at?: string | null;
};

export type AvailabilityUpdate = Partial<AvailabilityWritable>;
