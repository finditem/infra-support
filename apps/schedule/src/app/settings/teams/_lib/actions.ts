"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TeamMembersInsert, TeamsInsert, TeamsRow, TeamsUpdate } from "@/types/tables";

const TEAMS_PATH = "/settings/teams";

// unique_violation: teams.name / teams.slug의 unique 제약을 어겼을 때 발생한다.
// 팀명 공백은 DB 트리거가 제거하므로, 공백만 다른 팀명도 여기서 걸린다.
const UNIQUE_VIOLATION_CODE = "23505";

interface TeamMutationResult {
  data: TeamsRow | null;
  isDuplicateName: boolean;
}

interface CreateTeamInput {
  name: string;
  createdBy: string | null;
}

export const createTeam = async ({
  name,
  createdBy,
}: CreateTeamInput): Promise<TeamMutationResult> => {
  const supabase = await createClient();

  // slug와 color는 DB 트리거가 채우므로 여기서 넣지 않는다.
  const insertPayload: TeamsInsert = { name, created_by: createdBy };

  const { data, error } = await supabase.from("teams").insert(insertPayload).select("*").single();

  if (error) {
    console.error(error);
    return { data: null, isDuplicateName: error.code === UNIQUE_VIOLATION_CODE };
  }

  revalidatePath(TEAMS_PATH);
  return { data, isDuplicateName: false };
};

interface UpdateTeamInput {
  id: string;
  name: string;
}

export const updateTeam = async ({ id, name }: UpdateTeamInput): Promise<TeamMutationResult> => {
  const supabase = await createClient();

  // 팀명을 바꾸면 언급 슬러그도 함께 바뀌어야 하는데, 그 계산은 DB 트리거가 맡는다.
  const updatePayload: TeamsUpdate = { name };

  const { data, error } = await supabase
    .from("teams")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    return { data: null, isDuplicateName: error.code === UNIQUE_VIOLATION_CODE };
  }

  revalidatePath(TEAMS_PATH);
  return { data, isDuplicateName: false };
};

interface UpdateTeamLeaderInput {
  teamId: string;
  /** 팀장으로 지정할 팀원(profiles.id). null이면 팀장을 비운다. */
  leaderId: string | null;
}

/** 팀장을 지정하거나 해제한다. 슬랙 /일정추가 폼의 보고자 자동지정이 이 값을 참조한다. */
export const updateTeamLeader = async ({
  teamId,
  leaderId,
}: UpdateTeamLeaderInput): Promise<boolean> => {
  const supabase = await createClient();

  const updatePayload: TeamsUpdate = { leader_id: leaderId };
  const { error } = await supabase.from("teams").update(updatePayload).eq("id", teamId);

  if (error) {
    console.error(error);
    return false;
  }

  revalidatePath(TEAMS_PATH);
  return true;
};

/** 팀을 지우면 team_members의 소속 정보도 on delete cascade로 함께 지워진다(팀원 계정은 그대로다). */
export const deleteTeam = async (id: string): Promise<boolean> => {
  const supabase = await createClient();
  const { error } = await supabase.from("teams").delete().eq("id", id);

  if (error) {
    console.error(error);
    return false;
  }

  revalidatePath(TEAMS_PATH);
  return true;
};

interface TeamMemberInput {
  teamId: string;
  profileId: string;
}

export const addTeamMember = async ({ teamId, profileId }: TeamMemberInput): Promise<boolean> => {
  const supabase = await createClient();

  const insertPayload: TeamMembersInsert = { team_id: teamId, profile_id: profileId };
  const { error } = await supabase.from("team_members").insert(insertPayload);

  if (error) {
    console.error(error);
    return false;
  }

  revalidatePath(TEAMS_PATH);
  return true;
};

export const removeTeamMember = async ({
  teamId,
  profileId,
}: TeamMemberInput): Promise<boolean> => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("profile_id", profileId);

  if (error) {
    console.error(error);
    return false;
  }

  // 팀장으로 지정돼 있던 팀원을 제거하면 그 팀의 팀장도 함께 비운다(팀장은 팀원 중에서만 지정한다).
  await supabase
    .from("teams")
    .update({ leader_id: null } satisfies TeamsUpdate)
    .eq("id", teamId)
    .eq("leader_id", profileId);

  revalidatePath(TEAMS_PATH);
  return true;
};
