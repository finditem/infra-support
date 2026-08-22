type TaskCommentMentionsWritable = {
  comment_id: string;
  mentioned_profile_id: string;
  created_at: string | null;
};

export interface TaskCommentMentionsRow extends TaskCommentMentionsWritable {
  id: string;
}

export type TaskCommentMentionsInsert = Omit<TaskCommentMentionsWritable, "created_at"> & {
  id?: string;
  created_at?: string | null;
};

export type TaskCommentMentionsUpdate = Partial<TaskCommentMentionsWritable>;
