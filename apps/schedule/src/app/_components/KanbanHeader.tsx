import { addWeeks, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface KanbanHeaderProps {
  weekLabel: string;
  weekStart: Date;
  sprintName: string | null;
}

const KanbanHeader = ({ weekLabel, weekStart, sprintName }: KanbanHeaderProps) => {
  const prevWeekParam = format(addWeeks(weekStart, -1), "yyyy-MM-dd");
  const nextWeekParam = format(addWeeks(weekStart, 1), "yyyy-MM-dd");

  return (
    <header className="flex items-center justify-end border-b border-border bg-surface-elevated px-8 py-5">
      <div className="flex items-center gap-2">
        <Link
          aria-label="이전 주"
          className="flex size-8 items-center justify-center rounded-md border border-border text-text-muted hover:bg-fill-neutural-subtle-hover"
          href={`?week=${prevWeekParam}`}
        >
          <ChevronLeft size={16} />
        </Link>
        <div className="flex min-w-[150px] flex-col items-center gap-1">
          {sprintName && (
            <span className="bg-primary/10 rounded-full px-2 py-0.5 text-xs font-medium text-primary">
              {sprintName}
            </span>
          )}
          <span className="text-center text-sm font-medium text-text-default">{weekLabel}</span>
        </div>
        <Link
          aria-label="다음 주"
          className="flex size-8 items-center justify-center rounded-md border border-border text-text-muted hover:bg-fill-neutural-subtle-hover"
          href={`?week=${nextWeekParam}`}
        >
          <ChevronRight size={16} />
        </Link>
      </div>
    </header>
  );
};

export default KanbanHeader;
