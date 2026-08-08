import {
  addWeeks,
  differenceInCalendarDays,
  endOfWeek,
  format,
  getDay,
  isBefore,
  startOfMonth,
  startOfToday,
  startOfWeek,
} from "date-fns";
import type { ProfilesRow, TaskStatusesRow, TasksRow } from "@/types/tables";
import type { KanbanFilterState, KanbanProgressEntry, ProfileWithColor } from "../_types/kanban";

/** 문자열을 0~359 사이 hue 값으로 해시한다. 팀원 수가 늘어나도 팔레트를 수동으로 추가할 필요 없이 id마다 고유한 색을 만들기 위해 사용한다. */
const hashToHue = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
};

export const getMonday = (date: Date) => startOfWeek(date, { weekStartsOn: 1 });

export const getWeekLabel = (weekStart: Date) => {
  const monthStart = startOfMonth(weekStart);
  // 월의 1일이 월요일이 아니면, 그 달의 첫 번째 월요일을 1주차 기준으로 삼는다.
  // (그렇지 않으면 1일이 월요일이 아닌 달에서 "N월 1주차"가 아예 존재하지 않는 경우가 생긴다.)
  const firstMondayOfMonth =
    getDay(monthStart) === 1
      ? monthStart
      : startOfWeek(addWeeks(monthStart, 1), { weekStartsOn: 1 });
  const weekOfMonth = Math.round(differenceInCalendarDays(weekStart, firstMondayOfMonth) / 7) + 1;

  return `${format(weekStart, "yyyy'년' M'월'")} ${weekOfMonth}주차`;
};

export const getInitial = (name: string) => name.slice(-1);

export const getStatusColor = (
  status: Pick<TaskStatusesRow, "color" | "color_dark">,
  isDark: boolean
) => (isDark ? status.color_dark : status.color);

export const PRIORITY_ORDER: TasksRow["priority"][] = ["low", "medium", "high"];

export const PRIORITY_META: Record<
  TasksRow["priority"],
  { label: string; color: string; badgeClassName: string; cardBorderClassName: string }
> = {
  high: {
    label: "높음",
    color: "#EF4444",
    badgeClassName:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300",
    cardBorderClassName: "border-red-300",
  },
  medium: {
    label: "중간",
    color: "#F59E0B",
    badgeClassName:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    cardBorderClassName: "border-amber-300",
  },
  low: {
    label: "낮음",
    color: "#10B981",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    cardBorderClassName: "border-emerald-300",
  },
};

/** 마감일 미입력 시 기본값: 평일 등록이면 이번주 일요일, 토/일 등록이면 다음주 일요일. */
export const getDefaultDueDate = (now: Date = new Date()) => {
  const day = getDay(now);
  const sunday = endOfWeek(now, { weekStartsOn: 1 });

  return day === 0 || day === 6 ? addWeeks(sunday, 1) : sunday;
};

export const buildProfileColorMap = (profiles: ProfilesRow[]) =>
  new Map<string, ProfileWithColor>(
    profiles.map((profile) => [
      profile.id,
      { ...profile, color: `hsl(${hashToHue(profile.id)} 65% 45%)` },
    ])
  );

export const isTaskOverdue = (task: TasksRow, statuses: TaskStatusesRow[]) => {
  const doneStatus = statuses.find((status) => status.name === "완료");

  return (
    !!task.due_date &&
    task.status_id !== doneStatus?.id &&
    isBefore(new Date(task.due_date), startOfToday())
  );
};

/**
 * 하위 일정이 있는 상위 일정이 메인 칸반보드에서 어느 상태 컬럼에 표시될지 계산한다.
 * 우선순위: 하나라도 지연됨 > 하나라도 미완료 > 전부 완료 > 전부 검토 중 > 하나라도 시작(할 일이 아님) > 상위 일정 자신의 상태.
 */
export const resolveEffectiveStatusId = (
  subtasks: TasksRow[],
  statuses: TaskStatusesRow[]
): string | null => {
  if (subtasks.length === 0) return null;

  const idByName = (name: string) => statuses.find((status) => status.name === name)?.id;
  const todoId = idByName("할 일");
  const inProgressId = idByName("진행 중");
  const reviewId = idByName("검토 중");
  const doneId = idByName("완료");
  const delayedId = idByName("지연됨");
  const incompleteId = idByName("미완료");

  const some = (id: string | undefined) => !!id && subtasks.some((task) => task.status_id === id);
  const every = (id: string | undefined) => !!id && subtasks.every((task) => task.status_id === id);

  if (some(delayedId)) return delayedId!;
  if (some(incompleteId)) return incompleteId!;
  if (every(doneId)) return doneId!;
  if (every(reviewId)) return reviewId!;
  if (subtasks.some((task) => task.status_id !== todoId)) return inProgressId ?? null;

  return null;
};

export const sortByPriorityDesc = (tasks: TasksRow[]) =>
  [...tasks].sort(
    (a, b) => PRIORITY_ORDER.indexOf(b.priority) - PRIORITY_ORDER.indexOf(a.priority)
  );

export const filterTasks = (
  tasks: TasksRow[],
  filter: KanbanFilterState,
  currentProfileId: string | null
) =>
  tasks.filter((task) => {
    if (filter.onlyMine && task.assignee_id !== currentProfileId) return false;
    if (filter.assigneeId && task.assignee_id !== filter.assigneeId) return false;
    if (filter.reporterId && task.reporter_id !== filter.reporterId) return false;
    if (filter.priority && task.priority !== filter.priority) return false;
    return true;
  });

export const calculateMemberProgress = (
  tasks: TasksRow[],
  profiles: ProfileWithColor[],
  statuses: TaskStatusesRow[]
): KanbanProgressEntry[] => {
  const doneStatus = statuses.find((status) => status.name === "완료");

  return profiles.map((profile) => {
    const memberTasks = tasks.filter((task) => task.assignee_id === profile.id);
    const done = memberTasks.filter((task) => task.status_id === doneStatus?.id).length;
    const percent = memberTasks.length === 0 ? 0 : Math.round((done / memberTasks.length) * 100);

    return { profile, total: memberTasks.length, done, percent };
  });
};
