"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils";
import { SignOutButton } from "./SignOutButton";

const NAV_ITEMS = [
  { href: "/", label: "일정" },
  { href: "/calendar", label: "캘린더" },
  { href: "/settings", label: "설정" },
];

/**
 * 설정처럼 하위 경로를 가진 메뉴도 활성으로 보이도록 접두어로 판정한다.
 * "/"는 모든 경로의 접두어라서 정확히 일치할 때만 활성으로 본다.
 */
const isNavItemActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export const NavBar = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="flex flex-wrap items-center justify-between gap-y-2 border-b border-border bg-surface-elevated px-4 py-3 sm:px-8"
    >
      <div className="flex flex-wrap items-center gap-3 sm:gap-6">
        <Link className="flex items-center gap-2 text-sm font-bold text-text-default" href="/">
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-black text-text-inverse"
          >
            찾
          </span>
          찾길 업무관리
        </Link>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              className={cn(
                "border-b-2 px-3 py-[6px] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isNavItemActive(pathname, item.href)
                  ? "border-primary font-semibold text-text-default"
                  : "border-transparent text-text-muted hover:text-text-default"
              )}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <SignOutButton />
    </nav>
  );
};
