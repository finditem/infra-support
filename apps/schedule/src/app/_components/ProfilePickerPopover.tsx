"use client";

import { useState } from "react";
import type { ProfileWithColor } from "../_types/kanban";
import ProfileAvatar from "./ProfileAvatar";
import PropertyPopover from "./TaskCreateModal/PropertyPopover";

interface ProfilePickerPopoverProps {
  label?: string;
  placeholder: string;
  /** 트리거에 항상 남겨둘 용도 표시(예: "담당자"). 팀원을 고른 뒤에도 어느 필터인지 구분되도록 한다. */
  typeLabel?: string;
  profiles: ProfileWithColor[];
  selectedId: string | null;
  /** false면 선택 해제 항목을 감춘다. 팀 멤버 추가처럼 해제가 필요 없는 곳에서 쓴다. */
  allowClear?: boolean;
  /** 선택 해제 항목에 쓰는 문구. 필터처럼 "해제"가 아니라 "전체"가 더 맞는 맥락에서 바꿔 쓴다. */
  clearLabel?: string;
  triggerClassName?: string;
  onSelect: (profileId: string | null) => void;
}

const ProfilePickerPopover = ({
  label,
  placeholder,
  typeLabel,
  profiles,
  selectedId,
  allowClear = true,
  clearLabel = "선택 안 함",
  triggerClassName,
  onSelect,
}: ProfilePickerPopoverProps) => {
  const [query, setQuery] = useState("");
  const selected = profiles.find((profile) => profile.id === selectedId) ?? null;
  const filtered = profiles.filter((profile) => profile.name.includes(query.trim()));

  const selectedLabel = selected ? selected.name : clearLabel;
  const triggerAriaLabel = typeLabel ? `${typeLabel} 필터, 현재 ${selectedLabel}` : undefined;

  return (
    <PropertyPopover
      label={label}
      trigger={
        selected ? (
          <span className="flex items-center gap-1 text-xs text-text-default">
            {typeLabel && <span className="text-text-muted">{typeLabel}:</span>}
            <ProfileAvatar profile={selected} size="sm" />
            {selected.name}
          </span>
        ) : (
          <span className="text-xs text-text-muted">{placeholder}</span>
        )
      }
      triggerAriaLabel={triggerAriaLabel}
      triggerClassName={triggerClassName}
      // 팝오버가 닫히면 다음에 다시 열 때 이전 검색어가 남아 목록이 걸러진 채로 보이지 않도록 초기화한다.
      onClose={() => setQuery("")}
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
              {clearLabel}
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
