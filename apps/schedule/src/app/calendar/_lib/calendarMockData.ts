import { buildProfileColorMap } from "../../_lib/kanbanUtils";
import type { ProfileWithColor } from "../../_types/kanban";

export interface MockAvailabilityBlock {
  id: string;
  profileId: string;
  date: string; // yyyy-MM-dd
  startTime: string; // HH시
  endTime: string; // HH시
}

const MOCK_PROFILES = [
  { id: "profile-1", name: "김민호", created_at: null },
  { id: "profile-6", name: "이수현", created_at: null },
];

export const mockProfileColorMap = buildProfileColorMap(MOCK_PROFILES);

export const mockProfiles: ProfileWithColor[] = MOCK_PROFILES.map(
  (profile) => mockProfileColorMap.get(profile.id) as ProfileWithColor
);

export const mockAvailability = (year: number, month: number): MockAvailabilityBlock[] => {
  const pad = (value: number) => String(value).padStart(2, "0");
  const date = (day: number) => `${year}-${pad(month)}-${pad(day)}`;

  return [
    { id: "1", profileId: "profile-1", date: date(1), startTime: "10시", endTime: "12시" },
    { id: "5", profileId: "profile-1", date: date(7), startTime: "10시", endTime: "12시" },
    { id: "6", profileId: "profile-6", date: date(7), startTime: "10시", endTime: "13시" },
    { id: "8", profileId: "profile-1", date: date(9), startTime: "14시", endTime: "16시" },
    { id: "10", profileId: "profile-6", date: date(10), startTime: "11시", endTime: "13시" },
    { id: "11", profileId: "profile-1", date: date(14), startTime: "10시", endTime: "12시" },
    { id: "12", profileId: "profile-6", date: date(15), startTime: "09시", endTime: "11시" },
  ];
};
