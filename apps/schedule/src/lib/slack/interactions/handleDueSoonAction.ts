import { notifyTaskUpdated } from "@/app/_lib/taskNotification";
import { createServiceClient } from "@/lib/supabase/service";
import { DUE_SOON_STATUS_BY_ACTION } from "../blocks/dueSoonBlocks";
import { escapeSlackText } from "../escapeSlackText";
import { postToResponseUrl } from "../postToResponseUrl";
import { resolveProfileFromSlackUser } from "../resolveProfileFromSlackUser";

interface HandleDueSoonActionParams {
  actionId: string;
  taskId: string;
  slackUserId: string;
  responseUrl: string;
}

/** 5-4 DM의 완료/검토 중/지연됨 버튼 클릭을 처리한다. */
export const handleDueSoonAction = async ({
  actionId,
  taskId,
  slackUserId,
  responseUrl,
}: HandleDueSoonActionParams) => {
  const statusName = DUE_SOON_STATUS_BY_ACTION[actionId];

  if (!statusName) return;

  const supabase = createServiceClient();

  const [{ data: status }, { data: before }] = await Promise.all([
    supabase.from("task_statuses").select("id").eq("name", statusName).maybeSingle(),
    supabase.from("tasks").select("*").eq("id", taskId).maybeSingle(),
  ]);

  if (!status || !before) {
    await postToResponseUrl({ responseUrl, text: "이미 삭제되었거나 찾을 수 없는 일정이에요." });
    return;
  }

  const { data: after, error } = await supabase
    .from("tasks")
    .update({ status_id: status.id })
    .eq("id", taskId)
    .select("*")
    .single();

  if (error || !after) {
    console.error("Slack 인터랙션 상태 변경 실패", error);
    await postToResponseUrl({ responseUrl, text: "상태 변경 중 오류가 발생했어요." });
    return;
  }

  const actorProfile = await resolveProfileFromSlackUser(slackUserId);
  await notifyTaskUpdated(supabase, before, after, actorProfile?.id ?? null);

  await postToResponseUrl({
    responseUrl,
    text: `${escapeSlackText(after.title)}을(를) ${escapeSlackText(statusName)}(으)로 변경했어요!`,
  });
};
