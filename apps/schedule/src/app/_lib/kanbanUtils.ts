import {
  addWeeks,
  differenceInCalendarDays,
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
