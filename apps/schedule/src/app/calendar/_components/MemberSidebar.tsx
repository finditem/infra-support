"use client";

import { useBodyScrollLock, useEscapeKey } from "@/hooks";
import { cn } from "@/utils";
import type { ProfileWithColor } from "../../_types/kanban";

interface MemberSidebarProps {
  profiles: ProfileWithColor[];
  selectedProfileId: string | null;
  onSelectProfile: (profileId: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MemberSidebar = ({
  profiles,
  selectedProfileId,
  onSelectProfile,
  isOpen,
  onClose,
}: MemberSidebarProps) => {
  // 모바일에서만 딤 레이어를 깔고 서랍처럼 덮으므로, 열려 있는 동안만 모달과 같은 규칙을 적용한다.
  useEscapeKey(onClose, isOpen);
  useBodyScrollLock(isOpen);

  return (
    <>
      {isOpen && (
        <div aria-hidden className="fixed inset-0 z-40 bg-black/40 sm:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[220px] shrink-0 overflow-y-auto border-r border-border bg-surface-elevated p-4 transition-transform duration-200 sm:static sm:z-auto sm:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
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
            <span
              aria-hidden
              className="size-[10px] rounded-full"
              style={{ backgroundColor: profile.color }}
            />
            <span className="text-sm text-text-default">{profile.name}</span>
            {selectedProfileId === profile.id && (
              <span className="ml-auto text-xs text-primary">✓</span>
            )}
          </button>
        ))}
      </aside>
    </>
  );
};

export default MemberSidebar;
