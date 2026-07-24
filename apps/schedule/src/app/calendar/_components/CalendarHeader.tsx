import { addMonths, format } from "date-fns";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

interface CalendarHeaderProps {
  monthLabel: string;
  monthStart: Date;
}

const CalendarHeader = ({ monthLabel, monthStart }: CalendarHeaderProps) => {
  const prevMonthParam = format(addMonths(monthStart, -1), "yyyy-MM-dd");
  const nextMonthParam = format(addMonths(monthStart, 1), "yyyy-MM-dd");

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface-elevated px-8 py-5">
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-semibold text-text-default">캘린더</h1>
        <Link className="text-sm text-text-muted hover:text-text-default" href="/">
          메인으로
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Link
            aria-label="이전 달"
            className="flex size-8 items-center justify-center rounded-md border border-border text-text-muted hover:bg-fill-neutural-subtle-hover"
            href={`/calendar?month=${prevMonthParam}`}
          >
            ‹
          </Link>
          <span className="min-w-[110px] text-center text-sm font-medium text-text-default">
            {monthLabel}
          </span>
          <Link
            aria-label="다음 달"
            className="flex size-8 items-center justify-center rounded-md border border-border text-text-muted hover:bg-fill-neutural-subtle-hover"
            href={`/calendar?month=${nextMonthParam}`}
          >
            ›
          </Link>
        </div>

        <SignOutButton />
      </div>
    </header>
  );
};

export default CalendarHeader;
