import { format } from "date-fns";

export const formatTime = (timestamp: number) => format(new Date(timestamp), "HH:mm");

export const formatDateTime = (timestamp: number) =>
  format(new Date(timestamp), "yyyy-MM-dd HH:mm");

export const createThreeHourTicks = (timestamp: number) => {
  const baseDate = new Date(timestamp);

  return [9, 12, 15, 18, 21, 24, 27, 30].map((hour) => {
    const date = new Date(baseDate);

    date.setHours(hour, 0, 0, 0);

    return date.getTime();
  });
};
