import type { SupabaseClient } from "@supabase/supabase-js";
import { getReportPeriod, type ReportRange } from "@/app/report/_lib/report";
import type { TaskProjectKey } from "@/types/tables";

/** 완료로의 전이를 "합류"로 판정할 때 기준이 되는 상태 이름. */
const DONE_STATUS_NAME = "완료";

export interface FlowStatusMeta {
  name: string;
  color: string;
  colorDark: string;
}

/** 가지 위에 찍히는 상태 전이 한 건(status_history의 한 행). */
export interface FlowCommit {
  date: string;
  statusId: string;
}

export interface FlowBranch {
  id: string;
  title: string;
  assigneeName: string | null;
  /** 하위 일정 생성 시각 — 줄기에서 가지가 갈라지는 지점. */
  startDate: string;
  /** 기간 내 상태 전이들(오름차순). 트리거 기록 이전이면 비어 있을 수 있다. */
  commits: FlowCommit[];
  /** 완료되어 줄기로 합류("merge")했는지, 아직 열려 있는("open") 가지인지. */
  endKind: "merge" | "open";
  endDate: string;
  /** 현재 상태 id. open이면 끝점 색/라벨, merge면 완료 색이 된다. */
  endStatusId: string;
}

export interface FlowParent {
  id: string;
  title: string;
  projectKey: TaskProjectKey;
  startDate: string;
  /** 상위 일정 자체의 상태 전이들(오름차순). */
  commits: FlowCommit[];
  /** 상위 일정이 완료되어 줄기가 닫혔는지("merge"), 아직 진행 중인지("open"). */
  endKind: "merge" | "open";
  /** 완료 시점(merge) 또는 오늘(open). 줄기 끝 노드가 찍히는 지점. */
  endDate: string;
  endStatusId: string;
  branches: FlowBranch[];
}

export interface FlowGraphData {
  parents: FlowParent[];
  statuses: Record<string, FlowStatusMeta>;
  /** 가로 시간축의 시작·끝(ISO). 끝은 선택 기간의 오늘 끝(KST)이다. */
  periodStart: string;
  periodEnd: string;
}

