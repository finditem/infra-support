"use client";

import type { ProfileWithColor } from "../../_types/kanban";

interface MemberSidebarProps {
  profiles: ProfileWithColor[];
  selectedProfileId: string | null;
  onSelectProfile: (profileId: string | null) => void;
}

const MemberSidebar = ({ profiles, selectedProfileId, onSelectProfile }: MemberSidebarProps) => {
  return (
    <aside className="w-[220px] shrink-0 border-r border-border bg-surface-elevated p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        팀원 필터
      </p>

      <button
        className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-[6px] text-left transition ${
          selectedProfileId === null ? "bg-primary/10" : "hover:bg-fill-neutural-subtle-hover"
        }`}
        type="button"
        onClick={() => onSelectProfile(null)}
      >
        <span aria-hidden className="size-[10px] rounded-full bg-primary" />
        <span className="text-sm text-text-default">전체</span>
        {selectedProfileId === null && <span className="ml-auto text-xs text-primary">✓</span>}
      </button>

      {profiles.map((profile) => (
        <button
          key={profile.id}
          className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-[6px] text-left transition ${
            selectedProfileId === profile.id
              ? "bg-primary/10"
              : "hover:bg-fill-neutural-subtle-hover"
          }`}
          type="button"
          onClick={() => onSelectProfile(profile.id)}
        >
          <span aria-hidden className={`size-[10px] rounded-full ${profile.colorClassName}`} />
          <span className="text-sm text-text-default">{profile.name}</span>
          {selectedProfileId === profile.id && (
            <span className="ml-auto text-xs text-primary">✓</span>
          )}
        </button>
      ))}
    </aside>
  );
};

export default MemberSidebar;
