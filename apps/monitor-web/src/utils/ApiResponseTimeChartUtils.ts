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
 * 차트 X축 tick 라벨에 표시할 날짜 문자열을 생성합니다.
 *
 * @returns `MM.dd` 형식의 날짜 문자열
 *
 * @author junyeol
 */

export const formatDate = (timestamp: number) => format(new Date(timestamp), "MM.dd");

/**
 * 데이터의 최솟값부터 3시간 간격으로 tick을 채우고, 마지막에 최댓값을 그대로 추가합니다.
 *
 * @remarks
 * - `createDailyTicks`와 같은 패턴으로, 첫 tick은 minTimestamp, 마지막 tick은
 *   maxTimestamp와 정확히 일치해 X축 domain 좌우 끝과 데이터가 어긋나지 않습니다.
 * - 24h 뷰가 어제 00:00~지금(최대 이틀)까지 걸칠 수 있어, 하루로 고정된 구간이 아니라
 *   실제 데이터 범위 기준으로 tick을 생성합니다.
 *
 * @returns X축에 사용할 timestamp 배열
 *
 * @author junyeol
 */

export const createThreeHourTicks = (minTimestamp: number, maxTimestamp: number) => {
  const ticks: number[] = [];
  const current = new Date(minTimestamp);

  while (current.getTime() < maxTimestamp) {
    ticks.push(current.getTime());
    current.setHours(current.getHours() + 3);
  }
  ticks.push(maxTimestamp);

  return ticks;
};

/**
 * 데이터의 최솟값부터 24시간 간격으로 tick을 채우고, 마지막에 최댓값을 그대로 추가합니다.
 *
 * @remarks
 * - 모든 중간 tick이 정확히 하루 간격이라 날짜 라벨이 건너뛰지 않습니다.
 * - 첫 tick은 minTimestamp, 마지막 tick은 maxTimestamp와 정확히 일치해
 *   X축 domain 좌우 끝과 데이터가 어긋나지 않습니다.
 * - 데이터 구간이 정확히 24시간의 배수가 아니면 tick 개수가 7개보다 많아질 수 있습니다
 *   (예: 09:00~다음날 06:00 단위 데이터가 7일치면 달력상 8개 날짜에 걸치므로 8개 tick이 됩니다).
 * - 밀리초 고정값(24 * 60 * 60 * 1000) 대신 `setDate`로 날짜를 증가시켜, DST가 있는
 *   타임존에서도 하루 간격이 시간 단위로 밀리지 않도록 합니다.
 *
 * @returns X축에 사용할 timestamp 배열
 *
 * @author junyeol
 */

export const createDailyTicks = (minTimestamp: number, maxTimestamp: number) => {
  const ticks: number[] = [];
  const current = new Date(minTimestamp);

  while (current.getTime() < maxTimestamp) {
    ticks.push(current.getTime());
    current.setDate(current.getDate() + 1);
  }
  ticks.push(maxTimestamp);

  return ticks;
};
