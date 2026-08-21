import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/NavBar";
import SprintSettingsTable from "./_components/SprintSettingsTable";

const SettingsPage = async () => {
  const supabase = await createClient();

  const { data: weeks } = await supabase
    .from("weeks")
    .select("*")
    .order("start_date", { ascending: false });

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <NavBar />

      <div className="flex-1 px-8 py-6">
        <h1 className="mb-4 text-lg font-semibold text-text-default">주차별 스프린트 이름</h1>
        <SprintSettingsTable weeks={weeks ?? []} />
      </div>
    </main>
  );
};

export default SettingsPage;
