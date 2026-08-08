export interface MockAvailabilityBlock {
  id: string;
  profileId: string;
  date: string; // yyyy-MM-dd
  startTime: string; // HH시
  endTime: string; // HH시
}

export const mockAvailability = (
  year: number,
  month: number,
  profileIds: [string, string]
): MockAvailabilityBlock[] => {
  const pad = (value: number) => String(value).padStart(2, "0");
  const date = (day: number) => `${year}-${pad(month)}-${pad(day)}`;
  const [firstProfileId, secondProfileId] = profileIds;

  return [
    { id: "1", profileId: firstProfileId, date: date(1), startTime: "10시", endTime: "12시" },
    { id: "5", profileId: firstProfileId, date: date(7), startTime: "10시", endTime: "12시" },
    { id: "6", profileId: secondProfileId, date: date(7), startTime: "10시", endTime: "13시" },
    { id: "8", profileId: firstProfileId, date: date(9), startTime: "14시", endTime: "16시" },
    { id: "10", profileId: secondProfileId, date: date(10), startTime: "11시", endTime: "13시" },
    { id: "11", profileId: firstProfileId, date: date(14), startTime: "10시", endTime: "12시" },
    { id: "12", profileId: secondProfileId, date: date(15), startTime: "09시", endTime: "11시" },
  ];
};
