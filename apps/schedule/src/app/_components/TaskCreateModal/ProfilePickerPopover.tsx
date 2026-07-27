"use client";

import { useState } from "react";
import { getInitial } from "../../_lib/kanbanUtils";
import type { ProfileWithColor } from "../../_types/kanban";
import PropertyPopover from "./PropertyPopover";

interface ProfilePickerPopoverProps {
  label: string;
  placeholder: string;
  profiles: ProfileWithColor[];
  selectedId: string | null;
  onSelect: (profileId: string | null) => void;
}

const ProfilePickerPopover = ({
  label,
  placeholder,
  profiles,
  selectedId,
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
            <span
              className="flex size-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
              style={{ backgroundColor: selected.color }}
            >
              {getInitial(selected.name)}
            </span>
            {selected.name}
          </span>
        ) : (
          <span className="text-xs text-text-muted">{placeholder}</span>
        )
      }
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
              <span
                className="flex size-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
                style={{ backgroundColor: profile.color }}
              >
                {getInitial(profile.name)}
              </span>
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
