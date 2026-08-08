import Holidays from "date-holidays";
import { eachDayOfInterval, format } from "date-fns";

const hd = new Holidays("KR");

export const getHolidayNameMap = (years: number[]): Record<string, string> => {
  const names: Record<string, string> = {};

  for (const year of years) {
    for (const holiday of hd.getHolidays(year)) {
      const days = eachDayOfInterval({
        start: new Date(holiday.start),
        end: new Date(new Date(holiday.end).getTime() - 1),
      });

      for (const day of days) {
        names[format(day, "yyyy-MM-dd")] = holiday.name;
      }
    }
  }

  return names;
};
