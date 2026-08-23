import { escapeSlackText } from "../escapeSlackText";
import type { SlackBlock } from "../postSlackMessage";

export interface OverdueTaskEntry {
  id: string;
  title: string;
  overdueDays: number;
}

/** 5-5: 마감 초과 미완료 알림 DM의 Block Kit 본문. 담당자 한 명의 여러 일정을 한 메시지에 묶는다. */
export const buildOverdueBlocks = (tasks: OverdueTaskEntry[]): SlackBlock[] => {
  const blocks: SlackBlock[] = [
    { type: "section", text: { type: "mrkdwn", text: "*미완료 일정이 있어요!*" } },
  ];

  tasks.forEach((task) => {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${escapeSlackText(task.title)} - ${task.overdueDays}일 초과`,
      },
    });
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "완료로 변경" },
          action_id: "overdue_complete",
          value: task.id,
        },
        {
          type: "button",
          text: { type: "plain_text", text: "다음주로 미루기" },
          action_id: "overdue_postpone",
          value: task.id,
        },
      ],
    });
  });

  return blocks;
};
