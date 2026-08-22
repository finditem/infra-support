"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  TaskCommentMentionsInsert,
  TaskCommentsInsert,
  TaskCommentsRow,
} from "@/types/tables";

/**
 * 멘션 관계 테이블을 본문 기준으로 맞춘다. 수정 시에는 기존 행을 지우고 다시 넣어 동기화한다.
 * 댓글 자체는 이미 저장된 상태이므로, 여기서 실패해도 댓글 저장은 성공으로 처리하고 로그만 남긴다.
 */
const syncCommentMentions = async (commentId: string, mentionedProfileIds: string[]) => {
  const supabase = await createClient();
  const uniqueIds = Array.from(new Set(mentionedProfileIds));

  const { error: deleteError } = await supabase
    .from("task_comment_mentions")
    .delete()
    .eq("comment_id", commentId);

  if (deleteError) {
    console.error(deleteError);
    return;
  }

  if (uniqueIds.length === 0) return;

  const insertPayload: TaskCommentMentionsInsert[] = uniqueIds.map((mentionedProfileId) => ({
    comment_id: commentId,
    mentioned_profile_id: mentionedProfileId,
  }));

  const { error: insertError } = await supabase.from("task_comment_mentions").insert(insertPayload);

  if (insertError) {
    console.error(insertError);
  }
};

interface CreateCommentInput {
  taskId: string;
  body: string;
  mentionedProfileIds: string[];
}

export const createComment = async ({
  taskId,
  body,
  mentionedProfileIds,
}: CreateCommentInput): Promise<TaskCommentsRow | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error(new Error("댓글을 작성하려면 로그인이 필요합니다."));
    return null;
  }

  const insertPayload: TaskCommentsInsert = {
    task_id: taskId,
    author_id: user.id,
    body,
  };

  const { data, error } = await supabase
    .from("task_comments")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  await syncCommentMentions(data.id, mentionedProfileIds);

  return data;
};

interface UpdateCommentInput {
  id: string;
  body: string;
  mentionedProfileIds: string[];
}

/**
 * RLS는 로그인 사용자 전체 접근을 허용하므로, 작성자 본인만 수정할 수 있다는 제약은
 * author_id 조건으로 쿼리 자체에서 강제한다. 남의 댓글이면 대상 행이 없어 null이 반환된다.
 */
export const updateComment = async ({
  id,
  body,
  mentionedProfileIds,
}: UpdateCommentInput): Promise<TaskCommentsRow | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error(new Error("댓글을 수정하려면 로그인이 필요합니다."));
    return null;
  }

  const { data, error } = await supabase
    .from("task_comments")
    .update({ body })
    .eq("id", id)
    .eq("author_id", user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data) {
    console.error(new Error("수정할 댓글을 찾지 못했거나 작성자가 아닙니다."));
    return null;
  }

  await syncCommentMentions(data.id, mentionedProfileIds);

  return data;
};

/** 멘션 행은 comment_id 외래키의 on delete cascade로 함께 지워진다. */
export const deleteComment = async ({ id }: { id: string }): Promise<boolean> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error(new Error("댓글을 삭제하려면 로그인이 필요합니다."));
    return false;
  }

  const { data, error } = await supabase
    .from("task_comments")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return false;
  }

  if (!data) {
    console.error(new Error("삭제할 댓글을 찾지 못했거나 작성자가 아닙니다."));
    return false;
  }

  return true;
};
