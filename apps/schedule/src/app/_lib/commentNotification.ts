import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyCommentMention } from "@/lib/slack";
import type { SlackNotificationProfile } from "@/lib/slack";
import type { TaskCommentsRow } from "@/types/tables";
import { loadNotificationProfileMap, toNotificationProfile } from "./notificationProfiles";
import { loadParentTitle } from "./parentTaskTitle";
import { buildTaskUrl } from "./taskUrl";

/** 알림 메시지에 필요한 일정 컬럼만 읽는다. */
interface CommentTaskRow {
  id: string;
  title: string;
  parent_id: string | null;
}

const loadCommentTask = async (
  supabase: SupabaseClient,
  taskId: string
): Promise<CommentTaskRow | null> => {
  const { data } = await supabase
    .from("tasks")
    .select("id, title, parent_id")
    .eq("id", taskId)
    .maybeSingle();

  return data ?? null;
};

/**
 * 댓글에서 새로 언급된 팀원에게 개인 DM을 보낸다. 대상은 `task_comment_mentions`에 이번에 추가된 행
 * 기준이라, 댓글을 수정해도 이미 언급되어 있던 사람에게 DM이 다시 가지 않는다.
 * 전송 실패가 댓글 저장을 되돌리면 안 되므로 예외는 여기서 로그로 흡수한다.
 */
export const notifyCommentMentions = async (
  supabase: SupabaseClient,
  comment: TaskCommentsRow,
  mentionedProfileIds: string[]
) => {
  try {
    // 자기 자신을 언급한 경우는 DM을 보낼 필요가 없다.
    const targetIds = mentionedProfileIds.filter((id) => id !== comment.author_id);

    if (targetIds.length === 0) return;

    const [task, profileMap] = await Promise.all([
      loadCommentTask(supabase, comment.task_id),
      loadNotificationProfileMap(supabase, [...targetIds, comment.author_id]),
    ]);

    if (!task) return;

    const mentioned = targetIds
      .map((id) => toNotificationProfile(profileMap.get(id)))
      .filter((profile): profile is SlackNotificationProfile => !!profile);

    if (mentioned.length === 0) return;

    await notifyCommentMention({
      taskTitle: task.title,
      parentTitle: await loadParentTitle(supabase, task.parent_id),
      author: toNotificationProfile(profileMap.get(comment.author_id)),
      mentioned,
      body: comment.body,
      url: buildTaskUrl(task),
    });
  } catch (error) {
    console.error("댓글 언급 Slack DM 실패", error);
  }
};
