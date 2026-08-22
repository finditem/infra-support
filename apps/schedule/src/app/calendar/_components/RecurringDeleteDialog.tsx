"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ModalOverlay } from "@/components/ModalOverlay";
import type { AvailabilityRow } from "@/types/tables";
import { formatTimeRange } from "../_lib/time";

interface RecurringDeleteDialogProps {
  block: AvailabilityRow;
  /** 블록 주인의 이름. 프로필을 찾지 못하면 이름 없이 시간만 보여준다. */
  profileName: string | null;
  onCancel: () => void;
  onDeleteFollowing: () => void;
  onDeleteOne: () => void;
}

/**
 * 반복으로 등록된 가능 시간을 지울 때 범위를 고르는 확인 창.
 * "이후 반복 전체"는 이 블록을 포함해 같은 묶음의 뒤쪽 날짜까지 지운다. 지나간 날짜는 건드리지 않는다.
 */
const RecurringDeleteDialog = ({
  block,
  profileName,
  onCancel,
  onDeleteFollowing,
  onDeleteOne,
}: RecurringDeleteDialogProps) => (
  <ModalOverlay className="z-[100]" onClose={onCancel}>
    <div className="w-[280px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface-elevated p-5 shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)]">
      <p className="mb-1 text-sm font-semibold text-text-default">반복 일정 삭제</p>
      <p className="mb-4 text-xs text-text-muted">
        {profileName && `${profileName} · `}
        {format(new Date(block.available_date), "M월 d일 (EEEEEE)", { locale: ko })}{" "}
        {formatTimeRange(block.start_time, block.end_time)}
      </p>

      <div className="flex flex-col gap-2">
        <button
          className="w-full rounded-lg border border-border bg-surface-elevated py-2 text-xs text-text-default hover:bg-fill-neutural-subtle-hover"
          type="button"
          onClick={onDeleteOne}
        >
          이 일정만 삭제
        </button>
        <button
          className="w-full rounded-lg border border-border bg-surface-elevated py-2 text-xs font-semibold text-fg-state-error hover:bg-fill-neutural-subtle-hover"
          type="button"
          onClick={onDeleteFollowing}
        >
          이후 반복 전체 삭제
        </button>
        <button
          className="w-full py-1 text-xs text-text-muted hover:text-text-default"
          type="button"
          onClick={onCancel}
        >
          취소
        </button>
      </div>
    </div>
  </ModalOverlay>
);

export default RecurringDeleteDialog;
