"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

// 로그인·초대 설정 화면은 아직 앱 안으로 들어오기 전이라 사이드바를 띄우지 않는다.
const NO_SHELL_PREFIXES = ["/login", "/invite"];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const hideShell = NO_SHELL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (hideShell) {
    return <>{children}</>;
  }

  // 사이드바는 fixed로 깔고, 본문은 접힌 레일 폭(64px)만큼 왼쪽을 비워 겹치지 않게 한다.
  // 레일이 hover로 펼쳐질 때는 본문 위에 오버레이되므로 레이아웃이 다시 흐르지 않는다.
  return (
    <div className="min-h-screen pl-16">
      {/* Sidebar가 useSearchParams로 현재 주차를 읽으므로 Suspense 경계로 감싼다. */}
      <Suspense>
        <Sidebar />
      </Suspense>
      {/* 쉘 라우트의 공통 main 랜드마크. 페이지마다 따로 두지 않고 여기서 한 번만 렌더해 중복을 없앤다. */}
      <main className="flex min-h-screen flex-col bg-surface">{children}</main>
    </div>
  );
};
