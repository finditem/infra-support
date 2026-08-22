"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useOutsideClose, usePopoverPosition } from "@/hooks";
import { cn } from "@/utils";

interface PropertyPopoverProps {
  label?: string;
  trigger: React.ReactNode;
  triggerClassName?: string;
  panelClassName?: string;
  align?: "left" | "center";
  children: (close: () => void) => React.ReactNode;
}

const PropertyPopover = ({
  label,
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
          <span className="w-11 shrink-0 text-[11px] font-medium text-text-muted">{label}</span>
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
