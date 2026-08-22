"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils";

const SETTINGS_TABS = [
  { href: "/settings", label: "스프린트" },
  { href: "/settings/teams", label: "팀 관리" },
];

/**
 * 설정 하위 페이지 사이를 오가는 탭. NavBar의 "설정"은 접두어 판정이라
 * 어느 탭에 있든 활성으로 남고, 여기서는 정확히 일치하는 탭만 활성으로 본다.
 */
const SettingsTabs = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 border-b border-border">
      {SETTINGS_TABS.map((tab) => (
        <Link
          key={tab.href}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm",
            pathname === tab.href
              ? "border-primary font-semibold text-text-default"
              : "border-transparent text-text-muted hover:text-text-default"
          )}
          href={tab.href}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
};

export default SettingsTabs;
