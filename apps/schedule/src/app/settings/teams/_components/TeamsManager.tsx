"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils";
import type { ProfileWithColor } from "../../../_types/kanban";
import type { TeamWithMembers } from "../../../_types/teams";
import { settingsFormButtonClassName, settingsInputClassName } from "../../_lib/styles";
import { createTeam } from "../_lib/actions";
import TeamCard from "./TeamCard";

/**
 * 팀 카드는 한 열로 두면 넓은 화면에서 가로가 남는다. 다만 태블릿과 모바일에서는
 * 카드 안의 멤버 칩이 금방 줄바꿈되므로 한 열을 유지한다.
 */
const teamListClassName = "grid grid-cols-1 gap-2 xl:grid-cols-2";

interface TeamsManagerProps {
  teams: TeamWithMembers[];
  profiles: ProfileWithColor[];
  currentProfileId: string | null;
}

const TeamsManager = ({ teams, profiles, currentProfileId }: TeamsManagerProps) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = name.trim() !== "" && !isSubmitting;

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    const result = await createTeam({ name: name.trim(), createdBy: currentProfileId });
    setIsSubmitting(false);

    if (!result.data) {
      setError(result.isDuplicateName ? "이미 있는 팀명입니다." : "팀을 만들지 못했습니다.");
      return;
    }

    setName("");
    setError(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      <form className="flex flex-wrap items-center gap-2" onSubmit={handleCreate}>
        <input
          className={settingsInputClassName}
          disabled={isSubmitting}
          placeholder="예: 프론트엔드"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          className={cn(settingsFormButtonClassName, "px-3 py-1.5 text-sm")}
          disabled={!canSubmit}
          type="submit"
        >
          생성
        </button>
      </form>

      {error && <p className="text-xs text-fg-state-error">{error}</p>}

      {teams.length === 0 ? (
        <p className="text-sm text-text-muted">등록된 팀이 없습니다.</p>
      ) : (
        <ul className={teamListClassName}>
          {teams.map((team) => (
            <TeamCard key={team.id} profiles={profiles} team={team} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeamsManager;
