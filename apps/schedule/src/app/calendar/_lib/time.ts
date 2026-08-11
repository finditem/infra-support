/** 오전/오후 + 12시간제 → DB `time` 컬럼 포맷("HH:MM:00")으로 변환한다. 오전 12시는 00시, 오후 12시는 12시로 처리한다. */
export const to24HourTime = (period: string, hour12: string, minute: string): string => {
  const hour = Number(hour12) % 12;
  const hour24 = period === "오후" ? hour + 12 : hour;

  return `${String(hour24).padStart(2, "0")}:${minute}:00`;
};

/** DB `time` 값("HH:MM:SS")을 "HH:MM~HH:MM" 표시 형식으로 변환한다. */
export const formatTimeRange = (start: string, end: string) =>
  `${start.slice(0, 5)}~${end.slice(0, 5)}`;

/** "HH:MM:SS" 형식은 zero-padded 숫자라 문자열 비교만으로 시각 순서를 판정할 수 있다. */
export const rangesOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
  aStart < bEnd && bStart < aEnd;
