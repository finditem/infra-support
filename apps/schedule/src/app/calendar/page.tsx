import { format, startOfMonth } from "date-fns";
import { NavBar } from "@/components/NavBar";
import CalendarHeader from "./_components/CalendarHeader";
import CalendarView from "./_components/CalendarView";
import { mockAvailability, mockProfileColorMap, mockProfiles } from "./_lib/calendarMockData";
import { getHolidayNameMap } from "./_lib/holidays";

interface CalendarPageProps {
  searchParams: Promise<{ month?: string }>;
}

const CalendarPage = async ({ searchParams }: CalendarPageProps) => {
  const { month } = await searchParams;
  const monthStart = startOfMonth(month ? new Date(month) : new Date());
  const availability = mockAvailability(monthStart.getFullYear(), monthStart.getMonth() + 1);
  const year = monthStart.getFullYear();
  const holidayNames = getHolidayNameMap([year - 1, year, year + 1]);

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <NavBar />
      <CalendarHeader monthLabel={format(monthStart, "yyyy'년' M'월'")} monthStart={monthStart} />
      <CalendarView
        availability={availability}
        holidayNames={holidayNames}
        monthStart={monthStart}
        profileColorMap={mockProfileColorMap}
        profiles={mockProfiles}
      />
    </main>
  );
};

export default CalendarPage;
