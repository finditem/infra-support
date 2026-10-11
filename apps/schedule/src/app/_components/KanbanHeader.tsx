import { addWeeks, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavArrowLink } from "@/components/NavArrowLink";

interface KanbanHeaderProps {
  weekLabel: string;
  weekStart: Date;
  sprintName: string | null;
}

const KanbanHeader = ({ weekLabel, weekStart, sprintName }: KanbanHeaderProps) => {
  const prevWeekParam = format(addWeeks(weekStart, -1), "yyyy-MM-dd");
  const nextWeekParam = format(addWeeks(weekStart, 1), "yyyy-MM-dd");

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-5 sm:px-8">
      <div>
        {sprintName && (
          <span className="text-lg font-semibold text-text-default">{sprintName}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <NavArrowLink href={`?week=${prevWeekParam}`} label="이전 주">
          <ChevronLeft size={16} />
        </NavArrowLink>
        <span className="min-w-[150px] text-center text-sm font-medium text-text-default">
          {weekLabel}
        </span>
        <NavArrowLink href={`?week=${nextWeekParam}`} label="다음 주">
          <ChevronRight size={16} />
        </NavArrowLink>
      </div>
    </header>
  );
};

export default KanbanHeader;
