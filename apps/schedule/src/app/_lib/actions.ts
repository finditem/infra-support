"use server";

import { createClient } from "@/lib/supabase/server";
import type { TasksInsert, TasksRow } from "@/types/tables";

interface AddQuickTaskInput {
  weekId: string;
  statusId: string;
  assigneeId: string | null;
  reporterId: string | null;
}

export const addQuickTask = async ({
  weekId,
  statusId,
  assigneeId,
  reporterId,
}: AddQuickTaskInput): Promise<TasksRow | null> => {
  const supabase = await createClient();

  const insertPayload: TasksInsert = {
    title: "새 일정",
    status_id: statusId,
    week_id: weekId,
    assignee_id: assigneeId,
    reporter_id: reporterId,
    created_by: assigneeId,
  };

  const { data, error } = await supabase.from("tasks").insert(insertPayload).select("*").single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
};
