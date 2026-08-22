"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { createPortal } from "react-dom";
import { useOutsideClose, usePopoverPosition } from "@/hooks";
import { cn } from "@/utils";
import {
  filterMentionTargets,
  getMentionKey,
  getMentionLabel,
  getMentionSlug,
} from "../_lib/mentions";
import type { MentionTarget } from "../_lib/mentions";
import ProfileAvatar from "./ProfileAvatar";

interface MentionPickerProps {
  isOpen: boolean;
  /** 팝오버를 붙일 입력 필드. 이 요소 아래(공간이 없으면 위)에 뜬다. */
  anchorRef: RefObject<HTMLElement>;
  /** "@" 뒤에 입력 중인 검색어. getActiveMention이 알려주는 값을 그대로 넘긴다. */
  query: string;
  targets: MentionTarget[];
  onSelect: (target: MentionTarget) => void;
  onClose: () => void;
}

/**
 * 입력 필드에서 "@"를 입력했을 때 뜨는 언급 대상 선택 팝오버.
 * 위/아래로 항목을 옮기고 Enter로 고르며 Esc로 닫는다.
 *
 * 텍스트 삽입은 이 컴포넌트가 직접 하지 않고 onSelect를 받은 쪽에서 처리한다.
 * `_lib/mentions.ts`의 getActiveMention/insertMention과 함께 쓰면 된다.
 *
 * ```tsx
 * const active = getActiveMention(text, caretIndex);
 * <MentionPicker
 *   isOpen={active !== null}
 *   anchorRef={inputRef}
 *   query={active?.query ?? ""}
 *   targets={targets}
 *   onClose={() => setCaretIndex(null)}
 *   onSelect={(target) => {
 *     const next = insertMention(text, active!.startIndex, caretIndex, getMentionSlug(target));
 *     setText(next.text);
 *   }}
 * />
 * ```
 */
const MentionPicker = ({
  isOpen,
  anchorRef,
  query,
  targets,
  onSelect,
  onClose,
}: MentionPickerProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filtered = useMemo(() => filterMentionTargets(targets, query), [targets, query]);
  const position = usePopoverPosition({ isOpen, anchorRef, panelRef });
  useOutsideClose(isOpen, [anchorRef, panelRef], onClose);

  // 검색어가 바뀌면 목록이 통째로 달라지므로 선택 위치를 처음으로 되돌린다.
  useEffect(() => setHighlightedIndex(0), [query, isOpen]);

  // 입력 필드가 포커스를 쥐고 있으므로 키 입력은 창 단위로 가로챈다.
  // capture 단계에서 처리해야 방향키가 입력 필드의 커서를 먼저 움직이지 않는다.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (filtered.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filtered.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const target = filtered[highlightedIndex] ?? filtered[0];
        onSelect(target);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, filtered, highlightedIndex, onSelect, onClose]);

  // 키보드로 목록 밖까지 내려가도 선택 항목이 보이도록 스크롤을 맞춘다.
  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.children[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [isOpen, highlightedIndex]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={panelRef}
      className="fixed z-[300] w-64 rounded-xl border border-border bg-surface-elevated p-2 shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)]"
      style={{ top: position.top, left: position.left }}
    >
      {filtered.length === 0 ? (
        <p className="px-2 py-1.5 text-xs text-text-muted">언급할 팀이나 팀원이 없습니다.</p>
      ) : (
        <div ref={listRef} role="listbox" className="flex max-h-60 flex-col gap-1 overflow-y-auto">
          {filtered.map((target, index) => (
            <button
              key={getMentionKey(target)}
              aria-selected={index === highlightedIndex}
              role="option"
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-text-default",
                index === highlightedIndex
                  ? "bg-fill-neutural-subtle-hover"
                  : "hover:bg-fill-neutural-subtle-hover"
              )}
              type="button"
              onClick={() => onSelect(target)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {target.kind === "team" ? (
                <span
                  className="size-4 shrink-0 rounded-full"
                  style={{ backgroundColor: target.team.color }}
                />
              ) : (
                <ProfileAvatar profile={target.profile} size="sm" />
              )}

              <span className="truncate">{getMentionLabel(target)}</span>
              <span className="truncate text-text-muted">@{getMentionSlug(target)}</span>

              {target.kind === "team" && (
                <span className="ml-auto shrink-0 text-text-muted">
                  {target.team.members.length}명
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
};

export default MentionPicker;
