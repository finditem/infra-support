"use server";

import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TasksInsert, TasksRow, TasksUpdate } from "@/types/tables";
import { notifyTaskCreated, notifyTaskDeleted, notifyTaskUpdated } from "./taskNotification";

interface CreateTaskInput {
  title: string;
  body: string | null;
  weekId: string | null;
  statusId: string;
  assigneeId: string | null;
  reporterId: string | null;
  priority: TasksRow["priority"];
  dueDate: string;
  createdBy: string | null;
  parentId: string | null;
}

export const createTask = async ({
  title,
  body,
  weekId,
  statusId,
  assigneeId,
  reporterId,
  priority,
  dueDate,
  createdBy,
  parentId,
}: CreateTaskInput): Promise<TasksRow | null> => {
  const supabase = await createClient();

  const insertPayload: TasksInsert = {
    title,
    body,
    status_id: statusId,
    week_id: weekId,
    assignee_id: assigneeId,
    reporter_id: reporterId,
    priority,
    due_date: dueDate,
    created_by: createdBy,
    parent_id: parentId,
  };

  const { data, error } = await supabase.from("tasks").insert(insertPayload).select("*").single();

  if (error) {
    console.error(error);
    return null;
  }

  // Slack 전송은 응답을 반환한 뒤에 실행한다. 알림이 느려도 저장 성공 응답이 지연되지 않는다.
  after(() => notifyTaskCreated(supabase, data));

  return data;
};

interface UpdateTaskInput {
  id: string;
  title: string;
  body: string | null;
  weekId: string | null;
  statusId: string;
  assigneeId: string | null;
  reporterId: string | null;
  priority: TasksRow["priority"];
  dueDate: string;
}

export const updateTask = async ({
  id,
  title,
  body,
  weekId,
  statusId,
  assigneeId,
  reporterId,
  priority,
  dueDate,
}: UpdateTaskInput): Promise<TasksRow | null> => {
  const supabase = await createClient();

  const updatePayload: TasksUpdate = {
    title,
    body,
    status_id: statusId,
    week_id: weekId,
    assignee_id: assigneeId,
    reporter_id: reporterId,
    priority,
    due_date: dueDate,
  };

  const { data: before } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();

  const { data, error } = await supabase
    .from("tasks")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  if (before) {
    after(() => notifyTaskUpdated(supabase, before, data));
  }

  return data;
};

/**
 * 드래그앤드롭으로 상태 컬럼을 옮겼을 때 status_id만 갱신한다.
 * updateTask는 모든 필드를 받아 통째로 덮어쓰므로, 드래그 시점의 클라이언트 상태로
 * 다른 세션이 수정한 내용을 되돌리지 않도록 별도 액션으로 둔다.
 * updated_at은 tasks_set_updated_at 트리거가 자동 갱신한다.
 */
export const updateTaskStatus = async ({
  id,
  statusId,
}: {
  id: string;
  statusId: string;
}): Promise<TasksRow | null> => {
  const supabase = await createClient();

  const { data: before } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();

  const { data, error } = await supabase
    .from("tasks")
    .update({ status_id: statusId })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  // 다른 세션이 그 사이에 고친 제목이나 담당자 등이 data에 섞여 있을 수 있으므로,
  // 비교 기준을 "갱신된 행에서 상태만 이전 값으로 되돌린 것"으로 잡아 알림에 상태 변경만 실리게 한다.
  if (before) {
    after(() => notifyTaskUpdated(supabase, { ...data, status_id: before.status_id }, data));
  }

  return data;
};

/**
 * 일정을 삭제한다. 하위 일정은 DB의 on delete cascade로 함께 지워지므로,
 * 알림과 보드 갱신에 쓸 하위 일정 정보를 삭제 전에 미리 읽어둔다.
 */
export const deleteTask = async (id: string): Promise<string[] | null> => {
  const supabase = await createClient();

  const { data: task } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();

  if (!task) return null;

  const { data: subtasks } = await supabase.from("tasks").select("id, title").eq("parent_id", id);
  const subtaskRows: { id: string; title: string }[] = subtasks ?? [];

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    console.error(error);
    return null;
  }

  after(() =>
    notifyTaskDeleted(
      supabase,
      task,
      subtaskRows.map((subtask) => subtask.title)
    )
  );

  return [id, ...subtaskRows.map((subtask) => subtask.id)];
};
