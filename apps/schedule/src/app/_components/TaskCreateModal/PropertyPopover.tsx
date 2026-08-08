"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils";

const GAP = 4;

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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 모달 컨테이너의 overflow-hidden에 잘리지 않도록 패널을 body에 Portal로 띄우고,
  // 트리거 기준 좌표를 직접 계산한다. 아래쪽 공간이 부족하면 위쪽으로 뒤집는다.
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const panelHeight = panelRef.current?.offsetHeight ?? 0;
    const panelWidth = panelRef.current?.offsetWidth ?? 0;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const showAbove = panelHeight > 0 && spaceBelow < panelHeight + GAP;

    setPosition({
      top: showAbove ? triggerRect.top - panelHeight - GAP : triggerRect.bottom + GAP,
      left:
        align === "center"
          ? triggerRect.left + triggerRect.width / 2 - panelWidth / 2
          : triggerRect.left,
    });
  }, [isOpen, align]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