interface TaskRowLite {
  id: string;
  title: string;
  parent_id: string | null;
  status_id: string;
  assignee_id: string | null;
  project_key: TaskProjectKey;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * 선택 기간의 상위·하위 일정과 상태 전이 기록을 조회해 브랜치 그래프용 구조로 가공한다.
 *
 * - 줄기 = 상위 일정(`parent_id IS NULL`), 가지 = 그 상위를 부모로 가진 하위 일정.
 * - 가지 위의 점 = 기간 내 `status_history` 전이. 완료 전이가 있으면 그 시각에 줄기로 합류한다.
 * - 완료되지 않은(진행 중/지연/미완료) 가지는 합류하지 않고 현재 시점까지 열린 끝점으로 둔다.
 *
 * 전체 프로젝트를 합산하며, 기간에 활동이 있었거나 아직 열려 있는 상위 일정만 보여준다.
 * `assigneeId`를 주면 그 팀원이 담당한 하위 일정(과 본인이 만든 상위 일정)만 남겨 담당자별 흐름을 본다.
 */
export const getFlowGraph = async (
  supabase: SupabaseClient,
  range: ReportRange,
  assigneeId: string | null = null
): Promise<FlowGraphData> => {
  const { startTimestamp, endTimestamp } = getReportPeriod(range);
  const startMs = Date.parse(startTimestamp);
  const endMs = Date.parse(endTimestamp);
  const within = (iso: string | null) => {
    if (!iso) return false;
    const ms = Date.parse(iso);
    return ms >= startMs && ms <= endMs;
  };

  const [
    { data: statusRows },
    { data: taskRows, error: tasksError },
    { data: historyRows },
    { data: profileRows },
  ] = await Promise.all([
    supabase.from("task_statuses").select("id, name, color, color_dark"),
    supabase
      .from("tasks")
      .select("id, title, parent_id, status_id, assignee_id, project_key, created_at, updated_at"),
    supabase
      .from("status_history")
      .select("task_id, status_id, created_at")
      .gte("created_at", startTimestamp)
      .lte("created_at", endTimestamp)
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("id, name"),
  ]);

  if (tasksError) console.error(tasksError);

  const statuses: Record<string, FlowStatusMeta> = {};
  const statusIdByName = new Map<string, string>();
  let doneStatusId: string | null = null;
  (statusRows ?? []).forEach((status) => {
    statuses[status.id] = { name: status.name, color: status.color, colorDark: status.color_dark };
    statusIdByName.set(status.name, status.id);
    if (status.name === DONE_STATUS_NAME) doneStatusId = status.id;
  });

  const profileNameById = new Map<string, string>();
  (profileRows ?? []).forEach((profile) => profileNameById.set(profile.id, profile.name));

  const commitsByTask = new Map<string, FlowCommit[]>();
  (historyRows ?? []).forEach((row) => {
    const list = commitsByTask.get(row.task_id) ?? [];
    list.push({ date: row.created_at, statusId: row.status_id });
    commitsByTask.set(row.task_id, list);
  });

  const tasks = (taskRows ?? []) as TaskRowLite[];
  const subtasksByParent = new Map<string, TaskRowLite[]>();
  tasks.forEach((task) => {
    if (!task.parent_id) return;
    const list = subtasksByParent.get(task.parent_id) ?? [];
    list.push(task);
    subtasksByParent.set(task.parent_id, list);
  });

  // 완료면 완료 시점에 닫고(merge), 미완료면 현재 시점(기간 끝)까지 열어 둔다(open).
  // 상위 일정의 줄기와 하위 일정의 가지가 같은 규칙으로 수명을 그리도록 공통으로 쓴다.
  const lifecycleOf = (task: TaskRowLite) => {
    const commits = commitsByTask.get(task.id) ?? [];
    const isDone = doneStatusId != null && task.status_id === doneStatusId;
    const startDate = task.created_at ?? startTimestamp;
    if (isDone) {
      // 완료 전이 시각에 닫는다. 트리거 기록 이전 완료 건은 기록이 없어 updated_at으로 근사한다.
      const lastDone = [...commits].reverse().find((commit) => commit.statusId === doneStatusId);
      const endDate = lastDone?.date ?? task.updated_at ?? startDate;
      return {
        commits,
        startDate,
        endKind: "merge" as const,
        endDate,
        endStatusId: task.status_id,
      };
    }
    return {
      commits,
      startDate,
      endKind: "open" as const,
      endDate: endTimestamp,
      endStatusId: task.status_id,
    };
  };

  const buildBranch = (sub: TaskRowLite): FlowBranch => ({
    id: sub.id,
    title: sub.title,
    assigneeName: profileNameById.get(sub.assignee_id ?? "") ?? null,
    ...lifecycleOf(sub),
  });

  // 칸반보드와 동일하게 상위 일정의 "유효 상태"를 하위 일정들로부터 유도한다.
  // (kanbanUtils.resolveEffectiveStatusId와 같은 우선순위: 지연 > 미완료 > 전부 완료 > 전부 검토 중 > 하나라도 시작)
  const effectiveSubStatusId = (subs: TaskRowLite[]): string | null => {
    if (subs.length === 0) return null;
    const id = (name: string) => statusIdByName.get(name);
    const some = (sid?: string) => !!sid && subs.some((sub) => sub.status_id === sid);
    const every = (sid?: string) => !!sid && subs.every((sub) => sub.status_id === sid);
    if (some(id("지연됨"))) return id("지연됨")!;
    if (some(id("미완료"))) return id("미완료")!;
    if (every(id("완료"))) return id("완료")!;
    if (every(id("검토 중"))) return id("검토 중")!;
    if (subs.some((sub) => sub.status_id !== id("할 일"))) return id("진행 중") ?? null;
    return null;
  };

  // 상위 일정의 줄기 수명. 하위로 상태가 유도되면 그걸 따르고(전부 완료면 마지막 하위 완료 시각에 닫는다),
  // 유도되지 않으면(하위 없음/전부 할 일) 상위 자신의 status_id를 쓴다.
  const parentLifecycleOf = (parent: TaskRowLite, allSubs: TaskRowLite[]) => {
    const effId = effectiveSubStatusId(allSubs);
    if (effId === null) return lifecycleOf(parent);

    const commits = commitsByTask.get(parent.id) ?? [];
    const startDate = parent.created_at ?? startTimestamp;
    if (doneStatusId != null && effId === doneStatusId) {
      const lastSubEndMs = allSubs
        .map((sub) => Date.parse(lifecycleOf(sub).endDate))
        .reduce((max, ms) => Math.max(max, ms), Date.parse(startDate));
      return {
        commits,
        startDate,
        endKind: "merge" as const,
        endDate: new Date(lastSubEndMs).toISOString(),
        endStatusId: effId,
      };
    }
    return {
      commits,
      startDate,
      endKind: "open" as const,
      endDate: endTimestamp,
      endStatusId: effId,
    };
  };

  const parents: FlowParent[] = [];
  tasks
    .filter((task) => task.parent_id === null)
    .forEach((parent) => {
      const subs = subtasksByParent.get(parent.id) ?? [];
      // 담당자 필터가 있으면 그 팀원이 맡은 하위 일정만 가지로 삼는다.
      const memberSubs =
        assigneeId === null ? subs : subs.filter((sub) => sub.assignee_id === assigneeId);
      // 기간에 활동이 있었거나(생성·전이) 아직 열려 있는 하위 일정만 가지로 보여준다.
      const visibleSubs = memberSubs.filter((sub) => {
        const hasCommit = (commitsByTask.get(sub.id)?.length ?? 0) > 0;
        const createdInWindow = within(sub.created_at);
        const isOpen = doneStatusId == null || sub.status_id !== doneStatusId;
        return hasCommit || createdInWindow || isOpen;
      });

      // 가지가 하나도 없으면, 그 상위 일정이 (필터 대상) 본인 것이고 기간에 생성됐을 때만 줄기만 보여준다.
      const parentIsMembers = assigneeId === null || parent.assignee_id === assigneeId;
      const parentCreatedInWindow = within(parent.created_at);
      if (visibleSubs.length === 0 && !(parentIsMembers && parentCreatedInWindow)) return;

      parents.push({
        id: parent.id,
        title: parent.title,
        projectKey: parent.project_key,
        ...parentLifecycleOf(parent, subs),
        branches: visibleSubs.map(buildBranch),
      });
    });

  // 줄기가 오래된 것부터 아래로 쌓이도록 생성 시각 오름차순으로 정렬한다.
  parents.sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));

  return { parents, statuses, periodStart: startTimestamp, periodEnd: endTimestamp };
};
