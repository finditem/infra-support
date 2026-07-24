import { format, startOfMonth } from "date-fns";
import CalendarHeader from "./_components/CalendarHeader";
import CalendarView from "./_components/CalendarView";
import { mockAvailability, mockProfileColorMap, mockProfiles } from "./_lib/calendarMockData";

interface CalendarPageProps {
  searchParams: Promise<{ month?: string }>;
}

const CalendarPage = async ({ searchParams }: CalendarPageProps) => {
  const { month } = await searchParams;
  const monthStart = startOfMonth(month ? new Date(month) : new Date());
  const availability = mockAvailability(monthStart.getFullYear(), monthStart.getMonth() + 1);

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <CalendarHeader monthLabel={format(monthStart, "yyyy'년' M'월'")} monthStart={monthStart} />
      <CalendarView
        availability={availability}
        monthStart={monthStart}
        profileColorMap={mockProfileColorMap}
        profiles={mockProfiles}
      />
    </main>
  );
};

export default CalendarPage;
