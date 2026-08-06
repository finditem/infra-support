import Holidays from "date-holidays";
import { format } from "date-fns";

const hd = new Holidays("KR");

export const getHolidayDates = (years: number[]): string[] => {
  const dates = new Set<string>();

  for (const year of years) {
    for (const holiday of hd.getHolidays(year)) {
      dates.add(format(new Date(holiday.date), "yyyy-MM-dd"));
    }
  }

  return Array.from(dates);
};
