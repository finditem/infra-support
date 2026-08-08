import { format, startOfMonth } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/NavBar";
import { buildProfileColorMap } from "../_lib/kanbanUtils";
import type { ProfileWithColor } from "../_types/kanban";
import CalendarHeader from "./_components/CalendarHeader";
import CalendarView from "./_components/CalendarView";
import { mockAvailability } from "./_lib/calendarMockData";
import { getHolidayNameMap } from "./_lib/holidays";

interface CalendarPageProps {
  searchParams: Promise<{ month?: string }>;
}

const CalendarPage = async ({ searchParams }: CalendarPageProps) => {
  const { month } = await searchParams;
  const monthStart = startOfMonth(month ? new Date(month) : new Date());
  const year = monthStart.getFullYear();
  const holidayNames = getHolidayNameMap([year - 1, year, year + 1]);

  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("*").order("name");
  const profileColorMap = buildProfileColorMap(profiles ?? []);
  const profilesWithColor: ProfileWithColor[] = (profiles ?? []).map(
    (profile) => profileColorMap.get(profile.id) as ProfileWithColor
  );
  const [firstProfile, secondProfile] = profiles ?? [];
  const availability =
    firstProfile && secondProfile
      ? mockAvailability(year, monthStart.getMonth() + 1, [firstProfile.id, secondProfile.id])
      : [];

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <NavBar />
      <CalendarHeader monthLabel={format(monthStart, "yyyy'년' M'월'")} monthStart={monthStart} />
      <CalendarView
        availability={availability}
        holidayNames={holidayNames}
        monthStart={monthStart}
        profileColorMap={profileColorMap}
        profiles={profilesWithColor}
      />
    </main>
  );
};

export default CalendarPage;
