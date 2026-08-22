"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { format } from "date-fns";
import { CornerDownLeft } from "lucide-react";
import { createTask, deleteTask, updateTask } from "../../_lib/actions";
import { getDefaultDueDate, getMonday, getWeekLabel } from "../../_lib/kanbanUtils";
import type { ProfileWithColor } from "../../_types/kanban";
import { ModalOverlay } from "@/components/ModalOverlay";
import type { TaskCommentsRow, TaskStatusesRow, TasksRow } from "@/types/tables";
import ProfilePickerPopover from "../ProfilePickerPopover";
import type { MentionTarget } from "../../_lib/mentions";
import TaskComments from "../TaskComments/TaskComments";
import DatePickerPopover from "./DatePickerPopover";
import PriorityPickerPopover from "./PriorityPickerPopover";
import StatusPickerPopover from "./StatusPickerPopover";

interface SubtaskDraft {
  id: string;
  title: string;
  body: string;
}

interface TaskCreateModalProps {
  weekId: string | null;
  statuses: TaskStatusesRow[];
  profiles: ProfileWithColor[];
  currentProfileId: string | null;
  initialStatusId: string;
  parentId?: string | null;
  parentTitle?: string | null;
  task?: TasksRow | null;
  /** 편집 모드에서만 쓰는 이 일정의 댓글 목록. 생성 모드에서는 아직 일정이 없어 댓글도 없다. */
  comments?: TaskCommentsRow[];
  /** 댓글에서 언급할 수 있는 팀과 팀원 목록. */
  mentionTargets?: MentionTarget[];
  onClose: () => void;
  onSaved: (tasks: TasksRow[]) => void;
  onCommentsChange?: (comments: TaskCommentsRow[]) => void;
  /** 삭제된 일정 id 목록(하위 일정 포함)을 전달한다. */
  onDeleted: (taskIds: string[]) => void;
}

