import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/NavBar";
import KanbanBoard from "./_components/KanbanBoard";
import KanbanHeader from "./_components/KanbanHeader";
import { getOrCreateWeek, getSprintForWeek, getWeekBoard } from "./_lib/kanban";
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

  // 미들웨어가 이미 auth.getUser()로 검증해 x-user-id 헤더에 실어 보낸 값을 재사용한다.
  // 여기서 다시 auth.getUser()를 호출하지 않아도 되므로 네트워크 왕복이 한 번 줄어든다.
  const userId = (await headers()).get("x-user-id");

  const weekStart = getMonday(week ? new Date(week) : new Date());

  // 이 페이지에 필요한 조회는 서로를 기다릴 필요가 없으므로 한 단계에서 모두 병렬로 실행한다.
  // 특히 일정과 댓글은 weeks 행의 id 대신 (year, week_number)로 직접 걸러오기 때문에(getWeekBoard),
  // 주차 행 조회가 끝나기를 기다리던 순차 왕복이 사라진다.
  // 팀 조회에는 profiles를 기다리지 않은 프로미스 그대로 넘겨, 같은 목록을 두 번 조회하지 않으면서도
  // 팀 조회가 profiles와 나란히 출발하게 한다.
  const profilesPromise = getRegisteredProfiles(supabase);
  const [weekRow, sprint, { data: statuses }, profiles, board, { data: currentProfile }, teams] =
    await Promise.all([
      getOrCreateWeek(supabase, weekStart),
      getSprintForWeek(supabase, weekStart),
      supabase.from("task_statuses").select("*").order("order_index"),
      profilesPromise,
      getWeekBoard(supabase, weekStart),
      userId
        ? supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
        : Promise.resolve({ data: null }),
      getTeamsWithMembers(supabase, profilesPromise),
    ]);

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
            comments={board.comments}
            currentProfileId={currentProfile?.id ?? null}
            mentionTargets={buildMentionTargets(teams, profiles)}
            profiles={profiles}
            statuses={statuses ?? []}
            tasks={board.tasks}
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
