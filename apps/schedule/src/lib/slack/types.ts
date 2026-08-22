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
