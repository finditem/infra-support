import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/NavBar";
import { buildProfileColorMap } from "../_lib/kanbanUtils";
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

  const [
    { data: profiles },
    { data: availability },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("name"),
    supabase
      .from("availability")
      .select("*")
      .gte("available_date", format(gridStart, "yyyy-MM-dd"))
      .lte("available_date", format(gridEnd, "yyyy-MM-dd")),
    supabase.auth.getUser(),
  ]);

  const profileColorMap = buildProfileColorMap(profiles ?? []);
  const profilesWithColor: ProfileWithColor[] = (profiles ?? []).map(
    (profile) => profileColorMap.get(profile.id) as ProfileWithColor
  );
  const currentProfileId = profiles?.find((profile) => profile.id === user?.id)?.id ?? null;

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
      />
    </main>
  );
};

export default CalendarPage;
