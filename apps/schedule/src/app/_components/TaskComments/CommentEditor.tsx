"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, SyntheticEvent } from "react";
import { CornerDownLeft } from "lucide-react";
import type { ActiveMentionQuery } from "@/utils";
import {
  findActiveMentionQuery,
  replaceMentionQuery,
  toMentionDisplayText,
  toMentionStoredBody,
} from "@/utils";
import type { ProfileWithColor } from "../../_types/kanban";
import MentionAutocomplete from "./MentionAutocomplete";

interface CommentEditorProps {
  profiles: ProfileWithColor[];
  placeholder: string;
  submitLabel: string;
  initialBody?: string;
  autoFocus?: boolean;
  /** 등록 성공 후 입력창을 비울지 여부. 새 댓글 작성에는 true, 기존 댓글 수정에는 false를 쓴다. */
  clearAfterSubmit?: boolean;
  /** 마커로 직렬화한 본문을 넘긴다. 저장 성공 여부를 돌려받아, 실패 시 입력 내용을 유지한다. */
  onSubmit: (body: string) => Promise<boolean>;
  onCancel?: () => void;
}

/**
 * 멘션 자동완성이 붙은 댓글 입력창. 새 댓글 작성과 기존 댓글 수정에 같은 컴포넌트를 쓴다.
 *
 * 입력창에는 식별자가 드러나지 않도록 `@이름`만 보여주고, 저장 직전에 등록된 팀원 이름과 대조해
 * `@[이름](profile_id)` 마커로 직렬화한다. 자동완성으로 고르든 직접 치든 붙여넣든 결과가 같다.
 *
 * 일정 모달 안에서 쓰이므로 Escape와 커맨드+엔터는 입력창에서 처리한 뒤 전파를 막는다.
 * 그렇지 않으면 자동완성만 닫으려다 모달이 닫히거나, 댓글 대신 일정이 저장된다.
 */
const CommentEditor = ({
  profiles,
  placeholder,
  submitLabel,
  initialBody = "",
  autoFocus = false,
  clearAfterSubmit = false,
  onSubmit,
  onCancel,
}: CommentEditorProps) => {
  const [body, setBody] = useState(() => toMentionDisplayText(initialBody));
  const [mentionQuery, setMentionQuery] = useState<ActiveMentionQuery | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const candidates = mentionQuery
    ? profiles.filter((profile) => profile.name.includes(mentionQuery.query.trim()))
    : [];

  const refreshMentionQuery = (value: string, caretIndex: number) => {
    setMentionQuery(findActiveMentionQuery(value, caretIndex));
    setActiveIndex(0);
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value);
    refreshMentionQuery(event.target.value, event.target.selectionStart);
  };

  const handleCaretMove = (event: SyntheticEvent<HTMLTextAreaElement>) => {
    refreshMentionQuery(event.currentTarget.value, event.currentTarget.selectionStart);
  };

  const insertMention = (profile: ProfileWithColor) => {
    const textarea = textareaRef.current;
    if (!textarea || !mentionQuery) return;

    const next = replaceMentionQuery(
      body,
      mentionQuery,
      textarea.selectionStart,
      `@${profile.name}`
    );

    setBody(next.value);
    setMentionQuery(null);
    setActiveIndex(0);

    // setBody가 반영된 뒤에 커서를 옮겨야 마커 뒤가 아니라 예전 위치로 튀지 않는다.
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(next.caretIndex, next.caretIndex);
    });
  };

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    const succeeded = await onSubmit(toMentionStoredBody(trimmed, profiles));
    setIsSubmitting(false);

    if (succeeded && clearAfterSubmit) {
      setBody("");
      setMentionQuery(null);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const isMentionOpen = mentionQuery !== null;

    if (isMentionOpen && candidates.length > 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % candidates.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + candidates.length) % candidates.length);
        return;
      }

      if (event.key === "Enter" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        insertMention(candidates[activeIndex]);
        return;
      }
    }

    if (isMentionOpen && event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setMentionQuery(null);
      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      void handleSubmit();
    }
  };

  return (
    <div className="flex flex-col">
      <textarea
        ref={textareaRef}
        className="placeholder:text-text-muted/50 min-h-[60px] w-full resize-none rounded-[10px] border border-border bg-surface px-2.5 py-2 text-[13px] leading-[1.7] text-text-default outline-none focus:border-primary"
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={body}
        onChange={handleChange}
        onClick={handleCaretMove}
        onKeyDown={handleKeyDown}
        onSelect={handleCaretMove}
      />

      {mentionQuery !== null && (
        <MentionAutocomplete
          activeIndex={activeIndex}
          profiles={candidates}
          onActiveIndexChange={setActiveIndex}
          onSelect={insertMention}
        />
      )}

      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="text-text-muted/60 flex items-center gap-1 text-[11px]">
          <kbd className="rounded border border-border bg-fill-neutural-subtle-default px-[5px] py-px font-mono text-[10px]">
            ⌘
          </kbd>
          <kbd className="rounded border border-border bg-fill-neutural-subtle-default px-[5px] py-px font-mono text-[10px]">
            <CornerDownLeft aria-hidden className="size-2.5" />
          </kbd>
          으로 등록, @로 팀원 멘션
        </span>

        <div className="flex shrink-0 gap-1.5">
          {onCancel && (
            <button
              className="rounded-[7px] border border-border bg-surface-elevated px-3 py-1 text-[11px] font-medium text-text-muted hover:bg-fill-neutural-subtle-hover"
              type="button"
              onClick={onCancel}
            >
              취소
            </button>
          )}
          <button
            className="rounded-[7px] bg-primary px-3 py-1 text-[11px] font-semibold text-text-inverse hover:bg-primary-hover disabled:opacity-50"
            disabled={!body.trim() || isSubmitting}
            type="button"
            onClick={() => void handleSubmit()}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentEditor;
