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
              className="border-border/60 relative min-h-[110px] border-b border-r p-2 text-left last:border-r-0 hover:bg-fill-neutural-subtle-hover"
            >
              <button
                aria-label={`${dateKey} 가능 시간 추가`}
                className="absolute inset-0 z-0"
                type="button"
                onClick={() => onSelectDate(dateKey)}
              />

              <span
                className={`pointer-events-none relative z-10 flex size-6 items-center justify-center rounded-full text-[13px] font-medium ${
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
                <span className="pointer-events-none absolute left-9 right-2 top-2 z-10 truncate text-[10px] font-medium leading-6 text-fg-state-error">
                  {holidayName}
                </span>
              )}

              <div className="pointer-events-none relative z-10 mt-[3px] flex flex-col gap-[3px]">
                {dayBlocks.map((block) => {
                  const profile = profileColorMap.get(block.user_id);
                  const isOwn = block.user_id === currentProfileId;
                  const isPendingDelete = pendingDeleteId === block.id;
                  const label = (
                    <>
                      {profile && `${profile.name.slice(1)} `}
                      {formatTimeRange(block.start_time, block.end_time)}
                    </>
                  );
                  const blockClassName =
                    "truncate rounded px-[6px] py-[3px] text-[10px] font-semibold text-white";
                  const blockStyle = { backgroundColor: profile?.color ?? "#9CA3AF" };

                  if (isPendingDelete) {
                    return (
                      <span
                        key={block.id}
                        className={`pointer-events-auto flex items-center gap-1 ${blockClassName}`}
                        style={blockStyle}
                      >
                        삭제할까요?
                        <button
                          className="rounded bg-white/20 px-1 font-bold hover:bg-white/30"
                          type="button"
                          onClick={() => void handleDelete(block.id)}
                        >
                          삭제
                        </button>
                        <button
                          className="rounded px-1 hover:bg-white/20"
                          type="button"
                          onClick={() => setPendingDeleteId(null)}
                        >
                          취소
                        </button>
                      </span>
                    );
                  }

                  if (isOwn) {
                    return (
                      <button
                        key={block.id}
                        className={`pointer-events-auto ${blockClassName} text-left`}
                        style={blockStyle}
                        type="button"
                        onClick={() => setPendingDeleteId(block.id)}
                      >
                        {label}
                      </button>
                    );
                  }

                  return (
                    <span key={block.id} className={blockClassName} style={blockStyle}>
                      {label}
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
