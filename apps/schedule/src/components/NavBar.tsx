"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "./SignOutButton";

const NAV_ITEMS = [
  { href: "/", label: "일정" },
  { href: "/calendar", label: "캘린더" },
];

export const NavBar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between border-b border-border bg-surface-elevated px-8 py-3">
      <div className="flex items-center gap-6">
        <span className="text-sm font-bold text-text-default">찾아줘! 일정관리</span>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              className={`rounded-md px-3 py-[6px] text-sm ${
                pathname === item.href
                  ? "font-semibold text-text-default"
                  : "text-text-muted hover:text-text-default"
              }`}
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
