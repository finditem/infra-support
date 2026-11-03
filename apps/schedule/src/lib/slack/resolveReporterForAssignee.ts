import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 담당자가 속한 팀의 팀장을 보고자로 해석한다.
 * 담당자가 여러 팀에 속하면 가장 먼저 가입한 팀부터 보며, 팀장이 지정돼 있고 담당자 본인이 아닌
 * 첫 팀장을 반환한다. 조건에 맞는 팀장이 없으면(팀 없음/팀장 미지정/팀장이 본인) null을 반환해 보고자를 비운다.
 */
export const resolveReporterForAssignee = async (
  supabase: SupabaseClient,
  assigneeId: string
): Promise<string | null> => {
  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, created_at")
    .eq("profile_id", assigneeId)
    .order("created_at", { ascending: true });

  if (!memberships || memberships.length === 0) return null;

  const teamIds = memberships.map((membership) => membership.team_id as string);

  const { data: teams } = await supabase.from("teams").select("id, leader_id").in("id", teamIds);
  const leaderByTeam = new Map(
    (teams ?? []).map((team) => [team.id as string, team.leader_id as string | null])
  );

  for (const membership of memberships) {
    const leaderId = leaderByTeam.get(membership.team_id as string) ?? null;
    if (leaderId && leaderId !== assigneeId) return leaderId;
  }

  return null;
};
