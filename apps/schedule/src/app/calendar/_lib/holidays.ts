import Holidays from "date-holidays";

const hd = new Holidays("KR");
const yearCache = new Map<number, Record<string, string>>();

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** date-holidays가 주는 start/end는 KST 자정 기준 UTC 타임스탬프다. 서버 실행 환경의 로컬 타임존(예: Vercel 기본 UTC)에
 * 영향받지 않도록, 로컬 Date 메서드 대신 epoch에 KST 오프셋을 직접 더한 뒤 toISOString(항상 UTC)으로 날짜를 뽑는다. */
const toKstDateKey = (epochMs: number) =>
  new Date(epochMs + KST_OFFSET_MS).toISOString().slice(0, 10);

const getHolidayNameMapForYear = (year: number): Record<string, string> => {
  const cached = yearCache.get(year);
  if (cached) return cached;

  const names: Record<string, string> = {};

  for (const holiday of hd.getHolidays(year)) {
    const startMs = new Date(holiday.start).getTime();
    const endMs = new Date(holiday.end).getTime();

    for (let ms = startMs; ms < endMs; ms += DAY_MS) {
      names[toKstDateKey(ms)] = holiday.name;
    }
  }

  yearCache.set(year, names);
  return names;
};

export const getHolidayNameMap = (years: number[]): Record<string, string> =>
  Object.assign({}, ...years.map(getHolidayNameMapForYear));
