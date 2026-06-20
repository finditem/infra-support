import { format } from "date-fns";

/**
 * 차트 X축 tick 라벨에 표시할 시간 문자열을 생성합니다.
 *
 * @returns `HH:mm` 형식의 시간 문자열
 *
 * @author junyeol
 */

export const formatTime = (timestamp: number) => format(new Date(timestamp), "HH:mm");

/**
 * 차트 툴팁에 표시할 날짜/시간 문자열을 생성합니다.
 *
 * @returns `yyyy-MM-dd HH:mm` 형식의 날짜/시간 문자열
 *
 * @author junyeol
 */

export const formatDateTime = (timestamp: number) =>
  format(new Date(timestamp), "yyyy-MM-dd HH:mm");

/**
 * 기준 날짜의 09:00부터 다음날 06:00까지 3시간 단위 tick을 생성합니다.
 *
 * @returns X축에 사용할 timestamp 배열
 *
 * @author junyeol
 */

export const createThreeHourTicks = (timestamp: number) => {
  const baseDate = new Date(timestamp);

  return [9, 12, 15, 18, 21, 24, 27, 30].map((hour) => {
    const date = new Date(baseDate);

    date.setHours(hour, 0, 0, 0);

    return date.getTime();
  });
};
