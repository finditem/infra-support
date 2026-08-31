import { NavBar } from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import { getRegisteredProfiles } from "../../_lib/profiles";
import { getTeamsWithMembers } from "../../_lib/teams";
import SettingsTabs from "../_components/SettingsTabs";
import TeamsManager from "./_components/TeamsManager";

const TeamsSettingsPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 팀 조합에 쓰는 팀원 목록을 멤버 추가 팝오버에서도 그대로 쓰므로 한 번만 조회한다.
  const profiles = await getRegisteredProfiles(supabase);
  const teams = await getTeamsWithMembers(supabase, profiles);
  const currentProfileId = profiles.find((profile) => profile.id === user?.id)?.id ?? null;

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <NavBar />

      <div className="flex-1 px-8 py-6">
        <SettingsTabs />

        <h1 className="mb-4 mt-6 text-lg font-semibold text-text-default">팀 관리</h1>
        <TeamsManager currentProfileId={currentProfileId} profiles={profiles} teams={teams} />
      </div>
    </main>
  );
};

export default TeamsSettingsPage;
