import { createServiceClient } from "@/lib/supabase/service";
import { escapeSlackText } from "../escapeSlackText";
import { postSlackMessage } from "../postSlackMessage";

/** "내 일정" 명령: 완료로 표시되지 않은, 담당 중인 일정을 마감일순으로 DM한다. */
export const sendMyTasks = async (assigneeId: string, slackUserId: string) => {
  const supabase = createServiceClient();

  const { data: statuses } = await supabase.from("task_statuses").select("id, name");
  const statusNameById = new Map((statuses ?? []).map((status) => [status.id, status.name]));
  const doneStatusId = (statuses ?? []).find((status) => status.name === "완료")?.id ?? null;

  let query = supabase
    .from("tasks")
    .select("title, due_date, status_id")
    .eq("assignee_id", assigneeId)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (doneStatusId) {
    query = query.neq("status_id", doneStatusId);
  }

  const { data: tasks } = await query;

  if (!tasks || tasks.length === 0) {
    await postSlackMessage({ channel: slackUserId, text: "🎉 담당 중인 미완료 일정이 없어요!" });
    return;
  }

  const lines = [
    "*📋 내 일정*",
    ...tasks.map((task) => {
      const due = task.due_date ?? "마감일 없음";
      const status = statusNameById.get(task.status_id) ?? "알 수 없음";
      return `• *${escapeSlackText(task.title)}* (${status}, ${due})`;
    }),
  ];

  await postSlackMessage({ channel: slackUserId, text: lines.join("\n") });
};
