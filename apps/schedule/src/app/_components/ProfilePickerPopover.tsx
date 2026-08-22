"use client";

import { useState } from "react";
import type { ProfileWithColor } from "../_types/kanban";
import ProfileAvatar from "./ProfileAvatar";
import PropertyPopover from "./TaskCreateModal/PropertyPopover";

interface ProfilePickerPopoverProps {
  label?: string;
  placeholder: string;
  profiles: ProfileWithColor[];
  selectedId: string | null;
  /** false면 "선택 안 함" 항목을 감춘다. 팀 멤버 추가처럼 해제가 필요 없는 곳에서 쓴다. */
  allowClear?: boolean;
  triggerClassName?: string;
  onSelect: (profileId: string | null) => void;
}

const ProfilePickerPopover = ({
  label,
  placeholder,
  profiles,
  selectedId,
  allowClear = true,
  triggerClassName,
  onSelect,
}: ProfilePickerPopoverProps) => {
  const [query, setQuery] = useState("");
  const selected = profiles.find((profile) => profile.id === selectedId) ?? null;
  const filtered = profiles.filter((profile) => profile.name.includes(query.trim()));

  return (
    <PropertyPopover
      label={label}
      trigger={
        selected ? (
          <span className="flex items-center gap-1 text-xs text-text-default">
            <ProfileAvatar profile={selected} size="sm" />
            {selected.name}
          </span>
        ) : (
          <span className="text-xs text-text-muted">{placeholder}</span>
        )
      }
      triggerClassName={triggerClassName}
    >
      {(close) => (
        <div className="flex flex-col gap-1">
          <input
            className="mb-1 w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-default outline-none"
            autoFocus
            placeholder="이름으로 검색"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          {allowClear && (
            <button
              className="rounded-md px-2 py-1.5 text-left text-xs text-text-muted hover:bg-fill-neutural-subtle-hover"
              type="button"
              onClick={() => {
                onSelect(null);
                close();
              }}
            >
              선택 안 함
            </button>
          )}

          {filtered.length === 0 && (
            <p className="px-2 py-1.5 text-xs text-text-muted">해당하는 팀원이 없습니다.</p>
          )}

          {filtered.map((profile) => (
            <button
              key={profile.id}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-text-default hover:bg-fill-neutural-subtle-hover"
              type="button"
              onClick={() => {
                onSelect(profile.id);
                close();
              }}
            >
              <ProfileAvatar profile={profile} size="sm" />
              {profile.name}
              {profile.id === selectedId && <span className="ml-auto text-primary">✓</span>}
            </button>
          ))}
        </div>
      )}
    </PropertyPopover>
  );
};

export default ProfilePickerPopover;
