import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "팀 일정 관리",
  description: "찾아줘! 팀 내부 일정 관리 툴",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
