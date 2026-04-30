import { cn } from "@/utils";
import Icon from "./Icon";

/**
 * input 또는 textarea의 텍스트를 지우는 버튼 컴포넌트입니다.
 *
 * @remarks
 * - 내용이 없을 때는 부모에서 조건부 렌더링으로 숨깁니다.
 *
 * @author jikwon
 */

interface ClearButtonProps {
  /** 버튼 클릭 시 실행할 핸들러 */
  onClick: () => void;
  /** 스크린 리더용 레이블 (default: '입력 내용 삭제') */
  ariaLabel?: string;
  /** 추가 클래스명 */
  className?: string;
  /** clear 아이콘 크기 (default: 12px) */
  size?: number;
}

/**
 * @example
 * ```tsx
 * // input 값이 있을 때만 노출
 * {value && <ClearButton onClick={() => setValue("")} />}
 * ```
 */

const ClearButton = ({
  size = 12,
  ariaLabel = "입력 내용 삭제",
  className,
  onClick,
}: ClearButtonProps) => {
  return (
    <button
      aria-label={ariaLabel}
      className={cn("rounded-full bg-black p-0.5 text-white flex-center", className)}
      type="button"
      onClick={onClick}
    >
      <Icon name="clear" size={size} />
    </button>
  );
};

export default ClearButton;
