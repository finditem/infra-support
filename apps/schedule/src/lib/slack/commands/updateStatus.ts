import { notifyTaskUpdated } from "@/app/_lib/taskNotification";
import { createServiceClient } from "@/lib/supabase/service";
import type { ProfilesRow } from "@/types/tables";
import { escapeSlackText } from "../escapeSlackText";
import { postSlackMessage } from "../postSlackMessage";

const STATUS_NAMES = ["할 일", "진행 중", "검토 중", "완료", "지연됨", "미완료"] as const;
const STATUS_COMMAND_PATTERN = new RegExp(`^(${STATUS_NAMES.join("|")})\\s+(.+)$`);

/** "완료 퍼블리싱작업" 같은 입력을 [상태명, 일정 제목 검색어]로 뽑는다. 매칭 안 되면 null. */
export const matchStatusCommand = (text: string): [string, string] | null => {
  const match = text.match(STATUS_COMMAND_PATTERN);

  return match ? [match[1], match[2]] : null;
};

export const handleStatusChange = async (
  actorProfile: ProfilesRow,
  statusName: string,
  titleQuery: string,
  slackUserId: string
) => {
  const supabase = createServiceClient();

  const { data: status } = await supabase
    .from("task_statuses")
    .select("id")
    .eq("name", statusName)
    .maybeSingle();

  if (!status) {
    await postSlackMessage({
      channel: slackUserId,
      text: `⚠️ "${escapeSlackText(statusName)}" 상태를 찾을 수 없어요.`,
    });
    return;
  }

  const { data: matches } = await supabase
    .from("tasks")
    .select("*")
    .ilike("title", `%${titleQuery}%`);

  const tasks = matches ?? [];

  if (tasks.length === 0) {
    await postSlackMessage({
      channel: slackUserId,
      text: `⚠️ "${escapeSlackText(titleQuery)}" 일정을 찾을 수 없어요.`,
    });
    return;
  }

  if (tasks.length > 1) {
    const titles = tasks.map((task) => `• ${escapeSlackText(task.title)}`).join("\n");
    await postSlackMessage({
      channel: slackUserId,
      text: `🔍 "${escapeSlackText(titleQuery)}"로 검색된 일정이 여러 개예요. 더 정확한 제목으로 다시 시도해주세요.\n${titles}`,
    });
    return;
  }

  const before = tasks[0];

  const { data: after, error } = await supabase
    .from("tasks")
    .update({ status_id: status.id })
    .eq("id", before.id)
    .select("*")
    .single();

  if (error || !after) {
    console.error("Slack 상태 변경 실패", error);
    await postSlackMessage({ channel: slackUserId, text: "⚠️ 상태 변경 중 오류가 발생했어요." });
    return;
  }

  await notifyTaskUpdated(supabase, before, after, actorProfile.id);
  await postSlackMessage({
    channel: slackUserId,
    text: `✅ *${escapeSlackText(after.title)}*을(를) *${escapeSlackText(statusName)}*(으)로 변경했어요!`,
  });
};
