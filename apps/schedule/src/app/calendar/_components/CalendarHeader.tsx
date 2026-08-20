import { addMonths, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
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
        <Link
          aria-label="이전 달"
          className="flex size-8 items-center justify-center rounded-md border border-border text-text-muted hover:bg-fill-neutural-subtle-hover"
          href={`/calendar?month=${prevMonthParam}`}
        >
          <ChevronLeft size={16} />
        </Link>
        <MonthPickerPopover monthLabel={monthLabel} monthStart={monthStart} />
        <Link
          aria-label="다음 달"
          className="flex size-8 items-center justify-center rounded-md border border-border text-text-muted hover:bg-fill-neutural-subtle-hover"
          href={`/calendar?month=${nextMonthParam}`}
        >
          <ChevronRight size={16} />
        </Link>
      </div>
    </header>
  );
};

export default CalendarHeader;
