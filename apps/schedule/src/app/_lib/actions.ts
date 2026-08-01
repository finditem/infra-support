"use server";

import { createClient } from "@/lib/supabase/server";
import type { TasksInsert, TasksRow } from "@/types/tables";

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

  return data;
};
