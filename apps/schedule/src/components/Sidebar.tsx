"use client";

import { Calendar, LayoutGrid, LogOut, SlidersHorizontal, Workflow } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DEFAULT_PROJECT_KEY, PROJECTS } from "@/app/_lib/projects";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/utils";

const NAV_ITEMS = [
  {
    key: "board",
    label: "칸반보드",
    href: `/project/${DEFAULT_PROJECT_KEY}`,
    Icon: LayoutGrid,
    // 상세(/task)도 보드에서 들어가므로 칸반보드를 활성으로 본다.
    isActive: (pathname: string) => pathname.startsWith("/project") || pathname.startsWith("/task"),
  },
  {
    key: "calendar",
    label: "캘린더",
    href: "/calendar",
    Icon: Calendar,
    isActive: (pathname: string) => pathname.startsWith("/calendar"),
  },
  {
    key: "flow",
    label: "작업 흐름",
    href: "/flow",
    Icon: Workflow,
    isActive: (pathname: string) => pathname.startsWith("/flow"),
  },
  {
    key: "settings",
    label: "스프린트 설정",
    href: "/settings",
    Icon: SlidersHorizontal,
    isActive: (pathname: string) => pathname.startsWith("/settings"),
  },
] as const;

// 접힌 상태에서는 아이콘만 보이고, 마우스를 올리거나 키보드 포커스가 들어오면 라벨까지 펼쳐진다.
const ROW_BASE =
  "relative flex h-9 items-center gap-3 px-[22px] text-text-muted transition-colors hover:bg-fill-neutural-subtle-default hover:text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary";
const LABEL_BASE =
  "whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100";

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      aria-label="주요 메뉴"
      className="group fixed inset-y-0 left-0 z-40 flex w-16 flex-col overflow-hidden border-r border-border bg-surface-elevated py-3 transition-[width] duration-150 ease-out focus-within:w-56 hover:w-56"
    >
      <Link
        aria-label="찾길 업무관리 홈"
        className="mb-2 flex h-9 items-center gap-3 px-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        href={`/project/${DEFAULT_PROJECT_KEY}`}
      >
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-black text-text-inverse"
        >
          찾
        </span>
        <span className={cn(LABEL_BASE, "text-[13px] font-bold text-text-default")}>
          찾길 업무관리
        </span>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname);

          return (
            <div key={item.key}>
              <Link className={cn(ROW_BASE, active && "text-text-default")} href={item.href}>
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-y-1.5 left-0 w-[3px] rounded-r bg-primary"
                  />
                )}
                <item.Icon aria-hidden className="size-[18px] shrink-0" />
                <span className={LABEL_BASE}>{item.label}</span>
              </Link>

              {item.key === "board" && (
                <div className="flex max-h-0 flex-col overflow-hidden transition-[max-height] duration-150 ease-out group-focus-within:max-h-44 group-hover:max-h-44">
                  {PROJECTS.map((project) => {
                    const projectActive = pathname === `/project/${project.key}`;

                    return (
                      <Link
                        key={project.key}
                        className={cn(
                          "flex h-8 items-center gap-2.5 pl-11 pr-5 text-text-muted transition-colors hover:text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                          projectActive && "font-medium text-text-default"
                        )}
                        href={`/project/${project.key}`}
                      >
                        <span
                          aria-hidden
                          className="size-[7px] shrink-0 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="whitespace-nowrap text-[13px]">{project.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <button className={cn(ROW_BASE, "mt-auto w-full")} type="button" onClick={handleSignOut}>
        <LogOut aria-hidden className="size-[18px] shrink-0" />
        <span className={LABEL_BASE}>로그아웃</span>
      </button>
    </aside>
  );
};
