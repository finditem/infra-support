"use client";

import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import type { TaskCommentsRow } from "@/types/tables";
import { cn } from "@/utils";
import { createComment, deleteComment, updateComment } from "../../_lib/commentActions";
import type { MentionTarget } from "../../_lib/mentions";
import { buildProfileColorMap } from "../../_lib/kanbanUtils";
import type { ProfileWithColor } from "../../_types/kanban";
import CommentEditor from "./CommentEditor";
import CommentItem from "./CommentItem";

interface TaskCommentsProps {
  taskId: string;
  /** 이 일정의 댓글만, 작성 시각 오름차순. 상위에서 통째로 소유하고 변경분을 돌려받는다. */
  comments: TaskCommentsRow[];
  profiles: ProfileWithColor[];
  /** 언급 후보(팀 + 가입한 팀원). 본문의 "@슬러그"를 누구로 볼지 판정하는 기준이기도 하다. */
  mentionTargets: MentionTarget[];
  currentProfileId: string | null;
  onCommentsChange: (comments: TaskCommentsRow[]) => void;
  className?: string;
}

/**
 * 일정 하나에 달린 댓글 목록과 입력창. 일정 편집 모달과 일정 상세 페이지에서 함께 쓴다.
 *
 * 댓글 배열은 상위(칸반보드 / 상세 페이지)가 소유한다. 칸반 카드의 댓글 개수 배지가 같은 배열을
 * 보고 있어서, 이 컴포넌트가 따로 상태를 들면 등록 직후 개수가 어긋나기 때문이다.
 */
const TaskComments = ({
  taskId,
  comments,
  profiles,
  mentionTargets,
  currentProfileId,
  onCommentsChange,
  className,
}: TaskCommentsProps) => {
  const profileMap = useMemo(() => buildProfileColorMap(profiles), [profiles]);

  // 누가 언급되었는지는 서버 액션이 본문을 파싱해 정한다. DM 발송 대상이라 클라이언트 판정을 믿지 않는다.
  const handleCreate = async (body: string) => {
    const created = await createComment({ taskId, body });

    if (!created) return false;

    onCommentsChange([...comments, created]);
    return true;
  };

  const handleUpdate = async (id: string, body: string) => {
    const updated = await updateComment({ id, body });

    if (!updated) return false;

    onCommentsChange(comments.map((comment) => (comment.id === id ? updated : comment)));
    return true;
  };

  const handleDelete = async (id: string) => {
    const deleted = await deleteComment({ id });
    if (!deleted) return;

    onCommentsChange(comments.filter((comment) => comment.id !== id));
  };

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-1.5">
        <MessageSquare aria-hidden className="size-3.5 text-text-muted" />
        <span className="text-[11px] font-medium text-text-muted">댓글 {comments.length}</span>
      </div>

      {comments.length === 0 ? (
        <p className="text-xs text-text-muted">아직 댓글이 없습니다. 첫 의견을 남겨보세요.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              author={profileMap.get(comment.author_id) ?? null}
              comment={comment}
              isMine={comment.author_id === currentProfileId}
              mentionTargets={mentionTargets}
              onDelete={() => handleDelete(comment.id)}
              onUpdate={(body) => handleUpdate(comment.id, body)}
            />
          ))}
        </div>
      )}

      <CommentEditor
        clearAfterSubmit
        mentionTargets={mentionTargets}
        placeholder="댓글을 입력하세요. @로 팀이나 팀원을 언급할 수 있습니다."
        submitLabel="등록"
        onSubmit={handleCreate}
      />
    </section>
  );
};

export default TaskComments;
