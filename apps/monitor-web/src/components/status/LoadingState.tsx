import { LoadingSpinner } from "@/components/common";
import { StatusLayout } from "./_internal";

/**
 * 데이터 로딩 중 상태 UI입니다.
 *
 * @remarks
 * - `LoadingSpinner`의 `role="status"`가 스크린 리더 접근성을 처리합니다.
 * - `message`를 생략하면 스피너만 표시됩니다.
 *
 * @author jikwon
 */

interface LoadingStateProps {
  /** 로딩 스피너 아래 표시할 안내 메시지 */
  message?: string;
}

/**
 * @example
 * // 기본
 * <LoadingState />
 *
 * // 메시지 포함
 * <LoadingState message="데이터를 불러오는 중입니다." />
 */

const LoadingState = ({ message }: LoadingStateProps) => {
  return (
    <StatusLayout role="none">
      <LoadingSpinner size={32} />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </StatusLayout>
  );
};

export default LoadingState;
