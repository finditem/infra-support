import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TasksRow } from "@/types/tables";
import { NavBar } from "@/components/NavBar";
import KanbanBoard from "../../_components/KanbanBoard";
import { getCommentsForTasks } from "../../_lib/kanban";
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: parentTask } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();

  if (!parentTask || parentTask.parent_id) {
    notFound();
  }

  const [{ data: statuses }, profiles, { data: subtasks }, { data: currentProfile }] =
    await Promise.all([
      supabase.from("task_statuses").select("*").order("order_index"),
      getRegisteredProfiles(supabase),
      supabase.from("tasks").select("*").eq("parent_id", id).order("created_at"),
      user
        ? supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  // 상위 일정과 하위 일정의 댓글을 한 번에 가져온다. 상위 일정 것은 아래 댓글 카드가,
  // 하위 일정 것은 칸반 카드의 개수 배지가 사용한다.
  const childTasks: TasksRow[] = subtasks ?? [];
  const [comments, teams] = await Promise.all([
    getCommentsForTasks(supabase, [parentTask.id, ...childTasks.map((task) => task.id)]),
    getTeamsWithMembers(supabase, profiles),
  ]);
  const mentionTargets = buildMentionTargets(teams, profiles);

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <NavBar />
      <TaskDetailHeader title={parentTask.title} />

      <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8">
        <KanbanBoard
          comments={comments.filter((comment) => comment.task_id !== parentTask.id)}
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
          initialComments={comments.filter((comment) => comment.task_id === parentTask.id)}
          mentionTargets={mentionTargets}
          profiles={profiles}
          taskId={parentTask.id}
        />
      </div>
    </main>
  );
};

export default TaskDetailPage;
