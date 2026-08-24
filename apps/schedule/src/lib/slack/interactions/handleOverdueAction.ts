import { addWeeks, format, parseISO } from "date-fns";
import { notifyTaskUpdated } from "@/app/_lib/taskNotification";
import { createServiceClient } from "@/lib/supabase/service";
import { escapeSlackText } from "../escapeSlackText";
import { postToResponseUrl } from "../postToResponseUrl";
import { resolveProfileFromSlackUser } from "../resolveProfileFromSlackUser";

interface HandleOverdueActionParams {
  actionId: string;
  taskId: string;
  slackUserId: string;
  responseUrl: string;
}

/** 5-5 DM의 "완료로 변경"/"다음주로 미루기" 버튼 클릭을 처리한다. */
export const handleOverdueAction = async ({
  actionId,
  taskId,
  slackUserId,
  responseUrl,
}: HandleOverdueActionParams) => {
  const supabase = createServiceClient();

  const { data: before } = await supabase.from("tasks").select("*").eq("id", taskId).maybeSingle();

  if (!before) {
    await postToResponseUrl({ responseUrl, text: "⚠️ 이미 삭제되었거나 찾을 수 없는 일정이에요." });
    return;
  }

  const actorProfile = await resolveProfileFromSlackUser(slackUserId);

  if (actionId === "overdue_complete") {
    const { data: status } = await supabase
      .from("task_statuses")
      .select("id")
      .eq("name", "완료")
      .maybeSingle();

    if (!status) {
      await postToResponseUrl({ responseUrl, text: "⚠️ 완료 상태를 찾을 수 없어요." });
      return;
    }

    const { data: after, error } = await supabase
      .from("tasks")
      .update({ status_id: status.id })
      .eq("id", taskId)
      .select("*")
      .single();

    if (error || !after) {
      console.error("Slack 인터랙션 완료 처리 실패", error);
      await postToResponseUrl({ responseUrl, text: "⚠️ 상태 변경 중 오류가 발생했어요." });
      return;
    }

    await notifyTaskUpdated(supabase, before, after, actorProfile?.id ?? null);
    await postToResponseUrl({
      responseUrl,
      text: `✅ *${escapeSlackText(after.title)}*을(를) 완료로 변경했어요!`,
    });
    return;
  }

  if (actionId === "overdue_postpone") {
    if (!before.due_date) {
      await postToResponseUrl({ responseUrl, text: "⚠️ 마감일이 없어 미룰 수 없어요." });
      return;
    }

    const nextDueDate = format(addWeeks(parseISO(before.due_date), 1), "yyyy-MM-dd");

    const { data: after, error } = await supabase
      .from("tasks")
      .update({ due_date: nextDueDate })
      .eq("id", taskId)
      .select("*")
      .single();

    if (error || !after) {
      console.error("Slack 인터랙션 마감일 연기 실패", error);
      await postToResponseUrl({ responseUrl, text: "⚠️ 마감일 변경 중 오류가 발생했어요." });
      return;
    }

    await notifyTaskUpdated(supabase, before, after, actorProfile?.id ?? null);
    await postToResponseUrl({
      responseUrl,
      text: `📅 *${escapeSlackText(after.title)}*을(를) ${nextDueDate}로 미뤘어요!`,
    });
  }
};
