// 팀과 팀원을 잇는 조인 테이블이다. 다른 테이블과 달리 단일 id 컬럼이 없고
// (team_id, profile_id)가 복합 기본키라서 Row에 별도 식별자를 두지 않는다.
type TeamMembersWritable = {
  team_id: string;
  profile_id: string;
  created_at: string | null;
};

export type TeamMembersRow = TeamMembersWritable;

export type TeamMembersInsert = Omit<TeamMembersWritable, "created_at"> & {
  created_at?: string | null;
};

export type TeamMembersUpdate = Partial<TeamMembersWritable>;
