"use client";

import { useDraggable } from "@dnd-kit/core";
import { format } from "date-fns";
import { ExternalLink, GripVertical, MessageSquare } from "lucide-react";
import Link from "next/link";
import type { KeyboardEvent, ReactNode, Ref } from "react";
import type { TaskStatusesRow, TasksRow } from "@/types/tables";
import { cn } from "@/utils";
import { isTaskOverdue, PRIORITY_META } from "../_lib/kanbanUtils";
import type { ProfileWithColor } from "../_types/kanban";
import ProfileAvatar from "./ProfileAvatar";

interface KanbanCardContentProps {
  task: TasksRow;
  assignee: ProfileWithColor | null;
  reporter: ProfileWithColor | null;
  subtaskCount: number;
  commentCount: number;
  statuses: TaskStatusesRow[];
}

interface KanbanCardProps extends KanbanCardContentProps {
  /** 생략하면 DragOverlay용 정적 카드로 렌더한다. 클릭과 드래그가 모두 비활성화된다. */
  onSelect?: () => void;
  /** true면 드래그를 막는다. 하위 일정의 상태로 표시 컬럼이 결정되거나 서버 저장이 진행 중인 카드가 해당한다. */
  dragDisabled?: boolean;
  /** 드래그를 막은 이유. 핸들의 title로 보여주며, 저장 중처럼 잠깐 막는 경우에는 넘기지 않는다. */
  dragDisabledTitle?: string;
}

interface KanbanCardViewProps extends KanbanCardContentProps {
  rootRef?: Ref<HTMLDivElement>;
  className?: string;
  handle: ReactNode;
  onSelect?: () => void;
}

const KanbanCardView = ({
  task,
  assignee,
  reporter,
  subtaskCount,
  commentCount,
  statuses,
  rootRef,
  className,
  handle,
  onSelect,
}: KanbanCardViewProps) => {
  const priority = PRIORITY_META[task.priority];
  const overdue = isTaskOverdue(task, statuses);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      ref={rootRef}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      className={cn(
        "flex flex-col gap-2 rounded-[10px] border bg-surface-elevated p-3 text-left transition-shadow",
        onSelect && "cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
        priority.cardBorderClassName,
        className
      )}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {handle}
          <span
            className={cn(
              "w-fit rounded-full border px-2 py-0.5 text-[11px] font-semibold",
              priority.badgeClassName
            )}
          >
            {priority.label}
          </span>
        </div>

        {!task.parent_id && (
          <Link
            className="flex items-center gap-0.5 rounded-md border border-border px-2 py-0.5 text-[11px] font-medium text-text-muted hover:bg-fill-neutural-subtle-hover"
            href={`/task/${task.id}`}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            바로가기
            <ExternalLink aria-hidden className="size-3" />
          </Link>
        )}
      </div>

      <h3 className="text-sm font-semibold text-text-default">{task.title}</h3>

      {task.body && <p className="text-xs text-text-muted">{task.body}</p>}

      <div className="flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-3">
          {assignee && (
            <span className="flex items-center gap-1">
              <ProfileAvatar profile={assignee} />
              {assignee.name}
            </span>
          )}

          {reporter && (
            <span className="flex items-center gap-1">
              <ProfileAvatar profile={reporter} />
              {reporter.name}
            </span>
          )}
        </div>

        {task.due_date && (
          <span className={cn(overdue && "font-bold text-fg-state-error")}>
            {format(new Date(task.due_date), "M/d")}
            {overdue && " 초과"}
          </span>
        )}
      </div>

      {(subtaskCount > 0 || commentCount > 0) && (
        <div className="flex items-center gap-3 border-t border-border pt-2 text-xs text-text-muted">
          {subtaskCount > 0 && <span>하위 일정 {subtaskCount}개</span>}

          {commentCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare aria-hidden className="size-3" />
              {commentCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const HANDLE_CLASS_NAME = "flex size-5 items-center justify-center rounded text-text-muted";

/**
 * 보드 위의 실제 카드. 드래그 리스너는 핸들 버튼에만 붙여 카드 본체의 Enter/Space가
 * 모달 열기로 남도록 한다. 핸들의 클릭과 키 입력은 카드로 전파되지 않게 막는다.
 */
const DraggableKanbanCard = ({
  onSelect,
  dragDisabled = false,
  dragDisabledTitle,
  ...content
}: KanbanCardProps) => {
  const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef } = useDraggable({
    id: content.task.id,
    disabled: dragDisabled,
  });

  return (
    <KanbanCardView
      {...content}
      className={cn(isDragging && "opacity-40")}
      handle={
        <button
          ref={setActivatorNodeRef}
          aria-label="일정 이동"
          className={cn(
            HANDLE_CLASS_NAME,
            dragDisabled
              ? "cursor-default opacity-50"
              : "cursor-grab hover:bg-fill-neutural-subtle-default active:cursor-grabbing"
          )}
          disabled={dragDisabled}
          // dnd-kit이 attributes.aria-describedby에 넣는 id는 전역 카운터 기반이라
          // 서버/클라이언트 렌더링 시점마다 값이 달라져 하이드레이션 경고가 발생한다.
          // 접근성 스크린리더 설명용 id일 뿐 동작에는 영향이 없어 경고만 억제한다.
          suppressHydrationWarning
          title={dragDisabled ? dragDisabledTitle : undefined}
          type="button"
          {...attributes}
          {...listeners}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            event.stopPropagation();
            listeners?.onKeyDown?.(event);
          }}
        >
          <GripVertical aria-hidden className="size-4" />
        </button>
      }
      rootRef={setNodeRef}
      onSelect={onSelect}
    />
  );
};

const KanbanCard = (props: KanbanCardProps) => {
  if (!props.onSelect) {
    return (
      <KanbanCardView
        {...props}
        className="shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
        handle={
          <span aria-hidden className={HANDLE_CLASS_NAME}>
            <GripVertical className="size-4" />
          </span>
        }
      />
    );
  }

  return <DraggableKanbanCard {...props} />;
};

export default KanbanCard;
