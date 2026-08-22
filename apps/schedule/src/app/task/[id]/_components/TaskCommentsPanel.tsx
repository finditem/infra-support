"use client";

import { useState } from "react";
import type { TaskCommentsRow } from "@/types/tables";
import TaskComments from "../../../_components/TaskComments/TaskComments";
import type { ProfileWithColor } from "../../../_types/kanban";

interface TaskCommentsPanelProps {
  taskId: string;
  initialComments: TaskCommentsRow[];
  profiles: ProfileWithColor[];
  currentProfileId: string | null;
}

/**
 * 상세 페이지에서 상위 일정의 댓글을 보여주는 카드.
 *
 * 칸반보드와 달리 이 화면에는 댓글 개수를 표시하는 카드가 없어, 상태를 더 위로 올릴 필요 없이
 * 이 컴포넌트가 직접 들고 있는다.
 */
const TaskCommentsPanel = ({
  taskId,
  initialComments,
  profiles,
  currentProfileId,
}: TaskCommentsPanelProps) => {
  const [comments, setComments] = useState(initialComments);

  return (
    <div className="rounded-xl border border-border bg-surface-elevated px-4 py-5 sm:px-8">
      <TaskComments
        comments={comments}
        currentProfileId={currentProfileId}
        profiles={profiles}
        taskId={taskId}
        onCommentsChange={setComments}
      />
    </div>
  );
};

export default TaskCommentsPanel;
