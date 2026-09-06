import { startOfToday, subWeeks } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getOrCreateWeek, getTasksForWeek } from "./kanban";
import { getEffectiveStatusId, getMonday, groupTasksByParent } from "./kanbanUtils";

export interface CarryOverResult {
  /** 이번 주로 옮긴 상위 일정 수. */
  movedTaskCount: number;
  /** 상위 일정을 따라 함께 옮긴 미완료 하위 일정 수. */
  movedSubtaskCount: number;
}

/**
 * 지난주에 완료하지 못한 일정을 이번 주 보드로 옮긴다.
 *
 * 마감일(due_date)은 건드리지 않고 week_id만 바꾼다. 지난주 마감을 그대로 남겨야
 * 카드가 이번 주 보드에서도 마감 초과로 강조되고, 마감일 기준으로 집계하는
 * 주간 리포트(api/cron/weekly-report)와 마감 초과 알림(api/cron/overdue-check)의
 * 결과도 달라지지 않기 때문이다.
 *
 * 완료 여부는 보드에 실제로 표시되는 컬럼을 기준으로 본다. 하위 일정이 표시 컬럼을
 * 결정하는 상위 일정은 자기 status_id가 완료가 아니어도 하위가 모두 완료면 옮기지 않는다.
 *
 * @param supabase - RLS를 우회해야 하므로 cron 라우트에서는 service 클라이언트를 넘긴다.
 * @param today - 기준 날짜. 이 날짜가 속한 주를 이번 주로, 그 직전 주를 지난주로 본다.
 * @returns 옮긴 일정 수. 주차 정보나 상태 목록을 읽지 못하면 null.
 */
export const carryOverIncompleteTasks = async (
  supabase: SupabaseClient,
  today: Date = startOfToday()
): Promise<CarryOverResult | null> => {
  const thisWeekStart = getMonday(today);
  const lastWeekStart = subWeeks(thisWeekStart, 1);

  const [{ data: statuses }, lastWeek, thisWeek] = await Promise.all([
    supabase.from("task_statuses").select("*").order("order_index"),
    getOrCreateWeek(supabase, lastWeekStart),
    getOrCreateWeek(supabase, thisWeekStart),
  ]);

  if (!statuses || !lastWeek || !thisWeek) return null;

  const doneStatusId = statuses.find((status) => status.name === "완료")?.id;

  // 완료 상태를 못 찾으면 미완료 판정을 할 수 없어, 완료된 일정까지 옮기지 않도록 여기서 멈춘다.
  if (!doneStatusId) return null;

  const lastWeekTasks = await getTasksForWeek(supabase, lastWeek.id);
  const childrenByParent = groupTasksByParent(lastWeekTasks);

  const tasksToMove = lastWeekTasks.filter(
    (task) =>
      task.parent_id === null &&
      getEffectiveStatusId(task, childrenByParent, statuses) !== doneStatusId
  );

  // getTasksForWeek는 하위 일정을 자체 주차와 관계없이 가져오므로, 이미 이번 주에 있는 하위 일정은 건너뛴다.
  const subtasksToMove = tasksToMove.flatMap((task) =>
    (childrenByParent.get(task.id) ?? []).filter(
      (subtask) => subtask.status_id !== doneStatusId && subtask.week_id !== thisWeek.id
    )
  );

  const movedIds = [...tasksToMove, ...subtasksToMove].map((task) => task.id);

  if (movedIds.length === 0) {
    return { movedTaskCount: 0, movedSubtaskCount: 0 };
  }

  const { error } = await supabase
    .from("tasks")
    .update({ week_id: thisWeek.id })
    .in("id", movedIds);

  if (error) {
    console.error(error);
    return null;
  }

  return { movedTaskCount: tasksToMove.length, movedSubtaskCount: subtasksToMove.length };
};
