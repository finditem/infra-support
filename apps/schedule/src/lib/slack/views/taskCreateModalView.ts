import type { SlackModalView } from "../openSlackView";

/** view_submission 라우팅과 모달 식별에 함께 쓰는 callback_id. */
export const TASK_CREATE_CALLBACK_ID = "task_create_modal";

/** 모달 각 입력 요소의 공통 action_id. block_id로 필드를 구분하므로 action_id는 통일한다. */
export const TASK_CREATE_ACTION_ID = "input";

/**
 * static_select는 options를 최대 100개까지만 허용하고, 초과하면 필드가 아니라 뷰 전체가 거부돼
 * 모달 자체가 열리지 않는다. 내부 팀 툴이라 팀원이 100명을 넘을 일은 사실상 없지만, 그 경우에도
 * 모달이 깨지지 않도록 앞 100명으로 잘라 안전장치를 둔다.
 * (참고: https://docs.slack.dev/reference/block-kit/block-elements/select-menu-element)
 */
const STATIC_SELECT_OPTION_LIMIT = 100;

interface AssigneeOption {
  id: string;
  name: string;
}

/**
 * /일정추가 슬래시 커맨드로 띄우는 일정 등록 모달 뷰를 만든다.
 * 담당자/마감일/본문은 선택 입력이며, 비우면 담당자는 보낸 사람, 마감일은 이번주 일요일로 처리한다.
 * 보고자는 폼에서 받지 않고 제출 시 담당자가 속한 팀의 팀장으로 자동 지정한다.
 */
export const buildTaskCreateModalView = (
  assignees: AssigneeOption[],
  defaultDueDate: string
): SlackModalView => {
  const blocks: SlackModalView["blocks"] = [
    {
      type: "input",
      block_id: "title",
      label: { type: "plain_text", text: "제목" },
      element: {
        type: "plain_text_input",
        action_id: TASK_CREATE_ACTION_ID,
        placeholder: { type: "plain_text", text: "일정 제목" },
      },
    },
  ];

  // static_select는 options가 비어 있으면 Slack이 뷰를 거부하므로, 팀원이 있을 때만 담당자 블록을 넣는다.
  if (assignees.length > 0) {
    blocks.push({
      type: "input",
      block_id: "assignee",
      optional: true,
      label: { type: "plain_text", text: "담당자" },
      element: {
        type: "static_select",
        action_id: TASK_CREATE_ACTION_ID,
        placeholder: { type: "plain_text", text: "비우면 본인" },
        options: assignees.slice(0, STATIC_SELECT_OPTION_LIMIT).map((assignee) => ({
          text: { type: "plain_text", text: assignee.name },
          value: assignee.id,
        })),
      },
    });
  }

  blocks.push(
    {
      type: "input",
      block_id: "due_date",
      optional: true,
      label: { type: "plain_text", text: "마감일" },
      element: {
        type: "datepicker",
        action_id: TASK_CREATE_ACTION_ID,
        initial_date: defaultDueDate,
        placeholder: { type: "plain_text", text: "날짜 선택" },
      },
    },
    {
      type: "input",
      block_id: "body",
      optional: true,
      label: { type: "plain_text", text: "본문" },
      element: {
        type: "plain_text_input",
        action_id: TASK_CREATE_ACTION_ID,
        multiline: true,
        placeholder: { type: "plain_text", text: "설명 (선택)" },
      },
    }
  );

  return {
    type: "modal",
    callback_id: TASK_CREATE_CALLBACK_ID,
    title: { type: "plain_text", text: "일정 추가" },
    submit: { type: "plain_text", text: "등록" },
    close: { type: "plain_text", text: "취소" },
    blocks,
  };
};
