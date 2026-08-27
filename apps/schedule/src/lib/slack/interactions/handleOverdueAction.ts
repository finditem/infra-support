import { addWeeks, endOfWeek, format, startOfToday } from "date-fns";
import { getOrCreateWeek } from "@/app/_lib/kanban";
import { notifyTaskUpdated } from "@/app/_lib/taskNotification";
import { getMonday } from "@/app/_lib/kanbanUtils";
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

    // 기존 마감일에 1주를 더하면 7일 넘게 밀린 일정은 여전히 과거 날짜가 된다.
    // "다음주로 미루기"는 오늘 기준 다음주 일요일로 옮기는 것이 맞다.
    const nextDueDateObj = addWeeks(endOfWeek(startOfToday(), { weekStartsOn: 1 }), 1);
    const nextDueDate = format(nextDueDateObj, "yyyy-MM-dd");

    const week = await getOrCreateWeek(supabase, getMonday(nextDueDateObj));

    if (!week) {
      await postToResponseUrl({
        responseUrl,
        text: "⚠️ 주차 정보를 만들지 못해 마감일을 변경하지 못했어요.",
      });
      return;
    }

    const { data: after, error } = await supabase
      .from("tasks")
      .update({ due_date: nextDueDate, week_id: week.id })
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
