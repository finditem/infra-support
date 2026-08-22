"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, SyntheticEvent } from "react";
import { CornerDownLeft } from "lucide-react";
import { getActiveMention, getMentionSlug, insertMention } from "../../_lib/mentions";
import type { MentionTarget } from "../../_lib/mentions";
import MentionPicker from "../MentionPicker";

interface CommentEditorProps {
  /** 언급 후보(팀 + 가입한 팀원). buildMentionTargets로 만든 목록을 그대로 넘긴다. */
  mentionTargets: MentionTarget[];
  placeholder: string;
  submitLabel: string;
  initialBody?: string;
  autoFocus?: boolean;
  /** 등록 성공 후 입력창을 비울지 여부. 새 댓글 작성에는 true, 기존 댓글 수정에는 false를 쓴다. */
  clearAfterSubmit?: boolean;
  /** 저장 성공 여부를 돌려받아, 실패 시 입력 내용을 유지한다. */
  onSubmit: (body: string) => Promise<boolean>;
  onCancel?: () => void;
}

/**
 * 언급 자동완성이 붙은 댓글 입력창. 새 댓글 작성과 기존 댓글 수정에 같은 컴포넌트를 쓴다.
 *
 * 본문은 `@슬러그` 평문 그대로 저장하고, 누구를 부른 것인지는 저장 시점에 후보 목록과 대조해
 * 판정한다. 언급 판정과 자동완성 팝오버는 `_lib/mentions.ts`와 `MentionPicker`를 그대로 쓴다.
 *
 * 일정 모달 안에서 쓰이므로 Escape와 커맨드+엔터는 입력창에서 처리한 뒤 전파를 막는다.
 * 그렇지 않으면 자동완성만 닫으려다 모달이 함께 닫히거나, 댓글 대신 일정이 저장된다.
 */
const CommentEditor = ({
  mentionTargets,
  placeholder,
  submitLabel,
  initialBody = "",
  autoFocus = false,
  clearAfterSubmit = false,
  onSubmit,
  onCancel,
}: CommentEditorProps) => {
  const [body, setBody] = useState(initialBody);
  const [caretIndex, setCaretIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeMention = caretIndex === null ? null : getActiveMention(body, caretIndex);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value);
    setCaretIndex(event.target.selectionStart);
  };

  const handleCaretMove = (event: SyntheticEvent<HTMLTextAreaElement>) => {
    setCaretIndex(event.currentTarget.selectionStart);
  };

  const handleSelectMention = (target: MentionTarget) => {
    const textarea = textareaRef.current;
    if (!textarea || !activeMention) return;

    const next = insertMention(
      body,
      activeMention.startIndex,
      textarea.selectionStart,
      getMentionSlug(target)
    );

    setBody(next.text);
    setCaretIndex(next.caretIndex);

    // setBody가 반영된 뒤에 커서를 옮겨야 삽입한 언급 뒤가 아니라 예전 위치로 튀지 않는다.
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(next.caretIndex, next.caretIndex);
    });
  };

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    const succeeded = await onSubmit(trimmed);
    setIsSubmitting(false);

    if (succeeded && clearAfterSubmit) {
      setBody("");
      setCaretIndex(null);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // 팝오버는 window에서 키를 가로채 Escape를 스스로 처리하지만 전파까지 막지는 않는다.
    // 여기서 막지 않으면 자동완성을 닫으려던 Escape가 모달까지 올라가 모달이 함께 닫힌다.
    if (activeMention && event.key === "Escape") {
      event.stopPropagation();
      setCaretIndex(null);
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

      <MentionPicker
        anchorRef={textareaRef}
        isOpen={activeMention !== null}
        query={activeMention?.query ?? ""}
        targets={mentionTargets}
        onClose={() => setCaretIndex(null)}
        onSelect={handleSelectMention}
      />

      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="text-text-muted/60 flex items-center gap-1 text-[11px]">
          <kbd className="rounded border border-border bg-fill-neutural-subtle-default px-[5px] py-px font-mono text-[10px]">
            ⌘
          </kbd>
          <kbd className="rounded border border-border bg-fill-neutural-subtle-default px-[5px] py-px font-mono text-[10px]">
            <CornerDownLeft aria-hidden className="size-2.5" />
          </kbd>
          으로 등록, @로 팀이나 팀원 언급
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
