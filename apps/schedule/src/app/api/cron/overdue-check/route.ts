import { differenceInCalendarDays, format, startOfToday } from "date-fns";
import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/verifyCronRequest";
import { postSlackMessage } from "@/lib/slack";
import { buildOverdueBlocks, type OverdueTaskEntry } from "@/lib/slack/blocks/overdueBlocks";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Slack 메시지는 최대 50블록까지만 허용한다. 일정 하나당 section+actions 2블록을 쓰고
 * 헤더에 1블록을 더 쓰므로, 메시지 하나에 담을 일정 수를 24개로 제한해 25번째부터는 새 메시지로 나눈다.
 */
const MAX_TASKS_PER_MESSAGE = 24;

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
};

/** 5-5: 마감일이 지났고 완료되지 않은 일정을 담당자별로 묶어 DM한다. */
export const GET = async (request: Request) => {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const [{ data: statuses }, { data: profiles }] = await Promise.all([
    supabase.from("task_statuses").select("id, name"),
    supabase.from("profiles").select("id, slack_user_id"),
  ]);

  const doneStatusId = (statuses ?? []).find((status) => status.name === "완료")?.id ?? null;
  const slackIdByProfileId = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.slack_user_id])
  );

  const today = startOfToday();

  let query = supabase
    .from("tasks")
    .select("id, title, due_date, assignee_id, status_id")
    .lt("due_date", format(today, "yyyy-MM-dd"));

  if (doneStatusId) {
    query = query.neq("status_id", doneStatusId);
  }

  const { data: tasks } = await query;

  const entriesByAssignee = new Map<string, OverdueTaskEntry[]>();

  for (const task of tasks ?? []) {
    if (!task.assignee_id || !task.due_date) continue;
    if (!slackIdByProfileId.get(task.assignee_id)) continue;

    const overdueDays = differenceInCalendarDays(today, new Date(task.due_date));
    const entries = entriesByAssignee.get(task.assignee_id) ?? [];
    entries.push({ id: task.id, title: task.title, overdueDays });
    entriesByAssignee.set(task.assignee_id, entries);
  }

  let sentCount = 0;

  for (const [assigneeId, entries] of entriesByAssignee) {
    const slackUserId = slackIdByProfileId.get(assigneeId);

    if (!slackUserId) continue;

    for (const group of chunk(entries, MAX_TASKS_PER_MESSAGE)) {
      await postSlackMessage({
        channel: slackUserId,
        text: `⚠️ 미완료 일정이 ${group.length}건 있어요.`,
        blocks: buildOverdueBlocks(group),
      });
    }
    sentCount += 1;
  }

  return NextResponse.json({ ok: true, sent: sentCount });
};
