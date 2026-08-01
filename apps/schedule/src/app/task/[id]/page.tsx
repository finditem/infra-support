import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/NavBar";
import KanbanBoard from "../../_components/KanbanBoard";
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

  const [{ data: statuses }, { data: profiles }, { data: subtasks }, { data: currentProfile }] =
    await Promise.all([
      supabase.from("task_statuses").select("*").order("order_index"),
      supabase.from("profiles").select("*").order("name"),
      supabase.from("tasks").select("*").eq("parent_id", id).order("created_at"),
      user
        ? supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <NavBar />
      <TaskDetailHeader title={parentTask.title} />

      <div className="flex-1 px-8 py-6">
        <KanbanBoard
          currentProfileId={currentProfile?.id ?? null}
          enableTaskNavigation={false}
          parentId={parentTask.id}
          parentTitle={parentTask.title}
          profiles={profiles ?? []}
          statuses={statuses ?? []}
          tasks={subtasks ?? []}
          weekId={parentTask.week_id}
        />
      </div>
    </main>
  );
};

export default TaskDetailPage;
