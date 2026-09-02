"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { format } from "date-fns";
import { CornerDownLeft } from "lucide-react";
import { createTask, deleteTask, updateTask } from "../../_lib/actions";
import { buildBodyWithImages, extractBodyImages, stripBodyImages } from "../../_lib/bodyImages";
import {
  deleteStorageImages,
  extractStoragePathFromUrl,
  getStoragePathsFromBody,
  resizeImageFile,
  uploadImageFile,
  validateImageFile,
} from "../../_lib/imageUpload";
import { getDefaultDueDate, getMonday, getWeekLabel } from "../../_lib/kanbanUtils";
import type { ProfileWithColor } from "../../_types/kanban";
import { ModalOverlay } from "@/components/ModalOverlay";
import { createClient } from "@/lib/supabase/client";
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

/** existing: 이미 저장돼 Storage에 실제로 존재하는 이미지. pending: 이번 세션에 새로
 * 선택했지만 아직 업로드하지 않은 이미지(저장 시점에만 업로드된다). */
type ImageMarker =
  | { id: string; kind: "existing"; alt: string; url: string }
  | { id: string; kind: "pending"; alt: string; file: File; previewUrl: string };

interface TaskCreateModalProps {
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
  // 본문은 프로즈 텍스트(bodyText)와 이미지 목록(imageMarkers)을 따로 들고 있다가 저장 시점에만
  // buildBodyWithImages로 합친다 — 편집 화면에 이미지 마크다운 텍스트가 그대로 노출되지 않도록.
  const [bodyText, setBodyText] = useState(() => (task?.body ? stripBodyImages(task.body) : ""));
  const [imageMarkers, setImageMarkers] = useState<ImageMarker[]>(() =>
    task?.body
      ? extractBodyImages(task.body).map((image) => ({
          id: crypto.randomUUID(),
          kind: "existing" as const,
          ...image,
        }))
      : []
  );
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
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imageMarkersRef = useRef(imageMarkers);
  imageMarkersRef.current = imageMarkers;

  // 저장하지 않고 모달이 닫히는 경우(unmount) 아직 업로드되지 않은 미리보기 blob URL을 해제한다.
  useEffect(() => {
    return () => {
      imageMarkersRef.current.forEach((image) => {
        if (image.kind === "pending") URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, []);

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

  const handleImageFileSelected = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      window.alert(validationError);
      return;
    }

    setIsProcessingImage(true);
    const resizedFile = await resizeImageFile(file);
    setIsProcessingImage(false);

    setImageMarkers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        kind: "pending",
        alt: file.name,
        file: resizedFile,
        previewUrl: URL.createObjectURL(resizedFile),
      },
    ]);
  };

  const removeImageMarker = (id: string) =>
    setImageMarkers((prev) => {
      const removed = prev.find((image) => image.id === id);
      if (removed?.kind === "pending") URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((image) => image.id !== id);
    });

  const handleTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      bodyRef.current?.focus();
    }
  };

  const handleSubmit = async () => {
    // 리사이즈 처리 중에 저장하면 방금 고른 이미지가 아직 imageMarkers에 반영되지 않은 채
    // body가 조립될 수 있다.
    if (!title.trim() || isSubmitting || isProcessingImage) return;

    setIsSubmitting(true);

    const pendingImages = imageMarkers.filter(
      (image): image is Extract<ImageMarker, { kind: "pending" }> => image.kind === "pending"
    );

    const uploadResults = await Promise.all(
      pendingImages.map((image) => uploadImageFile(image.file))
    );

    const uploadedPaths = uploadResults
      .map((result) => (result ? extractStoragePathFromUrl(result.url) : null))
      .filter((path): path is string => path !== null);

    if (uploadResults.some((result) => result === null)) {
      await deleteStorageImages(createClient(), uploadedPaths);
      setIsSubmitting(false);
      window.alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    const uploadedByMarkerId = new Map(
      pendingImages.map((image, index) => [image.id, uploadResults[index]!])
    );

    const finalImages = imageMarkers.map((image) =>
      image.kind === "existing"
        ? { alt: image.alt, url: image.url }
        : { alt: image.alt, url: uploadedByMarkerId.get(image.id)!.url }
    );

    const composedBody = buildBodyWithImages(bodyText, finalImages);

    const saved = task
      ? await updateTask({
          id: task.id,
          title: title.trim(),
          body: composedBody,
          statusId,
          assigneeId,
          reporterId,
          priority,
          dueDate,
        })
      : await createTask({
          title: title.trim(),
          body: composedBody,
          statusId,
          assigneeId,
          reporterId,
          priority,
          dueDate,
          createdBy: currentProfileId,
          parentId,
        });

    if (!saved) {
      await deleteStorageImages(createClient(), uploadedPaths);
      setIsSubmitting(false);
      return;
    }

    if (isEditing && task) {
      const finalPaths = new Set(
        finalImages
          .map((image) => extractStoragePathFromUrl(image.url))
          .filter((path): path is string => path !== null)
      );
      const removedPaths = getStoragePathsFromBody(task.body).filter(
        (path) => !finalPaths.has(path)
      );
      void deleteStorageImages(createClient(), removedPaths);
    }

    const savedRows: TasksRow[] = [saved];
    const failedTitles: string[] = [];

    if (canAddSubtasks) {
      for (const draft of subtaskDrafts) {
        if (!draft.title.trim()) continue;

        const savedSubtask = await createTask({
          title: draft.title.trim(),
          body: draft.body.trim() || null,
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
              value={bodyText}
              onChange={(event) => setBodyText(event.target.value)}
            />

            <input
              ref={imageInputRef}
              className="hidden"
              accept="image/*"
              type="file"
              onChange={(event) => {
                void handleImageFileSelected(event.target.files);
                event.target.value = "";
              }}
            />
            <button
              className="rounded-md px-1.5 py-1 text-[11px] font-medium text-text-muted hover:bg-fill-neutural-subtle-hover disabled:opacity-50"
              disabled={isProcessingImage}
              type="button"
              onClick={() => imageInputRef.current?.click()}
            >
              {isProcessingImage ? "처리 중..." : "+ 이미지"}
            </button>

            {imageMarkers.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {imageMarkers.map((image) => (
                  <div
                    key={image.id}
                    className="group relative aspect-square overflow-hidden rounded-[10px] border border-border"
                  >
                    <img
                      alt={image.alt}
                      className="size-full object-cover"
                      src={image.kind === "existing" ? image.url : image.previewUrl}
                    />
                    <button
                      aria-label="이미지 삭제"
                      className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-md border border-border bg-surface-elevated text-[11px] text-text-muted opacity-0 hover:bg-fill-neutural-subtle-hover group-hover:opacity-100"
                      type="button"
                      onClick={() => removeImageMarker(image.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              disabled={!title.trim() || isSubmitting || isDeleting || isProcessingImage}
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
