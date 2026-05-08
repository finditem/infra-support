//TODO(준열): disabled 스타일 추가 필요

import { CheckboxButton } from "../buttons";
import {
  CHIP_ACTIVE_STYLE,
  CHIP_BASE_STYLE,
  CHIP_INACTIVE_STYLE,
} from "./_internal/chip.constants";
import { cn } from "@/utils";

/**
 * 공통 Chip 컴포넌트입니다.
 *
 * @remarks
 * - `CheckboxButton`을 기반으로 동작하는 controlled 토글 컴포넌트입니다.
 * - `checked` 값에 따라 활성/비활성 스타일이 자동 적용됩니다.
 * - `disabled`가 `true`이면 클릭이 비활성화됩니다.
 *
 * @author junyeol
 */

interface ChipProps {
  /** Chip의 표시 텍스트 */
  label: string;
  /** 체크 여부 (default: `false`) */
  checked?: boolean;
  /** 체크 상태 변경 시 호출되는 콜백 */
  onCheckedChange?: (checked: boolean) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 체크박스 크기 */
  size?: "sm" | "md" | "lg";
  /** 추가 클래스명 */
  className?: string;
}

/**
 * @example
 * ```tsx
 * const [isChecked, setIsChecked] = useState(false);
 *
 * <Chip
 *  label={isChecked ? "확인완료" : "확인전"}
 *  checked={isChecked}
 *  onCheckedChange={setIsChecked}
 * />
 * ```
 */

const Chip = ({ label, checked = false, onCheckedChange, disabled, className }: ChipProps) => {
  return (
    <CheckboxButton
      className={cn(
        CHIP_BASE_STYLE,
        checked ? CHIP_ACTIVE_STYLE : CHIP_INACTIVE_STYLE,
        // disabled && CHIP_DISABLED_STYLE,
        className
      )}
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
    >
      {label}
    </CheckboxButton>
  );
};

export default Chip;
