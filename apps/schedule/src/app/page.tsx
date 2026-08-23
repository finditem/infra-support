import { createClient } from "@/lib/supabase/server";
import type { TasksRow } from "@/types/tables";
import { NavBar } from "@/components/NavBar";
import KanbanBoard from "./_components/KanbanBoard";
import KanbanHeader from "./_components/KanbanHeader";
import { getCommentsForTasks, getOrCreateWeek, getSprintForWeek } from "./_lib/kanban";
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const weekStart = getMonday(week ? new Date(week) : new Date());
  const [weekRow, sprint] = await Promise.all([
    getOrCreateWeek(supabase, weekStart),
    getSprintForWeek(supabase, weekStart),
  ]);

  const [{ data: statuses }, profiles, { data: tasks }, { data: currentProfile }] =
    await Promise.all([
      supabase.from("task_statuses").select("*").order("order_index"),
      getRegisteredProfiles(supabase),
      weekRow
        ? supabase.from("tasks").select("*").eq("week_id", weekRow.id).order("created_at")
        : Promise.resolve({ data: [] }),
      user
        ? supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  // 주차 일정 전체의 댓글을 여기서 한 번에 가져와, 카드마다 개수를 조회하는 N+1을 피한다.
  // 팀 목록은 댓글에서 "@팀명"으로 언급할 후보이며, 이미 조회한 profiles를 넘겨 중복 조회를 피한다.
  const weekTasks: TasksRow[] = tasks ?? [];
  const [comments, teams] = await Promise.all([
    getCommentsForTasks(
      supabase,
      weekTasks.map((task) => task.id)
    ),
    getTeamsWithMembers(supabase, profiles),
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
            comments={comments}
            currentProfileId={currentProfile?.id ?? null}
            mentionTargets={buildMentionTargets(teams, profiles)}
            profiles={profiles}
            statuses={statuses ?? []}
            tasks={weekTasks}
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
