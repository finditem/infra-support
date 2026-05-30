import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils";
import { CHIP_BASE_STYLE, CHIP_STATE_STYLE } from "./_internal/chip.constants";

/**
 * 공통 Chip 컴포넌트입니다.
 *
 * @remarks
 * - `selected` 상태에 따라 스타일이 변경됩니다.
 * - `disabled`가 `true`이면 클릭이 비활성화됩니다.
 *
 * @author junyeol
 */

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Chip의 표시 텍스트 */
  label: string;
  /** 선택 상태 여부 (default: `false`) */
  selected?: boolean;
}

/**
 * @example
 * ```tsx
 * const [selected, setSelected] = useState(false);
 *
 * <Chip
 *   label="전체"
 *   selected={selected}
 *   onClick={() => setSelected((prev) => !prev)}
 * />
 * ```
 */

const Chip = ({ label, selected = false, disabled = false, className, ...props }: ChipProps) => {
  return (
    <button
      className={cn(CHIP_BASE_STYLE, CHIP_STATE_STYLE, className)}
      data-selected={selected}
      disabled={disabled}
      type="button"
      {...props}
    >
      {label}
    </button>
  );
};

export default Chip;
