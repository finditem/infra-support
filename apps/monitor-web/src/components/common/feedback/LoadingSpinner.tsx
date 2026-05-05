import Icon from "../Icon";
import { cn } from "@/utils";

/**
 * 무한 로딩 스피너입니다.
 * 기본값 1초 주기로 무한 회전합니다.
 *
 * @remarks
 * - `role="status"`와 sr-only 텍스트가 내장되어 있어 별도 접근성 처리는 안 해도 됩니다.
 *
 * @author jikwon
 */

interface LoadingSpinnerProps {
  /** 추가 클래스명 */
  className?: string;
  /** 아이콘 크기 (default: 24px) */
  size?: number;
  /** 회전 애니메이션 주기 (default: 1s) */
  duration?: string;
}

/**
 * @example
 * // 기본
 * <LoadingSpinner />
 *
 * // 크기·속도 조정
 * <LoadingSpinner size={32} duration="0.6s" />
 */

const LoadingSpinner = ({ size = 24, className, duration }: LoadingSpinnerProps) => {
  return (
    <div role="status" className={cn("flex-center", className)}>
      <span className="sr-only">로딩 중</span>
      <Icon
        className="animate-spin"
        style={duration ? { animationDuration: duration } : undefined}
        name="loadingSpinner"
        size={size}
      />
    </div>
  );
};

export default LoadingSpinner;
