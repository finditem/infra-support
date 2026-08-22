import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/NavBar";
import SprintList from "./_components/SprintList";

const SettingsPage = async () => {
  const supabase = await createClient();

  const { data: sprints } = await supabase
    .from("sprints")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <NavBar />

      <div className="flex-1 px-8 py-6">
        <h1 className="mb-4 text-lg font-semibold text-text-default">스프린트</h1>
        <SprintList sprints={sprints ?? []} />
      </div>
    </main>
  );
};

export default SettingsPage;
