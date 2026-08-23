import { escapeSlackText } from "../escapeSlackText";
import type { SlackBlock } from "../postSlackMessage";

export const DUE_SOON_STATUS_BY_ACTION: Record<string, string> = {
  due_soon_complete: "완료",
  due_soon_review: "검토 중",
  due_soon_delayed: "지연됨",
};

/** 5-4: 마감 3일 전 진행 상황 체크 DM의 Block Kit 본문. */
export const buildDueSoonBlocks = (
  taskId: string,
  title: string,
  statusName: string
): SlackBlock[] => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${escapeSlackText(title)}* 마감이 3일 남았어요!\n현재 상태: ${escapeSlackText(statusName)}\n\n진행 상태를 바꿀까요?`,
    },
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: { type: "plain_text", text: "완료" },
        action_id: "due_soon_complete",
        value: taskId,
      },
      {
        type: "button",
        text: { type: "plain_text", text: "검토 중" },
        action_id: "due_soon_review",
        value: taskId,
      },
      {
        type: "button",
        text: { type: "plain_text", text: "지연됨" },
        action_id: "due_soon_delayed",
        value: taskId,
      },
    ],
  },
];
