import { cn } from "@/utils";
import type { DashboardTimeRangeProps } from "../_types";

const TIME_TOGGLE_BUTTON_STYLE =
  "min-w-[68px] rounded-full px-[6px] py-[10px] text-[16px] font-bold leading-6";

const SELECTED_TIME_TOGGLE_BUTTON_STYLE =
  "bg-fill-primary-strong-default text-white shadow-[1px_2px_8.2px_0_rgba(16,102,67,0.33)]";

const UNSELECTED_TIME_TOGGLE_BUTTON_STYLE = "text-fg-neutural-inversed-default";

const DashboardTimeToggle = ({ range, onRangeChange }: DashboardTimeRangeProps) => {
  return (
    <div
      aria-label="조회 기간"
      role="radiogroup"
      className="flex rounded-full bg-bg-layout-1depth p-[6px] shadow-[inset_0_4px_12px_-4px_rgba(0,0,0,0.12)]"
    >
      <button
        aria-checked={range === "24h"}
        role="radio"
        className={cn(
          TIME_TOGGLE_BUTTON_STYLE,
          range === "24h" ? SELECTED_TIME_TOGGLE_BUTTON_STYLE : UNSELECTED_TIME_TOGGLE_BUTTON_STYLE
        )}
        type="button"
        onClick={() => onRangeChange("24h")}
      >
        24시간
      </button>

      <button
        aria-checked={range === "7d"}
        role="radio"
        className={cn(
          TIME_TOGGLE_BUTTON_STYLE,
          range === "7d" ? SELECTED_TIME_TOGGLE_BUTTON_STYLE : UNSELECTED_TIME_TOGGLE_BUTTON_STYLE
        )}
        type="button"
        onClick={() => onRangeChange("7d")}
      >
        7일
      </button>
    </div>
  );
};

export default DashboardTimeToggle;
