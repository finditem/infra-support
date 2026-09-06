"use client";

import { Loader2 } from "lucide-react";
import Link, { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

/**
 * 이동이 진행 중인 동안 화살표 자리에 스피너를 보여준다.
 * useLinkStatus는 Link의 자손에서만 상태를 읽을 수 있어 별도 컴포넌트로 분리했다.
 */
const NavArrowIcon = ({ children }: { children: ReactNode }) => {
  const { pending } = useLinkStatus();

  return pending ? <Loader2 className="size-4 animate-spin" /> : <>{children}</>;
};

interface NavArrowLinkProps {
  href: string;
  label: string;
  children: ReactNode;
}

/**
 * 기간을 앞뒤로 옮기는 화살표 링크. 칸반의 주차 이동과 캘린더의 월 이동이 함께 쓴다.
 *
 * 두 이동 모두 searchParams만 바뀌는 이동이라 loading.tsx가 뜨지 않는다.
 * 응답이 올 때까지 화면이 그대로 멈춰 있는 것처럼 보이므로, 화살표가 직접 진행 중임을 알린다.
 */
export const NavArrowLink = ({ href, label, children }: NavArrowLinkProps) => (
  <Link
    aria-label={label}
    className="flex size-8 items-center justify-center rounded-md border border-border text-text-muted hover:bg-fill-neutural-subtle-hover"
    href={href}
  >
    <NavArrowIcon>{children}</NavArrowIcon>
  </Link>
);
