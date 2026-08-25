import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/NavBar";
import KanbanBoard from "./_components/KanbanBoard";
import KanbanHeader from "./_components/KanbanHeader";
import {
  getCommentsForTasks,
  getOrCreateWeek,
  getSprintForWeek,
  getTasksForWeek,
} from "./_lib/kanban";
import { buildMentionTargets } from "./_lib/mentions";
import { getRegisteredProfiles } from "./_lib/profiles";
import { getTeamsWithMembers } from "./_lib/teams";
import { getMonday, getWeekLabel } from "./_lib/kanbanUtils";

interface HomePageProps {
  searchParams: Promise<{ week?: string }>;
}

const HomePage = async ({ searchParams }: HomePageProps) => {
  const { week } = await searchParams;
  const supabase = await createClient();
  const weekStart = getMonday(week ? new Date(week) : new Date());

  // 미들웨어가 이미 auth.getUser()로 검증해 x-user-id 헤더에 실어 보낸 값을 재사용한다.
  // 여기서 다시 auth.getUser()를 호출하지 않아도 되므로 네트워크 왕복이 한 번 줄어든다.
  const userId = (await headers()).get("x-user-id");

  const [weekRow, sprint] = await Promise.all([
    getOrCreateWeek(supabase, weekStart),
    getSprintForWeek(supabase, weekStart),
  ]);

  // teams는 profiles 없이도 자체 조회가 가능하므로(getTeamsWithMembers), tasks를 기다리지 않고
  // 이 단계에서 profiles와 나란히 조회한다. profiles를 넘겨 재사용하는 대신 별도 조회가 되지만,
  // 순차 왕복이 아니라 같은 단계에서 병렬로 실행되므로 지연 시간에는 영향이 없다.
  const [{ data: statuses }, profiles, tasks, { data: currentProfile }, teams] = await Promise.all([
    supabase.from("task_statuses").select("*").order("order_index"),
    getRegisteredProfiles(supabase),
    weekRow ? getTasksForWeek(supabase, weekRow.id) : Promise.resolve([]),
    userId
      ? supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
    getTeamsWithMembers(supabase),
  ]);

  // 주차 일정 전체의 댓글을 여기서 한 번에 가져와, 카드마다 개수를 조회하는 N+1을 피한다.
  const comments = await getCommentsForTasks(
    supabase,
    tasks.map((task) => task.id)
  );

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <NavBar />
      <KanbanHeader
        sprintName={sprint?.name ?? null}
        weekLabel={getWeekLabel(weekStart)}
        weekStart={weekStart}
      />

      <div className="flex-1 px-4 py-6 sm:px-8">
        {weekRow ? (
          <KanbanBoard
            key={weekRow.id}
            comments={comments}
            currentProfileId={currentProfile?.id ?? null}
            mentionTargets={buildMentionTargets(teams, profiles)}
            profiles={profiles}
            statuses={statuses ?? []}
            tasks={tasks}
            weekId={weekRow.id}
          />
        ) : (
          <p className="text-sm text-text-muted">이번 주 데이터를 불러오지 못했습니다.</p>
        )}
      </div>
    </main>
  );
};

export default HomePage;
