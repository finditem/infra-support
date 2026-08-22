import { escapeSlackText } from "./escapeSlackText";
import { formatSlackProfile } from "./formatSlackProfile";
import type { TaskEventType, TaskNotificationPayload } from "./types";

const EVENT_HEADING: Record<TaskEventType, string> = {
  created: "새 일정이 등록되었습니다",
  updated: "일정이 수정되었습니다",
  deleted: "일정이 삭제되었습니다",
};

const ACTOR_LABEL: Record<TaskEventType, string> = {
  created: "등록자",
  updated: "수정자",
  deleted: "삭제자",
};

/**
 * 일정 변경 알림 메시지 본문을 만든다. 팀 채널 한 곳에만 올라가므로
 * 담당자와 보고자는 멘션으로 표기해 본인에게 알림이 가도록 한다.
 */
export const buildTaskEventMessage = (payload: TaskNotificationPayload): string => {
  const lines: string[] = [EVENT_HEADING[payload.event]];

  const titleLine = payload.parentTitle
    ? `*${escapeSlackText(payload.title)}* (상위 일정: ${escapeSlackText(payload.parentTitle)})`
    : `*${escapeSlackText(payload.title)}*`;
  lines.push(titleLine);

  // DM을 보내지 않으므로 담당자/보고자 멘션은 모든 이벤트에 넣는다. 이 줄이 알림의 유일한 전달 경로다.
  lines.push(
    `담당자 ${formatSlackProfile(payload.assignee)} | 보고자 ${formatSlackProfile(payload.reporter)}`
  );

  if (payload.event === "updated") {
    payload.changes.forEach((change) => {
      lines.push(
        `- ${change.label}: ${escapeSlackText(change.before)} -> ${escapeSlackText(change.after)}`
      );
    });
  } else {
    lines.push(
      `마감일 ${payload.dueDate ?? "없음"} | 우선순위 ${payload.priorityLabel} | 상태 ${payload.statusName ?? "없음"}`
    );
  }

  if (payload.deletedSubtaskTitles.length > 0) {
    const titles = payload.deletedSubtaskTitles.map(escapeSlackText).join(", ");
    lines.push(
      `하위 일정 ${payload.deletedSubtaskTitles.length}건도 함께 삭제되었습니다: ${titles}`
    );
  }

  if (payload.actor) {
    lines.push(`${ACTOR_LABEL[payload.event]} ${escapeSlackText(payload.actor.name)}`);
  }

  if (payload.url) {
    lines.push(`<${payload.url}|바로 보기>`);
  }

  return lines.join("\n");
};
