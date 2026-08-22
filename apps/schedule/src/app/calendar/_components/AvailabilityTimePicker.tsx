"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useState } from "react";
import type { AvailabilityRow } from "@/types/tables";
import { cn } from "@/utils";
import { useEscapeKey } from "../_hooks";
import { createAvailability } from "../_lib/actions";
import type { TimeValue } from "../_lib/time";
import { rangesOverlap, toDbTime } from "../_lib/time";
import TimeWheelPicker from "./TimeWheelPicker";

const DEFAULT_START: TimeValue = { hour: "10", minute: "00" };
const DEFAULT_END: TimeValue = { hour: "12", minute: "00" };

/** 12/24시간 표시 선택은 취향이라 브라우저에 남겨두고 다음 등록 때 그대로 쓴다. */
const TIME_FORMAT_STORAGE_KEY = "schedule:availability-time-format";

const readIs24Hour = () => {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(TIME_FORMAT_STORAGE_KEY) === "24";
  } catch {
    // 시크릿 모드 등 localStorage 접근이 막힌 환경에서는 기본값(12시간제)으로 둔다.
    return false;
  }
};

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
  const [start, setStart] = useState<TimeValue>(DEFAULT_START);
  const [end, setEnd] = useState<TimeValue>(DEFAULT_END);
  const [is24Hour, setIs24Hour] = useState(readIs24Hour);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEscapeKey(onCancel);

  const toggleTimeFormat = () => {
    const next = !is24Hour;
    setIs24Hour(next);

    try {
      window.localStorage.setItem(TIME_FORMAT_STORAGE_KEY, next ? "24" : "12");
    } catch {
      // 저장에 실패해도 이번 등록 동안의 전환은 그대로 동작한다.
    }
  };

  const handleConfirm = async () => {
    const startTime = toDbTime(start);
    const endTime = toDbTime(end);

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

    const { data: created, isOverlap } = await createAvailability({
      userId: currentProfileId,
      date,
      startTime,
      endTime,
    });

    setIsSubmitting(false);

    if (!created) {
      setError(
        isOverlap ? "이미 등록된 시간대와 겹쳐요." : "등록에 실패했어요. 잠시 후 다시 시도해주세요."
      );
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
        className="w-[260px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface-elevated p-5 shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-text-default">일정 등록</p>
          <button
            aria-pressed={is24Hour}
            className={cn(
              "shrink-0 rounded-md border px-[6px] py-[2px] text-[10px] font-semibold",
              is24Hour
                ? "bg-primary/10 border-primary text-primary"
                : "border-border text-text-muted hover:bg-fill-neutural-subtle-hover"
            )}
            type="button"
            onClick={toggleTimeFormat}
          >
            24시간
          </button>
        </div>
        <p className="mb-4 text-xs text-text-muted">
          {format(new Date(date), "M월 d일 (EEEEEE)", { locale: ko })}
        </p>

        <div className="mb-4 flex flex-col gap-3">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase text-text-muted">시작</p>
            <TimeWheelPicker is24Hour={is24Hour} value={start} onChange={setStart} />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase text-text-muted">종료</p>
            <TimeWheelPicker is24Hour={is24Hour} value={end} onChange={setEnd} />
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
