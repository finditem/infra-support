"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProfileWithColor } from "../../../_types/kanban";
import type { TeamWithMembers } from "../../../_types/teams";
import { createTeam } from "../_lib/actions";
import TeamCard from "./TeamCard";

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

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("팀명을 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    const result = await createTeam({ name: trimmedName, createdBy: currentProfileId });
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
    <div className="flex flex-col gap-4">
      <form className="flex flex-wrap items-center gap-2" onSubmit={handleCreate}>
        <input
          className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-text-default outline-none transition focus:border-primary sm:w-64"
          disabled={isSubmitting}
          placeholder="추가할 팀명 (예: 프론트엔드)"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-text-inverse transition hover:bg-primary-hover disabled:opacity-50"
          disabled={isSubmitting}
          type="submit"
        >
          팀 추가
        </button>
      </form>

      {error && <p className="text-xs text-fg-state-error">{error}</p>}

      {teams.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-text-muted">
          아직 만들어진 팀이 없습니다. 위에서 팀을 추가해 주세요.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {teams.map((team) => (
            <TeamCard key={team.id} profiles={profiles} team={team} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeamsManager;
