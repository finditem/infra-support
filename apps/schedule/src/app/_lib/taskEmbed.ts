import type { TaskCommentsRow, TasksRow } from "@/types/tables";

/**
 * 상위 일정을 가져오면서 하위 일정과 양쪽 댓글까지 함께 받아오는 임베드 구문.
 *
 * 상위 일정 조회 -> 하위 일정 조회 -> 댓글 조회로 이어지던 세 번의 순차 왕복을 한 번으로 줄인다.
 * 앞에 붙일 컬럼과 조인은 호출하는 쪽에서 조합한다.
 */
export const TASK_EMBED_SELECT = "task_comments(*), subtasks:tasks!parent_id(*, task_comments(*))";

/** 위 임베드가 돌려주는 상위 일정 한 건의 형태. */
export interface EmbeddedTaskRow extends TasksRow {
  /** 주차로 거르는 조회에서만 딸려 오는 조인 결과다. 화면에는 넘기지 않는다. */
  weeks?: unknown;
  task_comments: TaskCommentsRow[] | null;
  subtasks: (TasksRow & { task_comments: TaskCommentsRow[] | null })[] | null;
}

/** 화면이 그대로 쓰는 평평한 일정/댓글 배열. */
export interface FlattenedTasks {
  tasks: TasksRow[];
  comments: TaskCommentsRow[];
}

/**
 * 임베드로 딸려온 하위 일정과 댓글을 화면이 기대하는 평평한 배열로 펼친다.
 * 임베드는 댓글을 일정별로 묶어 돌려주므로, 마지막에 작성순으로 다시 정렬한다.
 */
export const flattenEmbeddedTasks = (rows: EmbeddedTaskRow[]): FlattenedTasks => {
  const tasks: TasksRow[] = [];
  const comments: TaskCommentsRow[] = [];

  rows.forEach((row) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { weeks, task_comments: rootComments, subtasks, ...rootTask } = row;
    tasks.push(rootTask);
    comments.push(...(rootComments ?? []));

    (subtasks ?? []).forEach(({ task_comments: subtaskComments, ...subtask }) => {
      tasks.push(subtask);
      comments.push(...(subtaskComments ?? []));
    });
  });

  comments.sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));

  return { tasks, comments };
};
