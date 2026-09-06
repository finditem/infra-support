import { headers } from "next/headers";
import { NavBar } from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import { getRegisteredProfiles } from "../../_lib/profiles";
import { getTeamsWithMembers } from "../../_lib/teams";
import SettingsTabs from "../_components/SettingsTabs";
import TeamsManager from "./_components/TeamsManager";

const TeamsSettingsPage = async () => {
  const supabase = await createClient();

  // 미들웨어가 이미 검증해 x-user-id 헤더로 넘겨준 값을 재사용한다(auth.getUser() 왕복 1회 절약).
  const userId = (await headers()).get("x-user-id");

  // 팀 조합에 쓰는 팀원 목록을 멤버 추가 팝오버에서도 그대로 쓰므로 한 번만 조회한다.
  // 프로미스째 넘기면 팀 조회가 이 목록을 기다리지 않고 나란히 출발한다.
  const profilesPromise = getRegisteredProfiles(supabase);
  const [profiles, teams] = await Promise.all([
    profilesPromise,
    getTeamsWithMembers(supabase, profilesPromise),
  ]);
  const currentProfileId = profiles.find((profile) => profile.id === userId)?.id ?? null;

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
