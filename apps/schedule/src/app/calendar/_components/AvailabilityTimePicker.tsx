"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useState } from "react";

const HOURS = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}시`);

interface AvailabilityTimePickerProps {
  date: string;
  onCancel: () => void;
}

const AvailabilityTimePicker = ({ date, onCancel }: AvailabilityTimePickerProps) => {
  const [startTime, setStartTime] = useState("10시");
  const [endTime, setEndTime] = useState("12시");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="w-[220px] rounded-2xl border border-border bg-surface-elevated p-5 shadow-[0_12px_36px_rgba(0,0,0,0.12)]"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="mb-1 text-sm font-semibold text-text-default">가능 시간 등록</p>
        <p className="mb-4 text-xs text-text-muted">
          {format(new Date(date), "M월 d일 (EEEEEE)", { locale: ko })}
        </p>

        <div className="mb-4 flex gap-3">
          <div className="flex-1">
            <p className="mb-1.5 text-[10px] font-semibold uppercase text-text-muted">시작</p>
            <select
              className="w-full rounded-[10px] border border-border bg-surface px-2 py-2 text-center text-sm font-medium text-text-default"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            >
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <p className="mb-1.5 text-[10px] font-semibold uppercase text-text-muted">종료</p>
            <select
              className="w-full rounded-[10px] border border-border bg-surface px-2 py-2 text-center text-sm font-medium text-text-default"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
            >
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="flex-1 rounded-lg border border-border bg-surface-elevated py-2 text-xs text-text-muted"
            type="button"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            className="flex-1 rounded-lg border-none bg-primary py-2 text-xs font-semibold text-text-inverse"
            type="button"
            onClick={onCancel}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityTimePicker;
