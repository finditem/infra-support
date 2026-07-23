import { createClient } from "@/lib/supabase/server";
import KanbanBoard from "./_components/KanbanBoard";
import KanbanHeader from "./_components/KanbanHeader";
import { getOrCreateWeek } from "./_lib/kanban";
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
  const weekRow = await getOrCreateWeek(supabase, weekStart);

  const [{ data: statuses }, { data: profiles }, { data: tasks }, { data: currentProfile }] =
    await Promise.all([
      supabase.from("task_statuses").select("*").order("order_index"),
      supabase.from("profiles").select("*").order("name"),
      weekRow
        ? supabase.from("tasks").select("*").eq("week_id", weekRow.id).order("created_at")
        : Promise.resolve({ data: [] }),
      user
        ? supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <KanbanHeader weekLabel={getWeekLabel(weekStart)} weekStart={weekStart} />

      <div className="flex-1 px-8 py-6">
        {weekRow ? (
          <KanbanBoard
            currentProfileId={currentProfile?.id ?? null}
            profiles={profiles ?? []}
            statuses={statuses ?? []}
            tasks={tasks ?? []}
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
