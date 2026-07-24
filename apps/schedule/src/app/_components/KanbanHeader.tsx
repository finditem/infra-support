import { addWeeks, format } from "date-fns";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

interface KanbanHeaderProps {
  weekLabel: string;
  weekStart: Date;
}

const KanbanHeader = ({ weekLabel, weekStart }: KanbanHeaderProps) => {
  const prevWeekParam = format(addWeeks(weekStart, -1), "yyyy-MM-dd");
  const nextWeekParam = format(addWeeks(weekStart, 1), "yyyy-MM-dd");

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface-elevated px-8 py-5">
      <h1 className="text-lg font-semibold text-text-default">메인 칸반보드</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Link
            aria-label="이전 주"
            className="flex size-8 items-center justify-center rounded-md border border-border text-text-muted hover:bg-fill-neutural-subtle-hover"
            href={`/?week=${prevWeekParam}`}
          >
            ‹
          </Link>
          <span className="min-w-[150px] text-center text-sm font-medium text-text-default">
            {weekLabel}
          </span>
          <Link
            aria-label="다음 주"
            className="flex size-8 items-center justify-center rounded-md border border-border text-text-muted hover:bg-fill-neutural-subtle-hover"
            href={`/?week=${nextWeekParam}`}
          >
            ›
          </Link>
        </div>

        <SignOutButton />
      </div>
    </header>
  );
};

export default KanbanHeader;
