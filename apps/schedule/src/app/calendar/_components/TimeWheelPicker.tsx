"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/utils";

const ITEM_HEIGHT = 32;
const VISIBLE_COUNT = 3;
const PADDING = (ITEM_HEIGHT * (VISIBLE_COUNT - 1)) / 2;
const SCROLL_END_DELAY = 120;

const PERIODS = ["오전", "오후"];
const HOURS_12 = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
const MINUTES = ["00", "10", "20", "30", "40", "50"];

interface WheelColumnProps {
  label: string;
  values: string[];
  value: string;
  onChange: (value: string) => void;
}

const WheelColumn = ({ label, values, value, onChange }: WheelColumnProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const index = values.indexOf(value);
    if (index === -1 || !containerRef.current) return;
    containerRef.current.scrollTo({ top: index * ITEM_HEIGHT });
  }, []);

  const commitIndex = (index: number, behavior: ScrollBehavior = "smooth") => {
    const clamped = Math.min(Math.max(index, 0), values.length - 1);
    containerRef.current?.scrollTo({ top: clamped * ITEM_HEIGHT, behavior });
    if (values[clamped] !== value) onChange(values[clamped]);
  };

  const handleScroll = () => {
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);

    scrollEndTimer.current = setTimeout(() => {
      if (!containerRef.current) return;

      const index = Math.round(containerRef.current.scrollTop / ITEM_HEIGHT);
      commitIndex(index, "auto");
    }, SCROLL_END_DELAY);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = values.indexOf(value);

    if (event.key === "ArrowUp") {
      event.preventDefault();
      commitIndex(currentIndex - 1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      commitIndex(currentIndex + 1);
    }
  };

  return (
    <div
      ref={containerRef}
      aria-label={label}
      role="listbox"
      tabIndex={0}
      className="h-[96px] w-14 snap-y snap-mandatory overflow-y-scroll rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-scrollbar]:hidden"
      style={{ paddingTop: PADDING, paddingBottom: PADDING, scrollbarWidth: "none" }}
      onKeyDown={handleKeyDown}
      onScroll={handleScroll}
    >
      {values.map((item, index) => (
        <div
          key={item}
          aria-selected={item === value}
          role="option"
          className={cn(
            "flex h-8 snap-center items-center justify-center text-sm",
            item === value ? "font-bold text-text-default" : "text-text-muted/50"
          )}
          onClick={() => commitIndex(index)}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

interface TimeWheelPickerProps {
  period: string;
  hour: string;
  minute: string;
  onChangePeriod: (value: string) => void;
  onChangeHour: (value: string) => void;
  onChangeMinute: (value: string) => void;
}

const TimeWheelPicker = ({
  period,
  hour,
  minute,
  onChangePeriod,
  onChangeHour,
  onChangeMinute,
}: TimeWheelPickerProps) => {
  return (
    <div className="relative flex justify-center gap-2 rounded-xl bg-surface py-1">
      <div className="pointer-events-none absolute inset-x-2 top-1/2 h-8 -translate-y-1/2 border-y border-border" />
      <WheelColumn label="오전/오후" value={period} values={PERIODS} onChange={onChangePeriod} />
      <WheelColumn label="시" value={hour} values={HOURS_12} onChange={onChangeHour} />
      <WheelColumn label="분" value={minute} values={MINUTES} onChange={onChangeMinute} />
    </div>
  );
};

export default TimeWheelPicker;
