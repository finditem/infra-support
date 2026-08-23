"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useOutsideClose, usePopoverPosition } from "@/hooks";
import { cn } from "@/utils";

interface PropertyPopoverProps {
  label?: string;
  labelClassName?: string;
  trigger: React.ReactNode;
  triggerClassName?: string;
  panelClassName?: string;
  align?: "left" | "center";
  children: (close: () => void) => React.ReactNode;
}

const PropertyPopover = ({
  label,
  labelClassName,
  trigger,
  triggerClassName,
  panelClassName,
  align = "left",
  children,
}: PropertyPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 모달 컨테이너의 overflow-hidden에 잘리지 않도록 패널을 body에 Portal로 띄우고,
  // 트리거 기준 좌표를 직접 계산한다.
  const position = usePopoverPosition({ isOpen, anchorRef: triggerRef, panelRef, align });
  useOutsideClose(isOpen, [triggerRef, panelRef], () => setIsOpen(false));

  // ESC는 모달보다 이 팝오버가 먼저 받아야 한다. 모달은 document에서 듣고 있으므로
  // 그보다 앞서는 window 캡처 단계에서 가로채고, 처리했다는 사실을 preventDefault로 남긴다.
  // MentionPicker도 같은 방식으로 모달과 층을 나눈다.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      event.preventDefault();
      setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition hover:bg-fill-neutural-subtle-hover",
          triggerClassName
        )}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {label && (
          <span
            className={cn("w-11 shrink-0 text-[11px] font-medium text-text-muted", labelClassName)}
          >
            {label}
          </span>
        )}
        {trigger}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            className={cn(
              "fixed z-[300] w-60 rounded-xl border border-border bg-surface-elevated p-2 shadow-[0_12px_36px_rgba(0,0,0,0.12)]",
              panelClassName
            )}
            style={{ top: position.top, left: position.left }}
          >
            {children(() => setIsOpen(false))}
          </div>,
          document.body
        )}
    </>
  );
};

export default PropertyPopover;
