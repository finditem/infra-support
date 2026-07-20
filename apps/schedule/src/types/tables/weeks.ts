type WeeksWritable = {
  year: number;
  week_number: number;
  start_date: string;
  end_date: string;
  created_at: string | null;
};

export interface WeeksRow extends WeeksWritable {
  id: string;
}

export type WeeksInsert = Omit<WeeksWritable, "created_at"> & {
  id?: string;
  created_at?: string | null;
};

export type WeeksUpdate = Partial<WeeksWritable>;
