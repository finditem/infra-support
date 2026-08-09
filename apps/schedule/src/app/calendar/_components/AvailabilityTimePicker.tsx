"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useState } from "react";
import TimeWheelPicker from "./TimeWheelPicker";

interface AvailabilityTimePickerProps {
  date: string;
  onCancel: () => void;
}

const AvailabilityTimePicker = ({ date, onCancel }: AvailabilityTimePickerProps) => {
  const [start, setStart] = useState({ period: "오전", hour: "10", minute: "00" });
  const [end, setEnd] = useState({ period: "오후", hour: "12", minute: "00" });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="w-[260px] rounded-2xl border border-border bg-surface-elevated p-5 shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)]"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="mb-1 text-sm font-semibold text-text-default">가능 시간 등록</p>
        <p className="mb-4 text-xs text-text-muted">
          {format(new Date(date), "M월 d일 (EEEEEE)", { locale: ko })}
        </p>

        <div className="mb-4 flex flex-col gap-3">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase text-text-muted">시작</p>
            <TimeWheelPicker
              hour={start.hour}
              minute={start.minute}
              period={start.period}
              onChangeHour={(hour) => setStart((prev) => ({ ...prev, hour }))}
              onChangeMinute={(minute) => setStart((prev) => ({ ...prev, minute }))}
              onChangePeriod={(period) => setStart((prev) => ({ ...prev, period }))}
            />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase text-text-muted">종료</p>
            <TimeWheelPicker
              hour={end.hour}
              minute={end.minute}
              period={end.period}
              onChangeHour={(hour) => setEnd((prev) => ({ ...prev, hour }))}
              onChangeMinute={(minute) => setEnd((prev) => ({ ...prev, minute }))}
              onChangePeriod={(period) => setEnd((prev) => ({ ...prev, period }))}
            />
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
