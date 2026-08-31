"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/utils";
import type { TimeValue } from "../_lib/time";
import { to24Hour, toPeriodHour } from "../_lib/time";

const ITEM_HEIGHT = 32;
const VISIBLE_COUNT = 3;
const PADDING = (ITEM_HEIGHT * (VISIBLE_COUNT - 1)) / 2;
const SCROLL_END_DELAY = 120;

const PERIODS = ["오전", "오후"];
const HOURS_12 = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
const HOURS_24 = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
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
  const hasMounted = useRef(false);

  // 12/24시간 전환처럼 값이나 후보 목록이 바깥에서 바뀌는 경우가 있어 마운트 시점뿐 아니라 매번 위치를 맞춘다.
  // 이미 그 위치면 스크롤하지 않으므로 사용자가 굴리는 중에 끼어들지 않는다.
  useEffect(() => {
    const index = values.indexOf(value);
    const container = containerRef.current;
    if (index === -1 || !container) return;

    const top = index * ITEM_HEIGHT;
    if (Math.abs(container.scrollTop - top) > 1) {
      container.scrollTo({ top, behavior: hasMounted.current ? "smooth" : "auto" });
    }

    hasMounted.current = true;
  }, [value, values]);

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
  /** 표시 형식과 무관하게 항상 24시간제 값이다. */
  value: TimeValue;
  /** true면 오전/오후 열이 사라지고 시 열이 00~23으로 바뀐다. */
  is24Hour: boolean;
  onChange: (value: TimeValue) => void;
}

const TimeWheelPicker = ({ value, is24Hour, onChange }: TimeWheelPickerProps) => {
  const { period, hour12 } = toPeriodHour(value.hour);

  return (
    <div className="relative flex justify-center gap-2 rounded-xl bg-surface py-1">
      <div className="pointer-events-none absolute inset-x-2 top-1/2 h-8 -translate-y-1/2 border-y border-border" />

      {is24Hour ? (
        <WheelColumn
          key="hour"
          label="시"
          value={value.hour}
          values={HOURS_24}
          onChange={(hour) => onChange({ ...value, hour })}
        />
      ) : (
        <>
          <WheelColumn
            key="period"
            label="오전/오후"
            value={period}
            values={PERIODS}
            onChange={(next) => onChange({ ...value, hour: to24Hour(next, hour12) })}
          />
          <WheelColumn
            key="hour"
            label="시"
            value={hour12}
            values={HOURS_12}
            onChange={(next) => onChange({ ...value, hour: to24Hour(period, next) })}
          />
        </>
      )}

      <WheelColumn
        key="minute"
        label="분"
        value={value.minute}
        values={MINUTES}
        onChange={(minute) => onChange({ ...value, minute })}
      />
    </div>
  );
};

export default TimeWheelPicker;
