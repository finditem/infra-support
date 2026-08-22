import type { TeamsRow } from "@/types/tables";
import type { ProfileWithColor } from "./kanban";

/** 팀 행에 소속 팀원(가입 완료된 profiles)을 붙인 화면용 조합 타입이다. */
export interface TeamWithMembers extends TeamsRow {
  members: ProfileWithColor[];
}
