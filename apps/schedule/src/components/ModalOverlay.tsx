"use client";

import type { MouseEvent, ReactNode } from "react";
import { useBodyScrollLock, useEscapeKey } from "@/hooks";
import { cn } from "@/utils";

interface ModalOverlayProps {
  /** 딤 레이어에 덧붙일 클래스. z-index나 안쪽 여백처럼 모달마다 달라지는 값만 넘긴다. */
  className?: string;
  children: ReactNode;
  /** ESC와 딤 레이어 클릭 모두 이 콜백으로 닫는다. */
  onClose: () => void;
  /** 이 레이어 위에 다른 ModalOverlay(예: 라이트박스)가 떠 있는 동안 true로 넘긴다.
   * 두 ModalOverlay가 각자 document에 독립적으로 ESC 리스너를 붙이므로, 끄지 않으면
   * 위 레이어를 닫으려던 ESC가 이 레이어까지 함께 닫아버린다. */
  disableEscape?: boolean;
}

/**
 * 모달을 감싸는 딤 레이어. 떠 있는 동안 뒤 화면 스크롤을 막고 ESC와 바깥 클릭으로 닫는다.
 * 모달 안에서 Portal로 body에 띄우는 팝오버는 DOM 상 이 레이어 밖에 있지만 React 이벤트는
 * 여기까지 올라오므로, 이벤트가 시작된 요소가 레이어 자신일 때만 바깥 클릭으로 판정한다.
 * click이 아니라 mousedown을 보는 이유는 모달 안에서 시작한 드래그가 레이어 위에서 끝났을 때
 * 모달이 닫히지 않게 하기 위해서다.
 */
export const ModalOverlay = ({
  className,
  children,
  onClose,
  disableEscape = false,
}: ModalOverlayProps) => {
  useEscapeKey(onClose, !disableEscape);
  useBodyScrollLock();

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      className={cn("fixed inset-0 flex items-center justify-center bg-black/40", className)}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
};
