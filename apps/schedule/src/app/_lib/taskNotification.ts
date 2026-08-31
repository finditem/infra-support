import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyTaskEvent } from "@/lib/slack";
import type { SlackNotificationProfile, TaskFieldChange } from "@/lib/slack";
import type { TasksRow } from "@/types/tables";
import { PRIORITY_META } from "./kanbanUtils";
import { loadNotificationProfileMap, toNotificationProfile } from "./notificationProfiles";
import { loadParentTitle } from "./parentTaskTitle";
import { buildTaskUrl } from "./taskUrl";

/** 본문처럼 길어질 수 있는 값은 알림에서 잘라 보여준다. */
const BODY_PREVIEW_LENGTH = 40;

interface TaskNotificationContext {
  statusName: string | null;
  assignee: SlackNotificationProfile | null;
  reporter: SlackNotificationProfile | null;
  actor: SlackNotificationProfile | null;
  parentTitle: string | null;
  url: string | null;
}

const loadStatusNameMap = async (supabase: SupabaseClient, ids: (string | null)[]) => {
  const uniqueIds = Array.from(new Set(ids.filter((id): id is string => !!id)));

  if (uniqueIds.length === 0) return new Map<string, string>();

  const { data } = await supabase.from("task_statuses").select("id, name").in("id", uniqueIds);

  return new Map(
    (data ?? []).map((status: { id: string; name: string }) => [status.id, status.name])
  );
};

/**
 * 이 변경을 실행한 사람의 id를 정한다. Slack 봇처럼 로그인 세션이 없는 호출부는
 * actorIdOverride로 명시적으로 넘긴다(넘기지 않은 값 undefined와, 알 수 없어 null을 넘기는 것을 구분한다).
 * 세션이 있는 일반 서버 액션은 override 없이 auth.getUser()로 현재 로그인 사용자를 쓴다.
 */
const resolveActorId = async (
  supabase: SupabaseClient,
  actorIdOverride: string | null | undefined
) => {
  if (actorIdOverride !== undefined) return actorIdOverride;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
};

const loadContext = async (
  supabase: SupabaseClient,
  task: TasksRow,
  actorIdOverride?: string | null
): Promise<TaskNotificationContext> => {
  const actorId = await resolveActorId(supabase, actorIdOverride);

  const [profileMap, statusNameMap, parentTitle] = await Promise.all([
    loadNotificationProfileMap(supabase, [task.assignee_id, task.reporter_id, actorId]),
    loadStatusNameMap(supabase, [task.status_id]),
    loadParentTitle(supabase, task.parent_id),
  ]);

  return {
    statusName: statusNameMap.get(task.status_id) ?? null,
    assignee: toNotificationProfile(profileMap.get(task.assignee_id ?? "")),
    reporter: toNotificationProfile(profileMap.get(task.reporter_id ?? "")),
    actor: toNotificationProfile(profileMap.get(actorId ?? "")),
    parentTitle,
    url: buildTaskUrl(task),
  };
};

const truncate = (value: string) =>
  value.length > BODY_PREVIEW_LENGTH ? `${value.slice(0, BODY_PREVIEW_LENGTH)}...` : value;

/** 수정 전후를 비교해 실제로 바뀐 항목만 뽑는다. 비어 있으면 알림을 보내지 않는다. */
const collectChanges = async (
  supabase: SupabaseClient,
  before: TasksRow,
  after: TasksRow
): Promise<TaskFieldChange[]> => {
  const [profileMap, statusNameMap] = await Promise.all([
    loadNotificationProfileMap(supabase, [
      before.assignee_id,
      after.assignee_id,
      before.reporter_id,
      after.reporter_id,
    ]),
    loadStatusNameMap(supabase, [before.status_id, after.status_id]),
  ]);

  const profileName = (id: string | null) =>
    id ? (profileMap.get(id)?.name ?? "알 수 없음") : "없음";
  const statusName = (id: string) => statusNameMap.get(id) ?? "알 수 없음";

  const changes: TaskFieldChange[] = [];

  if (before.title !== after.title) {
    changes.push({ label: "제목", before: before.title, after: after.title });
  }

  if ((before.body ?? "") !== (after.body ?? "")) {
    changes.push({
      label: "설명",
      before: before.body ? truncate(before.body) : "없음",
      after: after.body ? truncate(after.body) : "없음",
    });
  }

  if (before.status_id !== after.status_id) {
    changes.push({
      label: "상태",
      before: statusName(before.status_id),
      after: statusName(after.status_id),
    });
  }

  if (before.assignee_id !== after.assignee_id) {
    changes.push({
      label: "담당자",
      before: profileName(before.assignee_id),
      after: profileName(after.assignee_id),
    });
  }

  if (before.reporter_id !== after.reporter_id) {
    changes.push({
      label: "보고자",
      before: profileName(before.reporter_id),
      after: profileName(after.reporter_id),
    });
  }

  if (before.priority !== after.priority) {
    changes.push({
      label: "우선순위",
      before: PRIORITY_META[before.priority].label,
      after: PRIORITY_META[after.priority].label,
    });
  }

  if (before.due_date !== after.due_date) {
    changes.push({
      label: "마감일",
      before: before.due_date ?? "없음",
      after: after.due_date ?? "없음",
    });
  }

  return changes;
};

export const notifyTaskCreated = async (
  supabase: SupabaseClient,
  task: TasksRow,
  actorId?: string | null
) => {
  try {
    const context = await loadContext(supabase, task, actorId);

    await notifyTaskEvent({
      event: "created",
      title: task.title,
      priorityLabel: PRIORITY_META[task.priority].label,
      dueDate: task.due_date,
      changes: [],
      deletedSubtaskTitles: [],
      ...context,
    });
  } catch (error) {
    console.error("일정 등록 Slack 알림 실패", error);
  }
};

export const notifyTaskUpdated = async (
  supabase: SupabaseClient,
  before: TasksRow,
  after: TasksRow,
  actorId?: string | null
) => {
  try {
    const changes = await collectChanges(supabase, before, after);

    if (changes.length === 0) return;

    const context = await loadContext(supabase, after, actorId);

    await notifyTaskEvent({
      event: "updated",
      title: after.title,
      priorityLabel: PRIORITY_META[after.priority].label,
      dueDate: after.due_date,
      changes,
      deletedSubtaskTitles: [],
      ...context,
    });
  } catch (error) {
    console.error("일정 수정 Slack 알림 실패", error);
  }
};

export const notifyTaskDeleted = async (
  supabase: SupabaseClient,
  task: TasksRow,
  deletedSubtaskTitles: string[]
) => {
  try {
    const context = await loadContext(supabase, task);

    await notifyTaskEvent({
      event: "deleted",
      title: task.title,
      priorityLabel: PRIORITY_META[task.priority].label,
      dueDate: task.due_date,
      changes: [],
      deletedSubtaskTitles,
      ...context,
      // 삭제된 최상위 일정의 상세 페이지는 더 이상 존재하지 않으므로 링크를 넣지 않는다.
      url: task.parent_id ? context.url : null,
    });
  } catch (error) {
    console.error("일정 삭제 Slack 알림 실패", error);
  }
};
