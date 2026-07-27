"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { format } from "date-fns";
import { createTask } from "../../_lib/actions";
import { getDefaultDueDate, getMonday, getWeekLabel } from "../../_lib/kanbanUtils";
import type { ProfileWithColor } from "../../_types/kanban";
import type { TaskStatusesRow, TasksRow } from "@/types/tables";
import DatePickerPopover from "./DatePickerPopover";
import PriorityPickerPopover from "./PriorityPickerPopover";
import ProfilePickerPopover from "./ProfilePickerPopover";
import StatusPickerPopover from "./StatusPickerPopover";

interface TaskCreateModalProps {
  weekId: string;
  statuses: TaskStatusesRow[];
  profiles: ProfileWithColor[];
  currentProfileId: string | null;
  initialStatusId: string;
  onClose: () => void;
  onCreated: (task: TasksRow) => void;
}

const TaskCreateModal = ({
  weekId,
  statuses,
  profiles,
  currentProfileId,
  initialStatusId,
  onClose,
  onCreated,
}: TaskCreateModalProps) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [assigneeId, setAssigneeId] = useState<string | null>(currentProfileId);
  const [reporterId, setReporterId] = useState<string | null>(currentProfileId);
  const [priority, setPriority] = useState<TasksRow["priority"]>("medium");
  const [dueDate, setDueDate] = useState(() => format(getDefaultDueDate(), "yyyy-MM-dd"));
  const [statusId, setStatusId] = useState(initialStatusId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const weekLabel = getWeekLabel(getMonday(new Date(dueDate)));

  const handleTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      bodyRef.current?.focus();
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const created = await createTask({
      title: title.trim(),
      body: body.trim() || null,
      weekId,
      statusId,
      assigneeId,
      reporterId,
      priority,
      dueDate,
      createdBy: currentProfileId,
    });

    setIsSubmitting(false);

    if (created) onCreated(created);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      onClose();
    } else if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-5"
      onKeyDown={handleKeyDown}
    >
      <div className="w-[480px] overflow-hidden rounded-2xl bg-surface-elevated shadow-[0_24px_48px_rgba(0,0,0,0.16)]">
        <div className="flex items-center justify-between border-b border-border px-[18px] py-3">
          <span className="text-xs text-text-muted">
            팀 일정 <span className="mx-[3px] text-border">/</span>
            <strong className="font-medium text-text-default"> 새 작업</strong>
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

        <div className="px-5 pt-[18px]">
          <input
            className="w-full border-none text-[17px] font-semibold text-text-default outline-none placeholder:text-text-muted/50"
            autoFocus
            placeholder="작업 제목을 입력하세요"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={handleTitleKeyDown}
          />
        </div>

        <div className="grid grid-cols-2 gap-[2px] px-5 py-3">
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
            className="min-h-[72px] w-full resize-none border-none text-[13px] leading-[1.75] text-text-muted outline-none placeholder:text-text-muted/50"
            placeholder="설명을 추가하세요..."
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </div>

        <div className="flex items-center justify-between border-t border-border px-[18px] py-3.5">
          <span className="flex items-center gap-1 text-[11px] text-text-muted/60">
            <kbd className="rounded border border-border bg-fill-neutural-subtle-default px-[5px] py-px font-mono text-[10px]">
              ⌘
            </kbd>
            <kbd className="rounded border border-border bg-fill-neutural-subtle-default px-[5px] py-px font-mono text-[10px]">
              ⏎
            </kbd>
            으로 등록
          </span>

          <div className="flex gap-1.5">
            <button
              className="rounded-[7px] border border-border bg-surface-elevated px-3.5 py-1.5 text-xs font-medium text-text-muted hover:bg-fill-neutural-subtle-hover"
              type="button"
              onClick={onClose}
            >
              취소
            </button>
            <button
              className="flex items-center gap-1 rounded-[7px] bg-primary px-4 py-1.5 text-xs font-semibold text-text-inverse hover:bg-primary-hover disabled:opacity-50"
              disabled={!title.trim() || isSubmitting}
              type="button"
              onClick={() => void handleSubmit()}
            >
              등록하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCreateModal;
