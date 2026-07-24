"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { ProfileWithColor } from "../../_types/kanban";
import type { MockAvailabilityBlock } from "../_lib/calendarMockData";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarGridProps {
  monthStart: Date;
  availability: MockAvailabilityBlock[];
  profileColorMap: Map<string, ProfileWithColor>;
  selectedProfileId: string | null;
  onSelectDate: (date: string) => void;
}

const CalendarGrid = ({
  monthStart,
  availability,
  profileColorMap,
  selectedProfileId,
  onSelectDate,
}: CalendarGridProps) => {
  const gridStart = startOfWeek(startOfMonth(monthStart), { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const visibleAvailability = selectedProfileId
    ? availability.filter((block) => block.profileId === selectedProfileId)
    : availability;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated">
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((weekday, index) => (
          <div
            key={weekday}
            className={`p-[10px] text-center text-xs font-semibold ${
              index === 0 ? "text-fg-state-error" : index === 6 ? "text-primary" : "text-text-muted"
            }`}
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayBlocks = visibleAvailability.filter((block) => block.date === dateKey);
          const inMonth = isSameMonth(day, monthStart);

          return (
            <button
              key={dateKey}
              className="min-h-[110px] border-b border-r border-border/60 p-2 text-left last:border-r-0 hover:bg-fill-neutural-subtle-hover"
              type="button"
              onClick={() => onSelectDate(dateKey)}
            >
              <span
                className={`mb-[6px] flex size-6 items-center justify-center rounded-full text-[13px] font-medium ${
                  isToday(day)
                    ? "bg-primary font-bold text-text-inverse"
                    : inMonth
                      ? "text-text-default"
                      : "text-text-muted/50"
                }`}
              >
                {format(day, "d")}
              </span>

              <div className="flex flex-col gap-[3px]">
                {dayBlocks.map((block) => {
                  const profile = profileColorMap.get(block.profileId);

                  return (
                    <span
                      key={block.id}
                      className={`truncate rounded px-[6px] py-[3px] text-[10px] font-semibold text-white ${profile?.colorClassName ?? "bg-fill-neutural-subtle-hover"}`}
                    >
                      {block.startTime}~{block.endTime}
                    </span>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
