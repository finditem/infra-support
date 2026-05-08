import { cn } from "@/utils";

/**
 * 공통 Skeleton 컴포넌트입니다.
 *
 * @remarks
 * - 로딩 중 콘텐츠 영역의 레이아웃 자리를 유지하기 위한 표시용 컴포넌트입니다.
 * - 애니메이션은 전역 CSS 클래스(`skeleton-shimmer`)를 통해 적용됩니다.
 * - 장식 목적 요소이므로 `aria-hidden="true"`로 렌더링됩니다.
 *
 * @author junyeol
 */

interface SkeletonProps {
  /** 추가 클래스명 (크기/여백/위치 조정) */
  className?: string;
  /** 모서리 스타일 (default: "md") */
  rounded?: "sm" | "md" | "lg" | "full";
}

const ROUNDED_CLASS_MAP = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
} as const;

/**
 * @example
 * ```tsx
 * <Skeleton className="h-6 w-40" />
 * ```
 */

const Skeleton = ({ className, rounded = "md" }: SkeletonProps) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "skeleton-shimmer pointer-events-none select-none bg-slate-200/70",
        ROUNDED_CLASS_MAP[rounded],
        className
      )}
    />
  );
};

export default Skeleton;
