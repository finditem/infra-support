import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { AppShell } from "@/components/AppShell";
import { ThemeToggle } from "@/components/ThemeToggle";

import "./globals.css";

export const metadata: Metadata = {
  title: "찾길 팀 일정",
  description: "찾길 팀 내부 일정 관리 툴",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppShell>{children}</AppShell>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
