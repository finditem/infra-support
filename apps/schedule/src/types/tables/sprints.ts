type SprintsWritable = {
  name: string;
  start_date: string;
  end_date: string;
  created_at: string | null;
};

export interface SprintsRow extends SprintsWritable {
  id: string;
}

export type SprintsInsert = Omit<SprintsWritable, "created_at"> & {
  id?: string;
  created_at?: string | null;
};

export type SprintsUpdate = Partial<SprintsWritable>;
