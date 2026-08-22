"use client";

import { type FormEvent, useState } from "react";
import { Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils";
import ProfileAvatar from "../../../_components/ProfileAvatar";
import ProfilePickerPopover from "../../../_components/ProfilePickerPopover";
import type { ProfileWithColor } from "../../../_types/kanban";
import type { TeamWithMembers } from "../../../_types/teams";
import {
  settingsIconButtonClassName,
  settingsInputClassName,
  settingsRowClassName,
  settingsTextButtonClassName,
} from "../../_lib/styles";
import { addTeamMember, deleteTeam, removeTeamMember, updateTeam } from "../_lib/actions";

interface TeamCardProps {
  team: TeamWithMembers;
  profiles: ProfileWithColor[];
}

/**
 * 팀 하나를 보여주고 그 자리에서 팀명 수정, 삭제, 멤버 추가/제거를 처리한다.
 * 변경은 모두 Server Action으로 저장한 뒤 router.refresh()로 서버 데이터를 다시 받아온다.
 *
 * 행의 생김새와 수정/삭제 흐름은 스프린트 목록(SprintList)과 같은 형태로 맞췄다.
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
  const canSaveEdit = draftName.trim() !== "" && !isSubmitting;

  const startEditing = () => {
    setDraftName(team.name);
    setError(null);
    setIsEditing(true);
  };

  const handleRename = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSaveEdit) return;

    const name = draftName.trim();

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

  const colorDot = (
    <span
      className="size-3 shrink-0 rounded-full"
      style={{ backgroundColor: team.color }}
      title={`팀 색상 ${team.color}`}
    />
  );

  const renderRow = () => {
    if (isConfirmingDelete) {
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-default">삭제할까요?</span>
          <div className="flex items-center gap-1">
            <button
              className={cn(settingsTextButtonClassName, "text-fg-state-error")}
              disabled={isSubmitting}
              type="button"
              onClick={handleDelete}
            >
              삭제
            </button>
            <button
              className={cn(settingsTextButtonClassName, "text-text-muted")}
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
            >
              취소
            </button>
          </div>
        </div>
      );
    }

    if (isEditing) {
      return (
        <form className="flex flex-wrap items-center gap-2" onSubmit={handleRename}>
          {colorDot}
          <input
            className={settingsInputClassName}
            autoFocus
            disabled={isSubmitting}
            type="text"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
          />
          <button
            className={cn(settingsTextButtonClassName, "ml-auto text-primary disabled:opacity-50")}
            disabled={!canSaveEdit}
            type="submit"
          >
            저장
          </button>
          <button
            className={cn(settingsTextButtonClassName, "text-text-muted")}
            type="button"
            onClick={() => {
              setIsEditing(false);
              setError(null);
            }}
          >
            취소
          </button>
        </form>
      );
    }

    return (
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          {colorDot}
          <span className="truncate text-sm font-medium text-text-default">{team.name}</span>
          {/* 언급에 쓰는 식별자는 팀명에서 공백을 뺀 값이라, 팀명과 다를 수 있어 함께 보여준다. */}
          <span className="shrink-0 text-xs text-text-muted">@{team.slug}</span>
        </span>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xs text-text-muted">멤버 {team.members.length}명</span>
          <button
            aria-label="팀 수정"
            className={settingsIconButtonClassName}
            type="button"
            onClick={startEditing}
          >
            <Pencil size={13} />
          </button>
          <button
            aria-label="팀 삭제"
            className={settingsIconButtonClassName}
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  return (
    <li className={cn(settingsRowClassName, isEditing && "border-primary")}>
      {renderRow()}

      {error && <p className="mt-2 text-xs text-fg-state-error">{error}</p>}

      {!isConfirmingDelete && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
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
      )}
    </li>
  );
};

export default TeamCard;