const TaskCreateModal = ({
  weekId,
  statuses,
  profiles,
  currentProfileId,
  initialStatusId,
  parentId = null,
  parentTitle = null,
  task = null,
  comments = [],
  mentionTargets = [],
  onClose,
  onSaved,
  onCommentsChange,
  onDeleted,
}: TaskCreateModalProps) => {
  const [title, setTitle] = useState(task?.title ?? "");
  const [body, setBody] = useState(task?.body ?? "");
  const [assigneeId, setAssigneeId] = useState<string | null>(
    task?.assignee_id ?? currentProfileId
  );
  const [reporterId, setReporterId] = useState<string | null>(
    task?.reporter_id ?? currentProfileId
  );
  const [priority, setPriority] = useState<TasksRow["priority"]>(task?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(() =>
    format(task?.due_date ? new Date(task.due_date) : getDefaultDueDate(), "yyyy-MM-dd")
  );
  const [statusId, setStatusId] = useState(task?.status_id ?? initialStatusId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [subtaskDrafts, setSubtaskDrafts] = useState<SubtaskDraft[]>([]);

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const weekLabel = getWeekLabel(getMonday(new Date(dueDate)));
  const isEditing = !!task;
  const canAddSubtasks = !isEditing && !parentId;

  const addSubtaskDraft = () =>
    setSubtaskDrafts((prev) => [...prev, { id: crypto.randomUUID(), title: "", body: "" }]);

  const updateSubtaskDraft = (id: string, patch: Partial<Omit<SubtaskDraft, "id">>) =>
    setSubtaskDrafts((prev) =>
      prev.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft))
    );

  const removeSubtaskDraft = (id: string) =>
    setSubtaskDrafts((prev) => prev.filter((draft) => draft.id !== id));

  const handleTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      bodyRef.current?.focus();
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const saved = task
      ? await updateTask({
          id: task.id,
          title: title.trim(),
          body: body.trim() || null,
          weekId,
          statusId,
          assigneeId,
          reporterId,
          priority,
          dueDate,
        })
      : await createTask({
          title: title.trim(),
          body: body.trim() || null,
          weekId,
          statusId,
          assigneeId,
          reporterId,
          priority,
          dueDate,
          createdBy: currentProfileId,
          parentId,
        });

    if (!saved) {
      setIsSubmitting(false);
      return;
    }

    const savedRows: TasksRow[] = [saved];
    const failedTitles: string[] = [];

    if (canAddSubtasks) {
      for (const draft of subtaskDrafts) {
        if (!draft.title.trim()) continue;

        const savedSubtask = await createTask({
          title: draft.title.trim(),
          body: draft.body.trim() || null,
          weekId,
          statusId,
          assigneeId: null,
          reporterId: null,
          priority: "medium",
          dueDate,
          createdBy: currentProfileId,
          parentId: saved.id,
        });

        if (savedSubtask) {
          savedRows.push(savedSubtask);
        } else {
          failedTitles.push(draft.title.trim());
        }
      }
    }

    setIsSubmitting(false);
    onSaved(savedRows);

    if (failedTitles.length > 0) {
      window.alert(`다음 하위 일정 생성에 실패했습니다: ${failedTitles.join(", ")}`);
    }
  };

  const handleDelete = async () => {
    if (!task || isDeleting) return;

    const confirmed = window.confirm(
      "이 일정을 삭제할까요? 하위 일정이 있으면 함께 삭제되며 되돌릴 수 없습니다."
    );

    if (!confirmed) return;

    setIsDeleting(true);

    const deletedIds = await deleteTask(task.id);

    setIsDeleting(false);

    if (!deletedIds) {
      window.alert("일정 삭제에 실패했습니다.");
      return;
    }

    onDeleted(deletedIds);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <ModalOverlay className="z-[200] p-5" onClose={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl bg-surface-elevated shadow-[0_24px_48px_rgba(0,0,0,0.16)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
        onKeyDown={handleKeyDown}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-[18px] py-3">
          <span className="text-xs text-text-muted">
            {parentTitle ?? "팀 일정"} <span className="mx-[3px] text-border">/</span>
            <strong className="font-medium text-text-default">
              {isEditing ? " 일정 수정" : parentTitle ? " 새 하위 일정" : " 새 작업"}
            </strong>
          </span>
          <button
            aria-label="닫기"
            className="flex size-6 items-center justify-center rounded-md bg-fill-neutural-subtle-default text-text-muted hover:bg-fill-neutural-subtle-hover"
            type="button"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="px-5 pt-[18px]">
            <input
              className="placeholder:text-text-muted/50 w-full border-none bg-transparent text-[17px] font-semibold text-text-default outline-none"
              autoFocus
              placeholder="작업 제목을 입력하세요"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={handleTitleKeyDown}
            />
          </div>

          <div className="grid grid-cols-1 gap-[2px] px-5 py-3 sm:grid-cols-2">
            <ProfilePickerPopover
              label="담당자"
              placeholder="담당자 선택"
              profiles={profiles}
              selectedId={assigneeId}
              onSelect={setAssigneeId}
            />
            <ProfilePickerPopover
              label="보고자"
              placeholder="보고자 선택"
              profiles={profiles}
              selectedId={reporterId}
              onSelect={setReporterId}
            />
            <DatePickerPopover label="마감일" value={dueDate} onChange={setDueDate} />
            <PriorityPickerPopover label="우선순위" value={priority} onChange={setPriority} />
            <StatusPickerPopover
              label="상태"
              selectedId={statusId}
              statuses={statuses}
              onSelect={setStatusId}
            />
            <div className="flex items-center gap-1.5 rounded-md px-2 py-1.5">
              <span className="w-11 shrink-0 text-[11px] font-medium text-text-muted">주차</span>
              <span className="text-xs text-text-default">{weekLabel}</span>
            </div>
          </div>

          <div className="mx-5 h-px bg-border" />

          <div className="px-[46px] py-3">
            <textarea
              ref={bodyRef}
              className="placeholder:text-text-muted/50 min-h-[72px] w-full resize-none border-none bg-transparent text-[13px] leading-[1.75] text-text-muted outline-none"
              placeholder="설명을 추가하세요..."
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </div>

          {canAddSubtasks && (
            <div className="flex flex-col gap-2 border-t border-border px-5 py-3">
              <span className="text-[11px] font-medium text-text-muted">하위 일정</span>

              {subtaskDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex flex-col gap-1 rounded-[10px] border border-border p-2.5"
                >
                  <div className="flex items-center gap-1.5">
                    <input
                      className="placeholder:text-text-muted/50 w-full border-none bg-transparent text-[13px] font-medium text-text-default outline-none"
                      placeholder="하위 일정 제목"
                      type="text"
                      value={draft.title}
                      onChange={(event) =>
                        updateSubtaskDraft(draft.id, { title: event.target.value })
                      }
                    />
                    <button
                      aria-label="하위 일정 삭제"
                      className="flex size-5 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-fill-neutural-subtle-hover"
                      type="button"
                      onClick={() => removeSubtaskDraft(draft.id)}
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    className="placeholder:text-text-muted/50 min-h-10 w-full resize-none border-none bg-transparent text-xs leading-[1.6] text-text-muted outline-none"
                    placeholder="설명을 추가하세요..."
                    value={draft.body}
                    onChange={(event) => updateSubtaskDraft(draft.id, { body: event.target.value })}
                  />
                </div>
              ))}

              <button
                className="rounded-[10px] border border-dashed border-border py-2 text-xs font-medium text-text-muted hover:border-primary hover:text-primary"
                type="button"
                onClick={addSubtaskDraft}
              >
                + 하위 일정 추가
              </button>
            </div>
          )}

          {isEditing && task && onCommentsChange && (
            <TaskComments
              className="border-t border-border px-5 py-4"
              comments={comments}
              currentProfileId={currentProfileId}
              mentionTargets={mentionTargets}
              profiles={profiles}
              taskId={task.id}
              onCommentsChange={onCommentsChange}
            />
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-border px-[18px] py-3.5">
          <span className="text-text-muted/60 flex items-center gap-1 text-[11px]">
            <kbd className="rounded border border-border bg-fill-neutural-subtle-default px-[5px] py-px font-mono text-[10px]">
              ⌘
            </kbd>
            <kbd className="rounded border border-border bg-fill-neutural-subtle-default px-[5px] py-px font-mono text-[10px]">
              <CornerDownLeft aria-hidden className="size-2.5" />
            </kbd>
            {isEditing ? "으로 수정" : "으로 등록"}
          </span>

          <div className="flex gap-1.5">
            {isEditing && (
              <button
                className="rounded-[7px] border border-border bg-surface-elevated px-3.5 py-1.5 text-xs font-medium text-fg-state-error hover:bg-fill-neutural-subtle-hover disabled:opacity-50"
                disabled={isDeleting || isSubmitting}
                type="button"
                onClick={() => void handleDelete()}
              >
                삭제
              </button>
            )}
            <button
              className="rounded-[7px] border border-border bg-surface-elevated px-3.5 py-1.5 text-xs font-medium text-text-muted hover:bg-fill-neutural-subtle-hover"
              type="button"
              onClick={onClose}
            >
              취소
            </button>
            <button
              className="flex items-center gap-1 rounded-[7px] bg-primary px-4 py-1.5 text-xs font-semibold text-text-inverse hover:bg-primary-hover disabled:opacity-50"
              disabled={!title.trim() || isSubmitting || isDeleting}
              type="button"
              onClick={() => void handleSubmit()}
            >
              {isEditing ? "수정하기" : "등록하기"}
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default TaskCreateModal;
