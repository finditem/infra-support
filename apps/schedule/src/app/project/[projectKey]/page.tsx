import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KanbanBoard from "../../_components/KanbanBoard";
import KanbanHeader from "../../_components/KanbanHeader";
import { getOrCreateWeek, getSprintForWeek, getWeekBoard } from "../../_lib/kanban";
import { getMonday, getWeekLabel } from "../../_lib/kanbanUtils";
import { buildMentionTargets } from "../../_lib/mentions";
import { getRegisteredProfiles } from "../../_lib/profiles";
import { isProjectKey } from "../../_lib/projects";
import { getTeamsWithMembers } from "../../_lib/teams";

interface ProjectPageProps {
  params: Promise<{ projectKey: string }>;
  searchParams: Promise<{ week?: string }>;
}

const ProjectPage = async ({ params, searchParams }: ProjectPageProps) => {
  const { projectKey } = await params;

  // 주소창에 없는 프로젝트 키를 직접 입력한 경우는 없는 페이지로 처리한다.
  if (!isProjectKey(projectKey)) {
    notFound();
  }

  const { week } = await searchParams;
  const supabase = await createClient();

  // 미들웨어가 이미 auth.getUser()로 검증해 x-user-id 헤더에 실어 보낸 값을 재사용한다.
  const userId = (await headers()).get("x-user-id");

  const weekStart = getMonday(week ? new Date(week) : new Date());

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
    <>
      <KanbanHeader
        sprintName={sprint?.name ?? null}
        weekLabel={getWeekLabel(weekStart)}
        weekStart={weekStart}
      />

      <div className="flex-1 px-4 py-6 sm:px-8">
        {weekRow && board ? (
          <KanbanBoard
            key={`${projectKey}-${weekRow.id}`}
            comments={board.comments}
            currentProfileId={currentProfile?.id ?? null}
            defaultProjectKey={projectKey}
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
    </>
  );
};

export default ProjectPage;
