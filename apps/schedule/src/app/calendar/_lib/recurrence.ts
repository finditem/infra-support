import {
  addDays,
  addMonths,
  addWeeks,
  format,
  getDaysInMonth,
  isAfter,
  parseISO,
  setDate,
  startOfMonth,
} from "date-fns";

/** 가능 시간 반복 등록의 주기. "none"은 반복 없이 시작일 하루만 등록한다. */
export type RecurrenceFrequency = "none" | "daily" | "weekly" | "monthly";

export const RECURRENCE_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: "none", label: "없음" },
  { value: "daily", label: "매일" },
  { value: "weekly", label: "매주" },
  { value: "monthly", label: "매월" },
];

/**
 * 한 번의 등록으로 만들 수 있는 날짜의 상한.
 * 종료일을 멀리 잡았을 때 수백 건이 한꺼번에 들어가는 것을 막는 안전장치라 넉넉하게 둔다.
 */
export const MAX_RECURRENCE_DATES = 60;

/** 종료일로 고를 수 있는 가장 먼 날짜. 날짜 입력의 max 값으로 쓴다. */
export const getMaxRecurrenceEndDate = (startDate: string) =>
  format(addDays(parseISO(startDate), 365), "yyyy-MM-dd");

/** 주기를 처음 고른 시점에 채워 넣을 종료일. 주기마다 흔히 쓰는 범위를 기본값으로 잡았다. */
export const getDefaultRecurrenceEndDate = (
  startDate: string,
  frequency: RecurrenceFrequency
): string => {
  const start = parseISO(startDate);

  if (frequency === "daily") return format(addDays(start, 13), "yyyy-MM-dd");
  if (frequency === "weekly") return format(addWeeks(start, 3), "yyyy-MM-dd");
  if (frequency === "monthly") return format(addMonths(start, 2), "yyyy-MM-dd");

  return startDate;
};

/**
 * 시작일에서 주기만큼 index번 떨어진 날짜.
 * 매월은 시작일의 일자를 유지하므로 그 일자가 없는 달(31일 시작 → 2월)에는 날짜가 없어 null이 된다.
 */
const getRecurrenceDate = (
  start: Date,
  frequency: RecurrenceFrequency,
  index: number
): Date | null => {
  if (frequency === "daily") return addDays(start, index);
  if (frequency === "weekly") return addWeeks(start, index);

  const month = addMonths(startOfMonth(start), index);

  return start.getDate() > getDaysInMonth(month) ? null : setDate(month, start.getDate());
};

/**
 * 시작일부터 종료일까지의 반복 날짜를 "yyyy-MM-dd" 문자열로 전개한다. 시작일은 항상 포함된다.
 *
 * 매월에서 시작일의 일자가 없는 달은 그 달만 건너뛰고 다음 달로 이어간다.
 * 1월 31일부터 매월 반복하면 2월은 빠지고 3월 31일이 다음 날짜가 된다.
 * 종료일이 시작일보다 이르면 시작일 하나만 돌려주고, 상한(MAX_RECURRENCE_DATES)에서 멈춘다.
 */
export const expandRecurrenceDates = (
  startDate: string,
  frequency: RecurrenceFrequency,
  endDate: string
): string[] => {
  if (frequency === "none") return [startDate];

  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const dates: string[] = [];

  for (let index = 0; dates.length < MAX_RECURRENCE_DATES; index += 1) {
    const date = getRecurrenceDate(start, frequency, index);

    if (!date) {
      // 건너뛴 달이 이미 종료일을 지났다면 뒤에 남은 날짜도 없다.
      if (isAfter(addMonths(startOfMonth(start), index), end)) break;
      continue;
    }

    if (isAfter(date, end)) break;

    dates.push(format(date, "yyyy-MM-dd"));
  }

  return dates.length > 0 ? dates : [startDate];
};
