"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { cn } from "@/utils";

/** 원이 화면 끝까지 퍼지는 데 걸리는 시간. */
const THEME_REVEAL_DURATION = 500;

/** globals.css의 .theme-transition 전환 시간과 같은 값이어야 한다. */
const THEME_FADE_DURATION = 240;

/** startViewTransition은 아직 lib.dom에 없는 브라우저 타입이라 여기서 좁혀 쓴다. */
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
};

/** 클릭한 지점에서 화면의 가장 먼 모서리까지의 거리. 원이 이만큼 커지면 화면을 다 덮는다. */
const getCoveringRadius = (originX: number, originY: number) =>
  Math.hypot(
    Math.max(originX, window.innerWidth - originX),
    Math.max(originY, window.innerHeight - originY)
  );

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const fadeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  /**
   * View Transitions를 못 쓰는 브라우저에서 쓰는 대체 동작. 색상 전환은 테마를 바꾸는
   * 동안에만 켜고, 끝나면 클래스를 떼어내야 hover 같은 다른 전환이 원래 속도로 돌아온다.
   */
  const fadeColors = () => {
    const root = document.documentElement;
    root.classList.add("theme-transition");

    if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = window.setTimeout(() => {
      root.classList.remove("theme-transition");
      fadeTimerRef.current = null;
    }, THEME_FADE_DURATION);
  };

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    const nextTheme = isDark ? "light" : "dark";
    const doc = document as ViewTransitionDocument;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!doc.startViewTransition || prefersReducedMotion) {
      fadeColors();
      setTheme(nextTheme);
      return;
    }

    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const originX = left + width / 2;
    const originY = top + height / 2;
    const radius = getCoveringRadius(originX, originY);

    // 스냅샷을 찍는 시점에 새 테마가 이미 적용되어 있어야 해서 flushSync로 동기 적용한다.
    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(nextTheme));
    });

    void transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${originX}px ${originY}px)`,
            `circle(${radius}px at ${originX}px ${originY}px)`,
          ],
        },
        {
          duration: THEME_REVEAL_DURATION,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <button
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="theme-toggle fixed bottom-6 right-6 z-[300] flex size-12 items-center justify-center rounded-full border border-border bg-surface-elevated text-text-default shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition hover:scale-105 hover:bg-fill-neutural-subtle-hover active:scale-95 dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
      type="button"
      onClick={handleToggle}
    >
      {/* 두 아이콘을 겹쳐 두고 회전하며 교차 페이드시킨다. 조건부 렌더링이면 그냥 바뀐다. */}
      <span className="relative flex size-5 items-center justify-center">
        <Sun
          className={cn(
            "absolute transition-all duration-500 ease-out",
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
          )}
          size={20}
        />
        <Moon
          className={cn(
            "absolute transition-all duration-500 ease-out",
            isDark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
          size={20}
        />
      </span>
    </button>
  );
};
