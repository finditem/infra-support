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
  { id: "profile-2", name: "이지은", created_at: null },
  { id: "profile-3", name: "박민수", created_at: null },
  { id: "profile-4", name: "최서지", created_at: null },
  { id: "profile-5", name: "정다은", created_at: null },
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
    { id: "2", profileId: "profile-2", date: date(2), startTime: "09시", endTime: "11시" },
    { id: "3", profileId: "profile-3", date: date(2), startTime: "14시", endTime: "16시" },
    { id: "4", profileId: "profile-4", date: date(4), startTime: "13시", endTime: "15시" },
    { id: "5", profileId: "profile-1", date: date(7), startTime: "10시", endTime: "12시" },
    { id: "6", profileId: "profile-2", date: date(7), startTime: "10시", endTime: "13시" },
    { id: "7", profileId: "profile-3", date: date(8), startTime: "09시", endTime: "10시" },
    { id: "8", profileId: "profile-1", date: date(9), startTime: "14시", endTime: "16시" },
    { id: "9", profileId: "profile-4", date: date(9), startTime: "14시", endTime: "17시" },
    { id: "10", profileId: "profile-2", date: date(10), startTime: "11시", endTime: "13시" },
    { id: "11", profileId: "profile-1", date: date(14), startTime: "10시", endTime: "12시" },
    { id: "12", profileId: "profile-2", date: date(15), startTime: "09시", endTime: "11시" },
    { id: "13", profileId: "profile-4", date: date(17), startTime: "14시", endTime: "16시" },
  ];
};
