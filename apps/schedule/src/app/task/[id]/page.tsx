import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/NavBar";
import KanbanBoard from "../../_components/KanbanBoard";
import { getTaskWithSubtasks } from "../../_lib/kanban";
import { buildMentionTargets } from "../../_lib/mentions";
import { getRegisteredProfiles } from "../../_lib/profiles";
import { getTeamsWithMembers } from "../../_lib/teams";
import TaskCommentsPanel from "./_components/TaskCommentsPanel";
import TaskDetailHeader from "./_components/TaskDetailHeader";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

const TaskDetailPage = async ({ params }: TaskDetailPageProps) => {
  const { id } = await params;
  const supabase = await createClient();

  // 미들웨어가 이미 검증해 x-user-id 헤더로 넘겨준 값을 재사용한다(auth.getUser() 왕복 1회 절약).
  const userId = (await headers()).get("x-user-id");

  // 하위 일정과 댓글은 상위 일정 행이 아니라 경로의 id만 있으면 조회할 수 있어서,
  // 상위 일정 조회를 기다리지 않고 나머지와 한 단계에서 병렬로 가져온다.
  const profilesPromise = getRegisteredProfiles(supabase);
  const [{ data: statuses }, profiles, detail, { data: currentProfile }, teams] = await Promise.all(
    [
      supabase.from("task_statuses").select("*").order("order_index"),
      profilesPromise,
      getTaskWithSubtasks(supabase, id),
      userId
        ? supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
        : Promise.resolve({ data: null }),
      getTeamsWithMembers(supabase, profilesPromise),
    ]
  );

  // 조회 자체가 실패한 경우(null)는 없는 일정과 구분한다. 실패를 404로 읽으면
  // 일시적인 오류에 멀쩡한 일정이 사라진 것처럼 보인다.
  if (!detail) {
    return (
      <main className="flex min-h-screen flex-col bg-surface">
        <NavBar />
        <div className="flex-1 px-4 py-6 sm:px-8">
          <p className="text-sm text-text-muted">일정을 불러오지 못했습니다.</p>
        </div>
      </main>
    );
  }

  // 임베드 결과의 첫 번째 원소가 상위 일정이고 나머지가 하위 일정이다.
  // 댓글은 양쪽 것이 함께 들어 있어, 상위 일정 것은 아래 댓글 카드가, 하위 일정 것은
  // 칸반 카드의 개수 배지가 각각 걸러서 쓴다.
  const [parentTask, ...childTasks] = detail.tasks;

  if (!parentTask || parentTask.parent_id) {
    notFound();
  }

  const mentionTargets = buildMentionTargets(teams, profiles);

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <NavBar />
      <TaskDetailHeader title={parentTask.title} />

      <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8">
        <KanbanBoard
          comments={detail.comments.filter((comment) => comment.task_id !== parentTask.id)}
          currentProfileId={currentProfile?.id ?? null}
          mentionTargets={mentionTargets}
          parentId={parentTask.id}
          parentTitle={parentTask.title}
          profiles={profiles}
          statuses={statuses ?? []}
          tasks={childTasks}
          weekId={parentTask.week_id}
        />

        <TaskCommentsPanel
          currentProfileId={currentProfile?.id ?? null}
          initialComments={detail.comments.filter((comment) => comment.task_id === parentTask.id)}
          mentionTargets={mentionTargets}
          profiles={profiles}
          taskId={parentTask.id}
        />
      </div>
    </main>
  );
};

export default TaskDetailPage;
