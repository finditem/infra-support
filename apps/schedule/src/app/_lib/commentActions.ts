"use server";

import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type {
  TaskCommentMentionsInsert,
  TaskCommentsInsert,
  TaskCommentsRow,
} from "@/types/tables";
import { notifyCommentMentions } from "./commentNotification";
import { buildMentionTargets, parseMentions, resolveMentionProfiles } from "./mentions";
import { getRegisteredProfiles } from "./profiles";
import { getTeamsWithMembers } from "./teams";

/**
 * 본문의 "@슬러그"를 언급 대상으로 풀어 profile id를 뽑는다. 팀 언급은 소속 팀원까지 펼친다.
 *
 * 판정을 클라이언트가 아니라 서버에서 하는 이유는, 이 값이 DM 발송 대상이 되기 때문이다.
 * 클라이언트가 보낸 id를 그대로 믿으면 로그인한 팀원이 서버 액션을 직접 호출해
 * 본문에 언급하지도 않은 사람에게 DM을 보낼 수 있다.
 * 자동완성과 본문 강조는 클라이언트가 같은 함수로 따로 계산하며, 판정 규칙이 동일해 결과도 같다.
 */
const resolveMentionedProfileIds = async (supabase: SupabaseClient, body: string) => {
  const profiles = await getRegisteredProfiles(supabase);
  const teams = await getTeamsWithMembers(supabase, profiles);
  const targets = buildMentionTargets(teams, profiles);

  return resolveMentionProfiles(parseMentions(body, targets)).map((profile) => profile.id);
};

/**
 * 멘션 관계 테이블을 본문 기준으로 맞춘다. 수정 시에는 기존 행을 지우고 다시 넣어 동기화한다.
 * 댓글 자체는 이미 저장된 상태이므로, 여기서 실패해도 댓글 저장은 성공으로 처리하고 로그만 남긴다.
 *
 * 이번에 새로 추가된 멘션의 profile id를 돌려준다. 알림 대상을 여기서 정하는 이유는,
 * 삭제 후 재삽입이라 저장이 끝난 뒤에는 "원래 있던 멘션"과 "이번에 생긴 멘션"을 구분할 수 없기 때문이다.
 * 이 구분이 없으면 댓글을 고칠 때마다 기존 멘션 대상 전원에게 DM이 다시 간다.
 */
const syncCommentMentions = async (
  supabase: SupabaseClient,
  commentId: string,
  mentionedProfileIds: string[]
): Promise<string[]> => {
  const uniqueIds = Array.from(new Set(mentionedProfileIds));

  const { data: existing, error: selectError } = await supabase
    .from("task_comment_mentions")
    .select("mentioned_profile_id")
    .eq("comment_id", commentId);

  if (selectError) {
    console.error(selectError);
    return [];
  }

  const existingIds = new Set(
    (existing ?? []).map((row: { mentioned_profile_id: string }) => row.mentioned_profile_id)
  );
  const addedIds = uniqueIds.filter((id) => !existingIds.has(id));

  const { error: deleteError } = await supabase
    .from("task_comment_mentions")
    .delete()
    .eq("comment_id", commentId);

  if (deleteError) {
    console.error(deleteError);
    return [];
  }

  if (uniqueIds.length === 0) return [];

  const insertPayload: TaskCommentMentionsInsert[] = uniqueIds.map((mentionedProfileId) => ({
    comment_id: commentId,
    mentioned_profile_id: mentionedProfileId,
  }));

  const { error: insertError } = await supabase.from("task_comment_mentions").insert(insertPayload);

  if (insertError) {
    console.error(insertError);
    return [];
  }

  return addedIds;
};

interface CreateCommentInput {
  taskId: string;
  body: string;
}

export const createComment = async ({
  taskId,
  body,
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

  const addedProfileIds = await syncCommentMentions(
    supabase,
    data.id,
    await resolveMentionedProfileIds(supabase, body)
  );

  // Slack DM은 응답을 반환한 뒤에 보낸다. 전송이 느려도 댓글 등록 응답이 지연되지 않는다.
  after(() => notifyCommentMentions(supabase, data, addedProfileIds));

  return data;
};

interface UpdateCommentInput {
  id: string;
  body: string;
}

/**
 * RLS는 로그인 사용자 전체 접근을 허용하므로, 작성자 본인만 수정할 수 있다는 제약은
 * author_id 조건으로 쿼리 자체에서 강제한다. 남의 댓글이면 대상 행이 없어 null이 반환된다.
 */
export const updateComment = async ({
  id,
  body,
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

  const addedProfileIds = await syncCommentMentions(
    supabase,
    data.id,
    await resolveMentionedProfileIds(supabase, body)
  );

  // 수정으로 새로 생긴 멘션만 대상이라, 원래 언급되어 있던 사람에게는 DM이 다시 가지 않는다.
  after(() => notifyCommentMentions(supabase, data, addedProfileIds));

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
