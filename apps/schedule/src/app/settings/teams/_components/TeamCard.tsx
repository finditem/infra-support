"use client";

import { type FormEvent, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils";
import ProfileAvatar from "../../../_components/ProfileAvatar";
import ProfilePickerPopover from "../../../_components/ProfilePickerPopover";
import type { ProfileWithColor } from "../../../_types/kanban";
import type { TeamWithMembers } from "../../../_types/teams";
import { addTeamMember, deleteTeam, removeTeamMember, updateTeam } from "../_lib/actions";

interface TeamCardProps {
  team: TeamWithMembers;
  profiles: ProfileWithColor[];
}

/**
 * 팀 하나를 보여주고 그 자리에서 팀명 수정, 삭제, 멤버 추가/제거를 처리한다.
 * 변경은 모두 Server Action으로 저장한 뒤 router.refresh()로 서버 데이터를 다시 받아온다.
 */
const TeamCard = ({ team, profiles }: TeamCardProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(team.name);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const memberIds = new Set(team.members.map((member) => member.id));
  const addableProfiles = profiles.filter((profile) => !memberIds.has(profile.id));

  const startEditing = () => {
    setDraftName(team.name);
    setError(null);
    setIsEditing(true);
  };

  const handleRename = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = draftName.trim();

    if (!name) {
      setError("팀명을 입력해 주세요.");
      return;
    }

    if (name === team.name) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    const result = await updateTeam({ id: team.id, name });
    setIsSubmitting(false);

    if (!result.data) {
      setError(result.isDuplicateName ? "이미 있는 팀명입니다." : "팀명을 바꾸지 못했습니다.");
      return;
    }

    setError(null);
    setIsEditing(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    const isDeleted = await deleteTeam(team.id);
    setIsSubmitting(false);

    if (!isDeleted) {
      setError("팀을 삭제하지 못했습니다.");
      return;
    }

    setIsConfirmingDelete(false);
    router.refresh();
  };

  const handleAddMember = async (profileId: string | null) => {
    if (!profileId) return;

    setIsSubmitting(true);
    const isAdded = await addTeamMember({ teamId: team.id, profileId });
    setIsSubmitting(false);

    if (!isAdded) {
      setError("팀원을 추가하지 못했습니다.");
      return;
    }

    setError(null);
    router.refresh();
  };

  const handleRemoveMember = async (profileId: string) => {
    setIsSubmitting(true);
    const isRemoved = await removeTeamMember({ teamId: team.id, profileId });
    setIsSubmitting(false);

    if (!isRemoved) {
      setError("팀원을 제거하지 못했습니다.");
      return;
    }

    setError(null);
    router.refresh();
  };

  return (
    <li className="rounded-2xl border border-border bg-surface-elevated p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: team.color }}
          title={`팀 색상 ${team.color}`}
        />

        {isEditing ? (
          <form className="flex items-center gap-1" onSubmit={handleRename}>
            <input
              className="w-40 rounded-md border border-border bg-surface px-2 py-1 text-sm text-text-default outline-none focus:border-primary"
              autoFocus
              disabled={isSubmitting}
              type="text"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
            />
            <button
              aria-label="팀명 저장"
              className="rounded-md p-1 text-text-muted transition hover:bg-fill-neutural-subtle-hover hover:text-text-default"
              disabled={isSubmitting}
              type="submit"
            >
              <Check size={14} />
            </button>
            <button
              aria-label="팀명 수정 취소"
              className="rounded-md p-1 text-text-muted transition hover:bg-fill-neutural-subtle-hover hover:text-text-default"
              type="button"
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
            >
              <X size={14} />
            </button>
          </form>
        ) : (
          <button
            className="group flex items-center gap-1 rounded-md px-1 py-0.5 text-sm font-semibold text-text-default transition hover:bg-fill-neutural-subtle-hover"
            type="button"
            onClick={startEditing}
          >
            {team.name}
            <Pencil
              className="text-text-muted opacity-0 transition group-hover:opacity-100"
              size={12}
            />
          </button>
        )}

        {/* 언급에 쓰는 식별자는 팀명에서 공백을 뺀 값이라, 팀명과 다를 수 있어 함께 보여준다. */}
        <span className="text-xs text-text-muted">@{team.slug}</span>
        <span className="text-xs text-text-muted">멤버 {team.members.length}명</span>

        <span className="ml-auto flex items-center gap-1">
          {isConfirmingDelete ? (
            <>
              <span className="text-xs text-text-muted">팀을 삭제할까요?</span>
              <button
                className="rounded-md px-2 py-1 text-xs font-medium text-fg-state-error transition hover:bg-fill-neutural-subtle-hover"
                disabled={isSubmitting}
                type="button"
                onClick={handleDelete}
              >
                삭제
              </button>
              <button
                className="rounded-md px-2 py-1 text-xs text-text-muted transition hover:bg-fill-neutural-subtle-hover"
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
              >
                취소
              </button>
            </>
          ) : (
            <button
              aria-label={`${team.name} 삭제`}
              className="rounded-md p-1 text-text-muted transition hover:bg-fill-neutural-subtle-hover hover:text-fg-state-error"
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
            >
              <Trash2 size={14} />
            </button>
          )}
        </span>
      </div>

      {error && <p className="mt-2 text-xs text-fg-state-error">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {team.members.map((member) => (
          <span
            key={member.id}
            className="flex items-center gap-1 rounded-full border border-border bg-surface py-1 pl-1 pr-1.5 text-xs text-text-default"
          >
            <ProfileAvatar profile={member} size="sm" />
            {member.name}
            <button
              aria-label={`${member.name} 제거`}
              className={cn(
                "rounded-full p-0.5 text-text-muted transition hover:bg-fill-neutural-subtle-hover hover:text-fg-state-error",
                isSubmitting && "pointer-events-none opacity-50"
              )}
              type="button"
              onClick={() => handleRemoveMember(member.id)}
            >
              <X size={11} />
            </button>
          </span>
        ))}

        {addableProfiles.length > 0 ? (
          <ProfilePickerPopover
            allowClear={false}
            placeholder="+ 멤버 추가"
            profiles={addableProfiles}
            selectedId={null}
            triggerClassName="w-auto rounded-full border border-dashed border-border px-2 py-1"
            onSelect={handleAddMember}
          />
        ) : (
          <span className="text-xs text-text-muted">추가할 수 있는 팀원이 없습니다.</span>
        )}
      </div>
    </li>
  );
};

export default TeamCard;
