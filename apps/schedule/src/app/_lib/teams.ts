import type { SupabaseClient } from "@supabase/supabase-js";
import type { TeamMembersRow, TeamsRow } from "@/types/tables";
import type { ProfileWithColor } from "../_types/kanban";
import type { TeamWithMembers } from "../_types/teams";
import { getRegisteredProfiles } from "./profiles";

/**
 * 팀 목록에 소속 팀원을 붙여서 반환한다. 설정 > 팀 관리 페이지뿐 아니라
 * 이후 캘린더/칸반의 팀 언급 기능에서도 같은 형태가 필요해서 분리해 둔 조회 함수다.
 *
 * 가입된 팀원 목록을 이미 조회한 화면은 profiles를 넘겨 중복 조회를 피할 수 있다.
 * 멤버 순서는 profiles 조회 순서(이름순)를 그대로 따른다.
 */
export const getTeamsWithMembers = async (
  supabase: SupabaseClient,
  profiles?: ProfileWithColor[]
): Promise<TeamWithMembers[]> => {
  const [
    { data: teams, error: teamsError },
    { data: memberships, error: membershipsError },
    registeredProfiles,
  ] = await Promise.all([
    supabase.from("teams").select("*").order("name"),
    supabase.from("team_members").select("*"),
    profiles ? Promise.resolve(profiles) : getRegisteredProfiles(supabase),
  ]);

  if (teamsError) console.error(teamsError);
  if (membershipsError) console.error(membershipsError);

  const memberIdsByTeam = new Map<string, Set<string>>();
  ((memberships ?? []) as TeamMembersRow[]).forEach(({ team_id, profile_id }) => {
    const memberIds = memberIdsByTeam.get(team_id) ?? new Set<string>();
    memberIds.add(profile_id);
    memberIdsByTeam.set(team_id, memberIds);
  });

  return ((teams ?? []) as TeamsRow[]).map((team) => ({
    ...team,
    members: registeredProfiles.filter((profile) => memberIdsByTeam.get(team.id)?.has(profile.id)),
  }));
};
