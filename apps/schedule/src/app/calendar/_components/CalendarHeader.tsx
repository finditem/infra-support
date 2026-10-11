import { addMonths, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavArrowLink } from "@/components/NavArrowLink";
import MonthPickerPopover from "./MonthPickerPopover";

interface CalendarHeaderProps {
  monthLabel: string;
  monthStart: Date;
}

const CalendarHeader = ({ monthLabel, monthStart }: CalendarHeaderProps) => {
  const prevMonthParam = format(addMonths(monthStart, -1), "yyyy-MM-dd");
  const nextMonthParam = format(addMonths(monthStart, 1), "yyyy-MM-dd");

  return (
    <header className="flex items-center justify-end border-b border-border bg-surface-elevated px-4 py-5 sm:px-8">
      <div className="flex items-center gap-2">
        <NavArrowLink href={`/calendar?month=${prevMonthParam}`} label="이전 달">
          <ChevronLeft size={16} />
        </NavArrowLink>
        <MonthPickerPopover monthLabel={monthLabel} monthStart={monthStart} />
        <NavArrowLink href={`/calendar?month=${nextMonthParam}`} label="다음 달">
          <ChevronRight size={16} />
        </NavArrowLink>
      </div>
    </header>
  );
};

export default CalendarHeader;
