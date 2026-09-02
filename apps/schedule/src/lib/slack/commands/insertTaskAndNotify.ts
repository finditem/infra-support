import { format } from "date-fns";
import { getOrCreateWeek } from "@/app/_lib/kanban";
import { getMonday } from "@/app/_lib/kanbanUtils";
import { notifyTaskCreated } from "@/app/_lib/taskNotification";
import { createServiceClient } from "@/lib/supabase/service";
import type { TasksInsert, TasksRow } from "@/types/tables";
import { postSlackMessage } from "../postSlackMessage";

const DEFAULT_STATUS_NAME = "할 일";

interface InsertTaskParams {
  title: string;
  body: string | null;
  assigneeId: string;
  reporterId: string | null;
  dueDate: Date;
  createdBy: string;
  slackUserId: string;
}

/**
 * 구조화 명령(5-1)과 자연어 등록(5-2)이 공유하는 일정 등록 + 알림 로직.
 * 실패 시 에러 메시지를 직접 Slack으로 보내고 null을 반환한다.
 */
export const insertTaskAndNotify = async ({
  title,
  body,
  assigneeId,
  reporterId,
  dueDate,
  createdBy,
  slackUserId,
}: InsertTaskParams): Promise<TasksRow | null> => {
  const supabase = createServiceClient();

  const { data: status } = await supabase
    .from("task_statuses")
    .select("id")
    .eq("name", DEFAULT_STATUS_NAME)
    .maybeSingle();

  if (!status) {
    await postSlackMessage({
      channel: slackUserId,
      text: "⚠️ 기본 상태를 찾을 수 없어 일정을 등록하지 못했어요.",
    });
    return null;
  }

  const week = await getOrCreateWeek(supabase, getMonday(dueDate));

  if (!week) {
    await postSlackMessage({
      channel: slackUserId,
      text: "⚠️ 주차 정보를 만들지 못해 일정을 등록하지 못했어요.",
    });
    return null;
  }

  const insertPayload: TasksInsert = {
    title,
    body,
    status_id: status.id,
    week_id: week.id,
    assignee_id: assigneeId,
    reporter_id: reporterId,
    due_date: format(dueDate, "yyyy-MM-dd"),
    created_by: createdBy,
  };

  const { data: task, error } = await supabase
    .from("tasks")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error || !task) {
    console.error("Slack 일정 등록 실패", error);
    await postSlackMessage({ channel: slackUserId, text: "⚠️ 일정 등록 중 오류가 발생했어요." });
    return null;
  }

  await notifyTaskCreated(supabase, task, createdBy);

  return task;
};
