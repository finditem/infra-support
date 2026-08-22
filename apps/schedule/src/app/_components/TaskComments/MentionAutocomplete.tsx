"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/utils";
import type { ProfileWithColor } from "../../_types/kanban";
import ProfileAvatar from "../ProfileAvatar";

interface MentionAutocompleteProps {
  profiles: ProfileWithColor[];
  activeIndex: number;
  onSelect: (profile: ProfileWithColor) => void;
  onActiveIndexChange: (index: number) => void;
}

/**
 * 댓글 입력창 바로 아래에 문서 흐름 그대로 펼쳐지는 멘션 후보 목록.
 * 모달 본문이 세로 스크롤 컨테이너라 절대 위치 팝업은 위쪽으로 잘릴 수 있어, 흐름 안에 두고 스크롤시킨다.
 */
const MentionAutocomplete = ({
  profiles,
  activeIndex,
  onSelect,
  onActiveIndexChange,
}: MentionAutocompleteProps) => {
  const activeItemRef = useRef<HTMLButtonElement>(null);

  // 키보드로 이동하면 활성 항목이 목록 밖으로 밀려나므로 보이는 자리까지 끌어온다.
  // block: "nearest"라 이미 보이는 상태에서는 아무것도 움직이지 않는다.
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (profiles.length === 0) {
    return (
      <p className="mt-1 rounded-[10px] border border-border bg-surface-elevated px-2 py-2 text-[11px] text-text-muted">
        멘션할 팀원을 찾지 못했습니다.
      </p>
    );
  }

  return (
    <ul
      aria-label="멘션할 팀원"
      role="listbox"
      className="mt-1 flex max-h-40 flex-col gap-0.5 overflow-y-auto rounded-[10px] border border-border bg-surface-elevated p-1"
    >
      {profiles.map((profile, index) => (
        <li key={profile.id} role="none">
          <button
            ref={index === activeIndex ? activeItemRef : null}
            aria-selected={index === activeIndex}
            role="option"
            className={cn(
              "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-text-default",
              index === activeIndex
                ? "bg-fill-neutural-subtle-hover"
                : "hover:bg-fill-neutural-subtle-hover"
            )}
            type="button"
            onClick={() => onSelect(profile)}
            // 클릭 시 textarea의 포커스와 커서 위치가 먼저 날아가지 않도록 mousedown을 막는다.
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => onActiveIndexChange(index)}
          >
            <ProfileAvatar profile={profile} size="sm" />
            {profile.name}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default MentionAutocomplete;
