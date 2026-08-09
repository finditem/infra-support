"use client";

import { useTheme } from "next-themes";
import { getStatusColor } from "@/app/_lib/kanbanUtils";
import type { TaskStatusesRow } from "@/types/tables";
import PropertyPopover from "./PropertyPopover";

interface StatusPickerPopoverProps {
  label: string;
  statuses: TaskStatusesRow[];
  selectedId: string;
  onSelect: (statusId: string) => void;
}

const StatusPickerPopover = ({
  label,
  statuses,
  selectedId,
  onSelect,
}: StatusPickerPopoverProps) => {
  const selected = statuses.find((status) => status.id === selectedId) ?? null;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <PropertyPopover
      label={label}
      trigger={
        <span className="flex items-center gap-1.5 text-xs text-text-default">
          <span
            aria-hidden
            className="size-[7px] rounded-full"
            style={{
              backgroundColor: selected
                ? getStatusColor(selected, isDark)
                : isDark
                  ? "#6B7280"
                  : "#9CA3AF",
            }}
          />
          {selected?.name ?? "상태 선택"}
        </span>
      }
    >
      {(close) => (
        <div className="flex flex-col gap-1">
          {statuses.map((status) => (
            <button
              key={status.id}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-text-default hover:bg-fill-neutural-subtle-hover"
              type="button"
              onClick={() => {
                onSelect(status.id);
                close();
              }}
            >
              <span
                aria-hidden
                className="size-[7px] rounded-full"
                style={{ backgroundColor: getStatusColor(status, isDark) }}
              />
              {status.name}
              {status.id === selectedId && <span className="ml-auto text-primary">✓</span>}
            </button>
          ))}
        </div>
      )}
    </PropertyPopover>
  );
};

export default StatusPickerPopover;
