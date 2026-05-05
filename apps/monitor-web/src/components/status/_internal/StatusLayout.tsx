import { ReactNode } from "react";
import { cn } from "@/utils";

/**
 * 공통 상태 컴포넌트(error, empty, loading)의 레이아웃 래퍼입니다.
 *
 * @remarks
 * - error, empty, loading 등 상태 컴포넌트의 공통 레이아웃 래퍼입니다.
 * - `className`으로 기본 `py-20 gap-5` 스타일을 오버라이드할 수 있습니다.
 *
 * @author jikwon
 */

interface StatusLayoutProps {
  /** error, empty, loading 상태 UI 요소 */
  children: ReactNode;
  /** 기본 `py-20 gap-5` 스타일을 오버라이드할 스타일 */
  className?: string;
  /** 스크린 리더 알림 방식. error는 "alert", 자식이 role을 직접 처리할 때는 "none", 그 외는 "status" */
  role?: "status" | "alert" | "none";
}

/**
 * @example
 * ```tsx
 * <StatusLayout>
 *   <EmptyIcon />
 *   <p>데이터가 없습니다.</p>
 * </StatusLayout>
 * ```
 *
 * ```tsx
 * <StatusLayout role="alert">
 *   <ErrorIcon />
 *   <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
 * </StatusLayout>
 * ```
 */

const StatusLayout = ({ children, className, role = "status" }: StatusLayoutProps) => {
  return (
    <div role={role} className={cn("h-full w-full gap-5 py-20 flex-col-center", className)}>
      {children}
    </div>
  );
};

export default StatusLayout;
