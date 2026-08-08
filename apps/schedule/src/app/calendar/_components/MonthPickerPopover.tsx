"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils";
import PropertyPopover from "../../_components/TaskCreateModal/PropertyPopover";

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

interface MonthPickerPopoverProps {
  monthLabel: string;
  monthStart: Date;
}

const MonthPickerPopover = ({ monthLabel, monthStart }: MonthPickerPopoverProps) => {
  const router = useRouter();
  const selectedYear = monthStart.getFullYear();
  const selectedMonth = monthStart.getMonth() + 1;
  const [yearCursor, setYearCursor] = useState(selectedYear);

  return (
    <PropertyPopover
      align="center"
      panelClassName="w-52"
      trigger={<span className="text-sm font-medium text-text-default">{monthLabel}</span>}
      triggerClassName="w-auto min-w-[110px] justify-center text-center"
    >
      {(close) => (
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <button
              aria-label="이전 연도"
              className="rounded px-1.5 py-0.5 text-xs text-text-muted hover:bg-fill-neutural-subtle-hover"
              type="button"
              onClick={() => setYearCursor((prev) => prev - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold text-text-default">{yearCursor}년</span>
            <button
              aria-label="다음 연도"
              className="rounded px-1.5 py-0.5 text-xs text-text-muted hover:bg-fill-neutural-subtle-hover"
              type="button"
              onClick={() => setYearCursor((prev) => prev + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((month) => {
              const isSelected = yearCursor === selectedYear && month === selectedMonth;

              return (
                <button
                  key={month}
                  className={cn(
                    "rounded-md py-1.5 text-xs",
                    isSelected
                      ? "bg-primary font-semibold text-text-inverse"
                      : "text-text-default hover:bg-fill-neutural-subtle-hover"
                  )}
                  type="button"
                  onClick={() => {
                    router.push(
                      `/calendar?month=${format(new Date(yearCursor, month - 1, 1), "yyyy-MM-dd")}`
                    );
                    close();
                  }}
                >
                  {month}월
                </button>
              );
            })}
          </div>
        </div>
      )}
    </PropertyPopover>
  );
};

export default MonthPickerPopover;
