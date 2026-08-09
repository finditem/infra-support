"use client";

import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils";
import PropertyPopover from "./PropertyPopover";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface DatePickerPopoverProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
}

const DatePickerPopover = ({ label, value, onChange }: DatePickerPopoverProps) => {
  const selectedDate = new Date(value);
  const [monthCursor, setMonthCursor] = useState(selectedDate);

  const gridStart = startOfWeek(startOfMonth(monthCursor));
  const gridEnd = endOfWeek(endOfMonth(monthCursor));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <PropertyPopover
      label={label}
      panelClassName="w-64"
      trigger={
        <span className="text-xs text-text-default">
          📅 {format(selectedDate, "M월 d일 (EEEEEE)", { locale: ko })}
        </span>
      }
    >
      {(close) => (
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <button
              className="rounded px-1.5 py-0.5 text-xs text-text-muted hover:bg-fill-neutural-subtle-hover"
              type="button"
              onClick={() => setMonthCursor((prev) => subMonths(prev, 1))}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold text-text-default">
              {format(monthCursor, "yyyy'년' M'월'")}
            </span>
            <button
              className="rounded px-1.5 py-0.5 text-xs text-text-muted hover:bg-fill-neutural-subtle-hover"
              type="button"
              onClick={() => setMonthCursor((prev) => addMonths(prev, 1))}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday} className="text-center text-[10px] font-medium text-text-muted">
                {weekday}
              </span>
            ))}

            {days.map((day) => {
              const inMonth = isSameMonth(day, monthCursor);
              const isSelected = isSameDay(day, selectedDate);

              return (
                <button
                  key={day.toISOString()}
                  className={cn(
                    "mx-auto flex size-6 items-center justify-center rounded-full text-[11px]",
                    isSelected
                      ? "bg-primary font-semibold text-text-inverse"
                      : inMonth
                        ? "text-text-default hover:bg-fill-neutural-subtle-hover"
                        : "text-text-muted/40"
                  )}
                  type="button"
                  onClick={() => {
                    onChange(format(day, "yyyy-MM-dd"));
                    close();
                  }}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </PropertyPopover>
  );
};

export default DatePickerPopover;
