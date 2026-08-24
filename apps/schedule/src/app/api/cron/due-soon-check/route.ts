import { addDays, format, startOfToday } from "date-fns";
import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/verifyCronRequest";
import { postSlackMessage } from "@/lib/slack";
import { buildDueSoonBlocks } from "@/lib/slack/blocks/dueSoonBlocks";
import { createServiceClient } from "@/lib/supabase/service";

const DUE_SOON_DAYS = 3;
const EXCLUDED_STATUS_NAMES = new Set(["완료", "미완료"]);

/** 5-4: 마감이 3일 남은, 아직 완료/미완료 처리되지 않은 일정의 담당자에게 진행 상황을 묻는다. */
export const GET = async (request: Request) => {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const [{ data: statuses }, { data: profiles }] = await Promise.all([
    supabase.from("task_statuses").select("id, name"),
    supabase.from("profiles").select("id, slack_user_id"),
  ]);

  const statusNameById = new Map((statuses ?? []).map((status) => [status.id, status.name]));
  const slackIdByProfileId = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.slack_user_id])
  );

  const targetDate = format(addDays(startOfToday(), DUE_SOON_DAYS), "yyyy-MM-dd");

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, assignee_id, status_id")
    .eq("due_date", targetDate);

  let sentCount = 0;

  for (const task of tasks ?? []) {
    const statusName = statusNameById.get(task.status_id);

    if (!statusName || EXCLUDED_STATUS_NAMES.has(statusName)) continue;

    const slackUserId = task.assignee_id ? slackIdByProfileId.get(task.assignee_id) : null;

    if (!slackUserId) continue;

    await postSlackMessage({
      channel: slackUserId,
      text: `📌 ${task.title} 마감이 3일 남았어요! 현재 상태: ${statusName}`,
      blocks: buildDueSoonBlocks(task.id, task.title, statusName),
    });
    sentCount += 1;
  }

  return NextResponse.json({ ok: true, sent: sentCount });
};
