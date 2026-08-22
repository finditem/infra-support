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
    <nav className="flex flex-wrap items-center justify-between gap-y-2 border-b border-border bg-surface-elevated px-4 py-3 sm:px-8">
      <div className="flex flex-wrap items-center gap-3 sm:gap-6">
        <span className="text-sm font-bold text-text-default">찾길 일정관리</span>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              className={cn(
                "rounded-md px-3 py-[6px] text-sm",
                isNavItemActive(pathname, item.href)
                  ? "font-semibold text-text-default"
                  : "text-text-muted hover:text-text-default"
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
