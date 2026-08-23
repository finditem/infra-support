"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useState } from "react";
import { ModalOverlay } from "@/components/ModalOverlay";
import type { AvailabilityRow } from "@/types/tables";
import { cn } from "@/utils";
import { resolveMentionProfiles } from "../../_lib/mentions";
import type { MentionTarget } from "../../_lib/mentions";
import { createAvailability } from "../_lib/actions";
import type { RecurrenceFrequency } from "../_lib/recurrence";
import {
  MAX_RECURRENCE_DATES,
  RECURRENCE_OPTIONS,
  expandRecurrenceDates,
  getDefaultRecurrenceEndDate,
  getMaxRecurrenceEndDate,
} from "../_lib/recurrence";
import type { TimeValue } from "../_lib/time";
import { toDbTime } from "../_lib/time";
import AvailabilityTargetPicker from "./AvailabilityTargetPicker";
import TimeWheelPicker from "./TimeWheelPicker";

const DEFAULT_START: TimeValue = { hour: "10", minute: "00" };
const DEFAULT_END: TimeValue = { hour: "12", minute: "00" };

const FIELD_LABEL_CLASSNAME = "w-11 shrink-0 text-[11px] font-medium text-text-muted";
const FIELD_CLASSNAME =
  "w-full rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-text-default outline-none";

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
  /** 대상으로 고를 수 있는 팀과 팀원. */
  targets: MentionTarget[];
  /** 로그인한 팀원. 대상의 기본 선택값으로 쓴다. */
  currentProfileId: string;
  onCancel: () => void;
  onCreated: (rows: AvailabilityRow[]) => void;
}

const AvailabilityTimePicker = ({
  date,
  targets,
  currentProfileId,
  onCancel,
  onCreated,
}: AvailabilityTimePickerProps) => {
  const [selectedTargets, setSelectedTargets] = useState<MentionTarget[]>(() =>
    targets.filter((target) => target.kind === "profile" && target.profile.id === currentProfileId)
  );
  const [start, setStart] = useState<TimeValue>(DEFAULT_START);
  const [end, setEnd] = useState<TimeValue>(DEFAULT_END);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>("none");
  const [endDate, setEndDate] = useState(date);
  const [is24Hour, setIs24Hour] = useState(readIs24Hour);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetProfiles = resolveMentionProfiles(selectedTargets);
  const isEndDateValid = frequency === "none" || endDate >= date;
  const recurrenceDates = isEndDateValid ? expandRecurrenceDates(date, frequency, endDate) : [date];
  const totalCount = targetProfiles.length * recurrenceDates.length;

  const toggleTimeFormat = () => {
    const next = !is24Hour;
    setIs24Hour(next);

    try {
      window.localStorage.setItem(TIME_FORMAT_STORAGE_KEY, next ? "24" : "12");
    } catch {
      // 저장에 실패해도 이번 등록 동안의 전환은 그대로 동작한다.
    }
  };

  const handleFrequencyChange = (next: RecurrenceFrequency) => {
    setFrequency(next);
    // 반복을 처음 고른 시점에 종료일이 시작일 그대로면 아무것도 반복되지 않아 기본 범위를 채워준다.
    if (next !== "none") setEndDate(getDefaultRecurrenceEndDate(date, next));
  };

  const handleConfirm = async () => {
    const startTime = toDbTime(start);
    const endTime = toDbTime(end);

    if (targetProfiles.length === 0) {
      setError("등록할 대상을 선택해주세요.");
      return;
    }

    if (startTime >= endTime) {
      setError("종료 시간은 시작 시간보다 늦어야 해요.");
      return;
    }

    if (!isEndDateValid) {
      setError("반복 종료일은 시작일보다 늦어야 해요.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const { data, skippedCount, hasError } = await createAvailability({
      userIds: targetProfiles.map((profile) => profile.id),
      dates: recurrenceDates,
      startTime,
      endTime,
    });

    setIsSubmitting(false);

    if (hasError) {
      setError("등록에 실패했어요. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (data.length === 0) {
      setError("선택한 시간대가 이미 모두 등록돼 있어요.");
      return;
    }

    onCreated(data);

    if (skippedCount === 0) {
      onCancel();
      return;
    }

    // 일부만 들어간 경우는 조용히 닫으면 무엇이 빠졌는지 알 수 없어 결과를 남기고 닫기를 맡긴다.
    setNotice(`${data.length}개를 등록했어요. ${skippedCount}개는 이미 등록된 시간대와 겹쳐요.`);
  };

  return (
    <ModalOverlay className="z-[100]" onClose={onCancel}>
      <div className="max-h-[85vh] w-[300px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-border bg-surface-elevated p-5 shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)]">
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
        <p className="mb-3 text-xs text-text-muted">
          {format(new Date(date), "M월 d일 (EEEEEE)", { locale: ko })}
        </p>

        <div className="mb-3">
          <AvailabilityTargetPicker
            selectedTargets={selectedTargets}
            targets={targets}
            onChange={setSelectedTargets}
          />
        </div>

        <div className="mb-3 flex flex-col gap-3">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase text-text-muted">시작</p>
            <TimeWheelPicker is24Hour={is24Hour} value={start} onChange={setStart} />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase text-text-muted">종료</p>
            <TimeWheelPicker is24Hour={is24Hour} value={end} onChange={setEnd} />
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-2">
          <label className="flex items-center gap-1.5 px-2">
            <span className={FIELD_LABEL_CLASSNAME}>반복</span>
            <select
              className={FIELD_CLASSNAME}
              value={frequency}
              onChange={(event) => handleFrequencyChange(event.target.value as RecurrenceFrequency)}
            >
              {RECURRENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {frequency !== "none" && (
            <label className="flex items-center gap-1.5 px-2">
              <span className={FIELD_LABEL_CLASSNAME}>종료</span>
              <input
                className={cn(FIELD_CLASSNAME, "[color-scheme:light] dark:[color-scheme:dark]")}
                max={getMaxRecurrenceEndDate(date)}
                min={date}
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>
          )}
        </div>

        {totalCount > 1 && (
          <p className="mb-3 px-2 text-[11px] text-text-muted">
            팀원 {targetProfiles.length}명 × {recurrenceDates.length}일 = 총 {totalCount}개
            {recurrenceDates.length === MAX_RECURRENCE_DATES &&
              ` (한 번에 최대 ${MAX_RECURRENCE_DATES}일까지 등록해요)`}
          </p>
        )}

        {error && <p className="mb-3 text-xs text-fg-state-error">{error}</p>}
        {notice && <p className="mb-3 text-xs text-text-muted">{notice}</p>}

        {notice ? (
          <button
            className="w-full rounded-lg border-none bg-primary py-2 text-xs font-semibold text-text-inverse"
            type="button"
            onClick={onCancel}
          >
            닫기
          </button>
        ) : (
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
        )}
      </div>
    </ModalOverlay>
  );
};

export default AvailabilityTimePicker;
