import type { ButtonHTMLAttributes, ReactNode } from "react";
import Icon from "../display/Icon";
import { cn } from "@/utils";

/**
 * 체크/미체크 상태를 아이콘 색상으로 표현하는 controlled 체크박스 컴포넌트입니다.
 *
 * @remarks
 * - `onChange` 대신 `onCheckedChange`를 사용합니다.
 * - `onCheckedChange` 없이 사용하면 클릭해도 시각적으로 변하지 않습니다.
 *
 * @author jikwon
 */

interface CheckboxButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** 체크박스 옆에 표시할 레이블 */
  children?: ReactNode;
  /** 체크 여부 (default: `false`) */
  checked?: boolean;
  /** 체크 상태 변경 시 호출되는 콜백 */
  onCheckedChange?: (checked: boolean) => void;
  /** 아이콘 크기 (default: `"md"`) */
  size?: "sm" | "md";
}

const SIZE_MAP = {
  sm: 18,
  md: 30,
} as const;

const PADDING_MAP = {
  sm: "p-[3px]",
  md: "p-[5px]",
} as const;

/**
 * @example
 * // 기본 사용
 * const [checked, setChecked] = useState(false);
 * <CheckboxButton checked={checked} onCheckedChange={setChecked}>항목 선택</CheckboxButton>
 *
 * // 크기 지정
 * <CheckboxButton checked={checked} size="sm" onCheckedChange={setChecked}>소형 체크박스</CheckboxButton>
 */

const CheckboxButton = ({
  checked = false,
  onCheckedChange,
  size = "md",
  className,
  children,
  ...props
}: CheckboxButtonProps) => {
  return (
    <button
      aria-checked={checked}
      role="checkbox"
      className={cn("group flex items-center gap-2", className)}
      type="button"
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <Icon
        className={cn(
          "rounded-[4px] border border-fg-primary-normal-default bg-bg-layout-1depth",
          "group-disabled:cursor-not-allowed group-disabled:border-border-neutural-default",
          checked ? "text-fg-primary-strong-default" : "text-white",
          PADDING_MAP[size]
        )}
        name="check"
        size={SIZE_MAP[size]}
      />
      {children}
    </button>
  );
};

export default CheckboxButton;
