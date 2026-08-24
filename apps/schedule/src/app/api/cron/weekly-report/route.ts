import {
  differenceInCalendarDays,
  endOfWeek,
  format,
  startOfToday,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/verifyCronRequest";
import { escapeSlackText, formatSlackProfile, postSlackMessage } from "@/lib/slack";
import { createServiceClient } from "@/lib/supabase/service";

interface ReportProfile {
  name: string;
  slackUserId: string | null;
}

/**
 * 5-6 + 5-7: 지난주(월~일) 마감이었던 일정의 완료/미완료 결과와 완료율,
 * 마감 초과 박제 명단을 팀 채널에 전송한다. 매주 월요일 09:00 KST(vercel.json의 cron 스케줄)에 호출된다.
 */
export const GET = async (request: Request) => {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const channel = process.env.SLACK_CHANNEL_ID;

  if (!channel) {
    return NextResponse.json({ error: "SLACK_CHANNEL_ID가 설정되지 않았어요." }, { status: 500 });
  }

  const supabase = createServiceClient();

  const today = startOfToday();
  const thisWeekMonday = startOfWeek(today, { weekStartsOn: 1 });
  const lastWeekMonday = subWeeks(thisWeekMonday, 1);
  const lastWeekSunday = endOfWeek(lastWeekMonday, { weekStartsOn: 1 });

  const [{ data: statuses }, { data: profiles }, { data: tasks }] = await Promise.all([
    supabase.from("task_statuses").select("id, name"),
    supabase.from("profiles").select("id, name, slack_user_id"),
    supabase
      .from("tasks")
      .select("id, title, due_date, assignee_id, status_id")
      .gte("due_date", format(lastWeekMonday, "yyyy-MM-dd"))
      .lte("due_date", format(lastWeekSunday, "yyyy-MM-dd")),
  ]);

  const doneStatusId = (statuses ?? []).find((status) => status.name === "완료")?.id ?? null;
  const profileById = new Map<string, ReportProfile>(
    (profiles ?? []).map((profile) => [
      profile.id,
      { name: profile.name, slackUserId: profile.slack_user_id },
    ])
  );

  const rows = tasks ?? [];
  const completed = rows.filter((task) => task.status_id === doneStatusId);
  const incomplete = rows.filter((task) => task.status_id !== doneStatusId);

  const assigneeLabel = (assigneeId: string | null) =>
    assigneeId ? escapeSlackText(profileById.get(assigneeId)?.name ?? "알 수 없음") : "담당자 없음";

  const completionRate = rows.length === 0 ? 0 : Math.round((completed.length / rows.length) * 100);

  const lines = [
    `📊 *지난주 업무 결과 리포트 (${format(lastWeekMonday, "M/d")} ~ ${format(lastWeekSunday, "M/d")})*`,
    "",
    `✅ *완료 (${completed.length}건)*`,
    ...completed.map(
      (task) => `• ${escapeSlackText(task.title)} (${assigneeLabel(task.assignee_id)})`
    ),
    "",
    `⚠️ *미완료 (${incomplete.length}건)*`,
    ...incomplete.map(
      (task) => `• ${escapeSlackText(task.title)} (${assigneeLabel(task.assignee_id)})`
    ),
    "",
    `📈 *팀 완료율: ${completionRate}% (${completed.length}/${rows.length})*`,
  ];

  if (incomplete.length > 0) {
    lines.push("", "🔴 *이번주 박제 명단*");

    incomplete.forEach((task) => {
      const overdueDays = task.due_date
        ? differenceInCalendarDays(today, new Date(task.due_date))
        : null;
      const profile = task.assignee_id ? (profileById.get(task.assignee_id) ?? null) : null;
      const mention = formatSlackProfile(profile);
      const overdueLabel =
        overdueDays !== null && overdueDays > 0 ? ` (${overdueDays}일 초과)` : "";

      lines.push(`• *${escapeSlackText(task.title)}* → 담당자: ${mention}${overdueLabel}`);
    });
  }

  await postSlackMessage({ channel, text: lines.join("\n") });

  return NextResponse.json({
    ok: true,
    completed: completed.length,
    incomplete: incomplete.length,
  });
};
