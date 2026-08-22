type ProfilesWritable = {
  name: string;
  created_at: string | null;
  registered_at: string | null;
  color: string;
  slack_user_id: string | null;
};

export interface ProfilesRow extends ProfilesWritable {
  id: string;
}

export type ProfilesInsert = Omit<
  ProfilesWritable,
  "created_at" | "registered_at" | "color" | "slack_user_id"
> & {
  id: string;
  created_at?: string | null;
  registered_at?: string | null;
  color?: string;
  slack_user_id?: string | null;
};

export type ProfilesUpdate = Partial<ProfilesWritable>;
