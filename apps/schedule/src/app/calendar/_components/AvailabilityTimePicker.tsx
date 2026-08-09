"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useState } from "react";
import type { AvailabilityRow } from "@/types/tables";
import { createAvailability } from "../_lib/actions";
import { rangesOverlap, to24HourTime } from "../_lib/time";
import TimeWheelPicker from "./TimeWheelPicker";

interface AvailabilityTimePickerProps {
  date: string;
  currentProfileId: string;
  existingBlocks: AvailabilityRow[];
  onCancel: () => void;
  onCreated: (row: AvailabilityRow) => void;
}

const AvailabilityTimePicker = ({
  date,
  currentProfileId,
  existingBlocks,
  onCancel,
  onCreated,
}: AvailabilityTimePickerProps) => {
  const [startPeriod, setStartPeriod] = useState("오전");
  const [startHour, setStartHour] = useState("10");
  const [startMinute, setStartMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState("오후");
  const [endHour, setEndHour] = useState("12");
  const [endMinute, setEndMinute] = useState("00");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    const startTime = to24HourTime(startPeriod, startHour, startMinute);
    const endTime = to24HourTime(endPeriod, endHour, endMinute);

    if (startTime >= endTime) {
      setError("종료 시간은 시작 시간보다 늦어야 해요.");
      return;
    }

    const hasOverlap = existingBlocks.some((block) =>
      rangesOverlap(startTime, endTime, block.start_time, block.end_time)
    );

    if (hasOverlap) {
      setError("이미 등록된 시간대와 겹쳐요.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const created = await createAvailability({
      userId: currentProfileId,
      date,
      startTime,
      endTime,
    });

    setIsSubmitting(false);

    if (!created) {
      setError("등록에 실패했어요. 잠시 후 다시 시도해주세요.");
      return;
    }

    onCreated(created);
  };

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
              hour={startHour}
              minute={startMinute}
              period={startPeriod}
              onChangeHour={setStartHour}
              onChangeMinute={setStartMinute}
              onChangePeriod={setStartPeriod}
            />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase text-text-muted">종료</p>
            <TimeWheelPicker
              hour={endHour}
              minute={endMinute}
              period={endPeriod}
              onChangeHour={setEndHour}
              onChangeMinute={setEndMinute}
              onChangePeriod={setEndPeriod}
            />
          </div>
        </div>

        {error && <p className="mb-3 text-xs text-fg-state-error">{error}</p>}

        <div className="flex gap-2">
          <button
            className="flex-1 rounded-lg border border-border bg-surface-elevated py-2 text-xs text-text-muted"
            type="button"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            className="flex-1 rounded-lg border-none bg-primary py-2 text-xs font-semibold text-text-inverse disabled:opacity-50"
            disabled={isSubmitting}
            type="button"
            onClick={() => void handleConfirm()}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityTimePicker;
