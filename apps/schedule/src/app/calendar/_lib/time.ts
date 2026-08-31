/** 휠 피커와 모달이 주고받는 시각. 12/24시간 표시와 무관하게 항상 24시간제로 들고 있는다. */
export interface TimeValue {
  hour: string;
  minute: string;
}

/** 24시간제 시각을 DB `time` 컬럼 포맷("HH:MM:00")으로 변환한다. */
export const toDbTime = ({ hour, minute }: TimeValue): string => `${hour}:${minute}:00`;

/** 24시간제 "HH"를 12시간제 표시용 오전/오후 + 시로 나눈다. 00시는 오전 12시, 12시는 오후 12시가 된다. */
export const toPeriodHour = (hour: string): { period: string; hour12: string } => {
  const hour24 = Number(hour);
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return { period: hour24 < 12 ? "오전" : "오후", hour12: String(hour12).padStart(2, "0") };
};

/** 오전/오후 + 12시간제 시를 24시간제 "HH"로 합친다. `toPeriodHour`의 역방향이다. */
export const to24Hour = (period: string, hour12: string): string => {
  const hour = Number(hour12) % 12;

  return String(period === "오후" ? hour + 12 : hour).padStart(2, "0");
};

/** DB `time` 값("HH:MM:SS")을 "HH:MM~HH:MM" 표시 형식으로 변환한다. */
export const formatTimeRange = (start: string, end: string) =>
  `${start.slice(0, 5)}~${end.slice(0, 5)}`;

/** "HH:MM:SS" 형식은 zero-padded 숫자라 문자열 비교만으로 시각 순서를 판정할 수 있다. */
export const rangesOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
  aStart < bEnd && bStart < aEnd;
