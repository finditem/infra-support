"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils";

interface PropertyPopoverProps {
  label: string;
  trigger: React.ReactNode;
  panelClassName?: string;
  children: (close: () => void) => React.ReactNode;
}

const PropertyPopover = ({ label, trigger, panelClassName, children }: PropertyPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition hover:bg-fill-neutural-subtle-hover"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="w-11 shrink-0 text-[11px] font-medium text-text-muted">{label}</span>
        {trigger}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-1 w-60 rounded-xl border border-border bg-surface-elevated p-2 shadow-[0_12px_36px_rgba(0,0,0,0.12)]",
            panelClassName
          )}
        >
          {children(() => setIsOpen(false))}
        </div>
      )}
    </div>
  );
};

export default PropertyPopover;
