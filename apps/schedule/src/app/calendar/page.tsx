import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/NavBar";
import { buildProfileColorMap } from "../_lib/kanbanUtils";
import { buildMentionTargets } from "../_lib/mentions";
import { getRegisteredProfiles } from "../_lib/profiles";
import { getTeamsWithMembers } from "../_lib/teams";
import type { ProfileWithColor } from "../_types/kanban";
import CalendarHeader from "./_components/CalendarHeader";
import CalendarView from "./_components/CalendarView";
import { getHolidayNameMap } from "./_lib/holidays";

interface CalendarPageProps {
  searchParams: Promise<{ month?: string }>;
}

const CalendarPage = async ({ searchParams }: CalendarPageProps) => {
  const { month } = await searchParams;
  const monthStart = startOfMonth(month ? new Date(month) : new Date());
  const year = monthStart.getFullYear();
  const holidayNames = getHolidayNameMap([year - 1, year, year + 1]);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 0 });

  const supabase = await createClient();

  // 미들웨어가 이미 검증해 x-user-id 헤더로 넘겨준 값을 재사용한다(auth.getUser() 왕복 1회 절약).
  const userId = (await headers()).get("x-user-id");

  // 팀 목록은 가능 시간을 등록할 대상 후보다. 이미 조회하는 profiles를 프로미스째 넘겨,
  // 같은 목록을 두 번 조회하지 않으면서도 팀 조회가 profiles를 기다리지 않게 한다.
  const profilesPromise = getRegisteredProfiles(supabase);
  const [profiles, { data: availability }, teams] = await Promise.all([
    profilesPromise,
    supabase
      .from("availability")
      .select("*")
      .gte("available_date", format(gridStart, "yyyy-MM-dd"))
      .lte("available_date", format(gridEnd, "yyyy-MM-dd")),
    getTeamsWithMembers(supabase, profilesPromise),
  ]);

  const profileColorMap = buildProfileColorMap(profiles);
  const profilesWithColor: ProfileWithColor[] = profiles.map(
    (profile) => profileColorMap.get(profile.id) as ProfileWithColor
  );
  const currentProfileId = profiles.find((profile) => profile.id === userId)?.id ?? null;

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <NavBar />
      <CalendarHeader monthLabel={format(monthStart, "yyyy'년' M'월'")} monthStart={monthStart} />
      <CalendarView
        availability={availability ?? []}
        currentProfileId={currentProfileId}
        holidayNames={holidayNames}
        monthStart={monthStart}
        profileColorMap={profileColorMap}
        profiles={profilesWithColor}
        targets={buildMentionTargets(teams, profiles)}
      />
    </main>
  );
};

export default CalendarPage;
