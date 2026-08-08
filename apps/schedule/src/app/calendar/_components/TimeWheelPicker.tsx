"use client";

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
  values: string[];
  value: string;
  onChange: (value: string) => void;
}

const WheelColumn = ({ values, value, onChange }: WheelColumnProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const index = values.indexOf(value);
    if (index === -1 || !containerRef.current) return;
    containerRef.current.scrollTo({ top: index * ITEM_HEIGHT });
  }, []);

  const handleScroll = () => {
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);

    scrollEndTimer.current = setTimeout(() => {
      if (!containerRef.current) return;

      const index = Math.min(
        Math.max(Math.round(containerRef.current.scrollTop / ITEM_HEIGHT), 0),
        values.length - 1
      );
      const next = values[index];
      if (next !== value) onChange(next);
    }, SCROLL_END_DELAY);
  };

  return (
    <div
      ref={containerRef}
      className="h-[96px] w-14 snap-y snap-mandatory overflow-y-scroll [&::-webkit-scrollbar]:hidden"
      style={{ paddingTop: PADDING, paddingBottom: PADDING, scrollbarWidth: "none" }}
      onScroll={handleScroll}
    >
      {values.map((item) => (
        <div
          key={item}
          className={cn(
            "flex h-8 snap-center items-center justify-center text-sm",
            item === value ? "font-bold text-text-default" : "text-text-muted/50"
          )}
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
      <WheelColumn value={period} values={PERIODS} onChange={onChangePeriod} />
      <WheelColumn value={hour} values={HOURS_12} onChange={onChangeHour} />
      <WheelColumn value={minute} values={MINUTES} onChange={onChangeMinute} />
    </div>
  );
};

export default TimeWheelPicker;
