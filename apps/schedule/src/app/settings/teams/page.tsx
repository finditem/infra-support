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

      <div className="flex-1 px-4 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <SettingsTabs />

          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-bold text-text-default">팀 관리</h1>
            <p className="text-xs text-text-muted">
              팀원을 팀으로 묶어 관리합니다. 한 사람이 여러 팀에 속할 수 있습니다.
            </p>
          </div>

          <TeamsManager currentProfileId={currentProfileId} profiles={profiles} teams={teams} />
        </div>
      </div>
    </main>
  );
};

export default TeamsSettingsPage;
