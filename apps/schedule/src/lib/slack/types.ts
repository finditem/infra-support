/** 알림을 트리거한 일정 변경의 종류. */
export type TaskEventType = "created" | "updated" | "deleted";

/** 알림 메시지에서 사람을 표기하는 데 필요한 최소 정보. */
export interface SlackNotificationProfile {
  name: string;
  slackUserId: string | null;
}

/** 수정 알림에 나열할 변경 항목 하나. */
export interface TaskFieldChange {
  label: string;
  before: string;
  after: string;
}

/**
 * Slack 메시지를 만들기 위해 필요한 값 묶음.
 * 상태 이름이나 우선순위 라벨처럼 DB/앱에서만 해석할 수 있는 값은
 * 이 객체에 담기기 전에 모두 문자열로 변환해서 넘긴다.
 */
export interface TaskNotificationPayload {
  event: TaskEventType;
  title: string;
  /** 일정 상세로 이동하는 절대 URL. SITE_URL이 없으면 null. */
  url: string | null;
  statusName: string | null;
  priorityLabel: string;
  dueDate: string | null;
  assignee: SlackNotificationProfile | null;
  reporter: SlackNotificationProfile | null;
  /** 이 변경을 실행한 사람. 본인은 DM 대상에서 제외된다. */
  actor: SlackNotificationProfile | null;
  /** 하위 일정이면 상위 일정 제목. 최상위 일정이면 null. */
  parentTitle: string | null;
  /** event가 "updated"일 때만 채워진다. */
  changes: TaskFieldChange[];
  /** event가 "deleted"일 때 함께 삭제된 하위 일정 제목. */
  deletedSubtaskTitles: string[];
}

/**
 * 댓글에서 팀원을 언급했을 때 보낼 DM에 필요한 값 묶음.
 * 언급 대상은 저장 시점에 `task_comment_mentions`로 남긴 것을 그대로 쓰며,
 * 팀 언급(@프론트엔드)은 소속 팀원으로 펼쳐진 뒤에 이 객체에 담긴다.
 */
export interface CommentMentionNotificationPayload {
  /** 댓글이 달린 일정 제목. */
  taskTitle: string;
  /** 하위 일정이면 상위 일정 제목. 최상위 일정이면 null. */
  parentTitle: string | null;
  /** 댓글 작성자. 본인은 언급 대상에서 제외된 뒤에 담긴다. */
  author: SlackNotificationProfile | null;
  /** 이번에 새로 언급되어 DM을 받을 팀원. 비어 있으면 아무것도 보내지 않는다. */
  mentioned: SlackNotificationProfile[];
  /** 댓글 본문. 길면 메시지를 만들면서 잘라낸다. */
  body: string;
  /** 일정 상세로 이동하는 절대 URL. SITE_URL이 없으면 null. */
  url: string | null;
}
