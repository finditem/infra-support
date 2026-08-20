type ProfilesWritable = {
  name: string;
  created_at: string | null;
  registered_at: string | null;
};

export interface ProfilesRow extends ProfilesWritable {
  id: string;
}

export type ProfilesInsert = Omit<ProfilesWritable, "created_at" | "registered_at"> & {
  id: string;
  created_at?: string | null;
  registered_at?: string | null;
};

export type ProfilesUpdate = Partial<ProfilesWritable>;
