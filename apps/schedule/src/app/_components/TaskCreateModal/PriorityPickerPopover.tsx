"use client";

import type { TasksRow } from "@/types/tables";
import { PRIORITY_META, PRIORITY_ORDER } from "../../_lib/kanbanUtils";
import PropertyPopover from "./PropertyPopover";

const BAR_HEIGHTS = [6, 9, 12];

interface PriorityPickerPopoverProps {
  label: string;
  value: TasksRow["priority"];
  onChange: (priority: TasksRow["priority"]) => void;
}

const PriorityPickerPopover = ({ label, value, onChange }: PriorityPickerPopoverProps) => {
  const activeIndex = PRIORITY_ORDER.indexOf(value);

  return (
    <PropertyPopover
      label={label}
      trigger={
        <span className="flex items-center gap-1 text-xs text-text-default">
          <span className="flex items-end gap-[2px]">
            {BAR_HEIGHTS.map((height, index) => (
              <span
                key={height}
                className="w-[3px] rounded-[1px]"
                style={{
                  height,
                  backgroundColor: index <= activeIndex ? PRIORITY_META[value].color : "#E5E7EB",
                }}
              />
            ))}
          </span>
          {PRIORITY_META[value].label}
        </span>
      }
    >
      {(close) => (
        <div className="flex flex-col gap-1">
          {PRIORITY_ORDER.map((priority) => (
            <button
              key={priority}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-text-default hover:bg-fill-neutural-subtle-hover"
              type="button"
              onClick={() => {
                onChange(priority);
                close();
              }}
            >
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ backgroundColor: PRIORITY_META[priority].color }}
              />
              {PRIORITY_META[priority].label}
              {priority === value && <span className="ml-auto text-primary">✓</span>}
            </button>
          ))}
        </div>
      )}
    </PropertyPopover>
  );
};

export default PriorityPickerPopover;
