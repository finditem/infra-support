"use client";

import { Fragment, useState } from "react";
import { differenceInSeconds, format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { TaskCommentsRow } from "@/types/tables";
import type { ProfileWithColor } from "../../_types/kanban";
import { getMentionLabel, splitMentionSegments } from "../../_lib/mentions";
import type { MentionTarget } from "../../_lib/mentions";
import ProfileAvatar from "../ProfileAvatar";
import CommentEditor from "./CommentEditor";

interface CommentItemProps {
  comment: TaskCommentsRow;
  author: ProfileWithColor | null;
  mentionTargets: MentionTarget[];
  isMine: boolean;
  onUpdate: (body: string) => Promise<boolean>;
  onDelete: () => Promise<void>;
}

/** 작성자 프로필을 찾지 못했을 때 쓰는 표시용 이름과 아바타 색. */
const UNKNOWN_AUTHOR_NAME = "알 수 없음";
const UNKNOWN_AUTHOR_COLOR = "#d4d4d8";

/**
 * date-fns의 한국어 출력은 1분이 안 된 시각을 "1분 미만 전"으로 적는데, 다른 항목이 모두
 * "5분 전"처럼 끝나는 목록에서 혼자 튄다. 1분 미만은 "1분 전"으로 올려 표기를 맞춘다.
 */
const formatCommentTime = (date: Date) => {
  if (differenceInSeconds(new Date(), date) < 60) return "1분 전";

  return formatDistanceToNow(date, { addSuffix: true, locale: ko });
};

const CommentItem = ({
  comment,
  author,
  mentionTargets,
  isMine,
  onUpdate,
  onDelete,
}: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createdAt = comment.created_at ? new Date(comment.created_at) : null;

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!window.confirm("이 댓글을 삭제할까요?")) return;

    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  return (
    <div className="flex gap-2">
      {author ? (
        <ProfileAvatar profile={author} />
      ) : (
        <span
          aria-hidden
          className="flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-slate-800"
          style={{ backgroundColor: UNKNOWN_AUTHOR_COLOR }}
        >
          ?
        </span>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-xs font-semibold text-text-default">
            {author?.name ?? UNKNOWN_AUTHOR_NAME}
          </span>

          {createdAt && (
            <time
              className="text-[11px] text-text-muted"
              dateTime={createdAt.toISOString()}
              // 서버 렌더링과 하이드레이션 사이에 상대 시간 문구가 달라질 수 있어 경고만 끈다.
              suppressHydrationWarning
              title={format(createdAt, "yyyy-MM-dd HH:mm")}
            >
              {formatCommentTime(createdAt)}
            </time>
          )}

          {isMine && !isEditing && (
            <span className="ml-auto flex shrink-0 gap-1">
              <button
                className="rounded-md px-1.5 py-0.5 text-[11px] text-text-muted hover:bg-fill-neutural-subtle-hover"
                type="button"
                onClick={() => setIsEditing(true)}
              >
                수정
              </button>
              <button
                className="rounded-md px-1.5 py-0.5 text-[11px] text-text-muted hover:bg-fill-neutural-subtle-hover disabled:opacity-50"
                disabled={isDeleting}
                type="button"
                onClick={() => void handleDelete()}
              >
                삭제
              </button>
            </span>
          )}
        </div>

        {isEditing ? (
          <CommentEditor
            autoFocus
            initialBody={comment.body}
            mentionTargets={mentionTargets}
            placeholder="댓글을 수정하세요..."
            submitLabel="수정"
            onCancel={() => setIsEditing(false)}
            onSubmit={async (body) => {
              const succeeded = await onUpdate(body);
              if (succeeded) setIsEditing(false);
              return succeeded;
            }}
          />
        ) : (
          <p className="whitespace-pre-wrap break-words text-[13px] leading-[1.7] text-text-default">
            {splitMentionSegments(comment.body, mentionTargets).map((segment, index) =>
              segment.type === "mention" ? (
                <span
                  key={index}
                  className="bg-primary/10 rounded px-1 py-px font-medium text-primary"
                  title={getMentionLabel(segment.target)}
                >
                  @{segment.slug}
                </span>
              ) : (
                <Fragment key={index}>{segment.text}</Fragment>
              )
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
