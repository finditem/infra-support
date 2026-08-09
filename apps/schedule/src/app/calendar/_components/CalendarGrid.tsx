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
import { useState } from "react";
import type { AvailabilityRow } from "@/types/tables";
import type { ProfileWithColor } from "../../_types/kanban";
import { deleteAvailability } from "../_lib/actions";
import { formatTimeRange } from "../_lib/time";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarGridProps {
  monthStart: Date;
  availability: AvailabilityRow[];
  currentProfileId: string | null;
  holidayNames: Record<string, string>;
  profileColorMap: Map<string, ProfileWithColor>;
  selectedProfileId: string | null;
  onDeleted: (id: string) => void;
  onSelectDate: (date: string) => void;
}

const CalendarGrid = ({
  monthStart,
  availability,
  currentProfileId,
  holidayNames,
  profileColorMap,
  selectedProfileId,
  onDeleted,
  onSelectDate,
}: CalendarGridProps) => {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const gridStart = startOfWeek(startOfMonth(monthStart), { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const visibleAvailability = selectedProfileId
    ? availability.filter((block) => block.user_id === selectedProfileId)
    : availability;

  const handleDelete = async (id: string) => {
    const success = await deleteAvailability(id);
    if (success) onDeleted(id);
    setPendingDeleteId(null);
  };

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
          const dayBlocks = visibleAvailability.filter((block) => block.available_date === dateKey);
          const inMonth = isSameMonth(day, monthStart);
          const holidayName = holidayNames[dateKey];
          const isHoliday = Boolean(holidayName);
          const isSunday = day.getDay() === 0;

          return (
            <div
              key={dateKey}
              role="button"
              tabIndex={0}
              className="border-border/60 relative min-h-[110px] cursor-pointer border-b border-r p-2 text-left last:border-r-0 hover:bg-fill-neutural-subtle-hover"
              onClick={() => onSelectDate(dateKey)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectDate(dateKey);
                }
              }}
            >
              <span
                className={`absolute left-2 top-2 flex size-6 items-center justify-center rounded-full text-[13px] font-medium ${
                  isToday(day)
                    ? "bg-primary font-bold text-text-inverse"
                    : !inMonth
                      ? "text-text-muted/50"
                      : isSunday || isHoliday
                        ? "font-semibold text-fg-state-error"
                        : "text-text-default"
                }`}
              >
                {format(day, "d")}
              </span>

              {inMonth && isHoliday && (
                <span className="absolute left-9 right-2 top-2 truncate text-[10px] font-medium leading-6 text-fg-state-error">
                  {holidayName}
                </span>
              )}

              <div className="mt-[30px] flex flex-col gap-[3px]">
                {dayBlocks.map((block) => {
                  const profile = profileColorMap.get(block.user_id);
                  const isOwn = block.user_id === currentProfileId;
                  const isPendingDelete = pendingDeleteId === block.id;

                  return (
                    <span
                      key={block.id}
                      role={isOwn ? "button" : undefined}
                      tabIndex={isOwn ? 0 : undefined}
                      className="truncate rounded px-[6px] py-[3px] text-[10px] font-semibold text-white"
                      style={{ backgroundColor: profile?.color ?? "#9CA3AF" }}
                      onClick={(event) => {
                        if (!isOwn) return;
                        event.stopPropagation();
                        setPendingDeleteId((prev) => (prev === block.id ? null : block.id));
                      }}
                      onKeyDown={(event) => {
                        if (!isOwn) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          setPendingDeleteId((prev) => (prev === block.id ? null : block.id));
                        }
                      }}
                    >
                      {isPendingDelete ? (
                        <span className="flex items-center gap-1">
                          삭제할까요?
                          <button
                            className="rounded bg-white/20 px-1 font-bold hover:bg-white/30"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDelete(block.id);
                            }}
                          >
                            삭제
                          </button>
                        </span>
                      ) : (
                        <>
                          {profile && `${profile.name.slice(1)} `}
                          {formatTimeRange(block.start_time, block.end_time)}
                        </>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
