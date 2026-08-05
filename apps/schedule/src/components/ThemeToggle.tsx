"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="fixed bottom-6 right-6 z-[300] flex size-12 items-center justify-center rounded-full border border-border bg-surface-elevated text-text-default shadow-[0_8px_24px_rgba(0,0,0,0.16)] hover:bg-fill-neutural-subtle-hover dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};
