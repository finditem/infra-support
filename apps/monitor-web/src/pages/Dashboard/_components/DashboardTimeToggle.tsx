import { cn } from "@/utils";
import type { DashboardTimeRangeProps } from "../_types";

const TIME_TOGGLE_BUTTON_STYLE =
  "typo-body2-semibold relative z-10 min-w-[56px] rounded-full px-3 py-1.5 transition-colors";

const SELECTED_TIME_TOGGLE_BUTTON_STYLE = "text-white";

const UNSELECTED_TIME_TOGGLE_BUTTON_STYLE = "text-fg-neutural-inversed-default";

const DashboardTimeToggle = ({ range, onRangeChange }: DashboardTimeRangeProps) => {
  return (
    <div
      aria-label="조회 기간"
      role="group"
      className="rounded-full bg-bg-layout-1depth p-1 shadow-[inset_0_4px_12px_-4px_rgba(0,0,0,0.12)]"
    >
      <div className="relative grid grid-cols-2">
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 w-1/2 rounded-full bg-fill-primary-strong-default shadow-[1px_2px_8.2px_0_rgba(16,102,67,0.33)] transition-transform",
            range === "7d" && "translate-x-full"
          )}
        />

        <button
          aria-pressed={range === "24h"}
          className={cn(
            TIME_TOGGLE_BUTTON_STYLE,
            range === "24h"
              ? SELECTED_TIME_TOGGLE_BUTTON_STYLE
              : UNSELECTED_TIME_TOGGLE_BUTTON_STYLE
          )}
          type="button"
          onClick={() => onRangeChange("24h")}
        >
          24시간
        </button>

        <button
          aria-pressed={range === "7d"}
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
    </div>
  );
};

export default DashboardTimeToggle;
