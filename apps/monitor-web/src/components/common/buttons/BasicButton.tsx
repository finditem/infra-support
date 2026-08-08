import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils";
import LoadingSpinner from "../feedback/LoadingSpinner";
import {
  BASE_STYLES,
  LOADING_SPINNER_SIZE,
  LOADING_STYLES,
  SIZE_STYLES,
  STATE_STYLES,
  Size,
  VARIANT_STYLES,
  Variant,
} from "./_internal/buttons.constants";

/**
 * 공통 베이직 버튼 컴포넌트입니다.
 *
 * @remarks
 * - `size`로 버튼 스타일 속성을 제어합니다.
 * - `variant`로 채움(`primary`)/외곽선(`outline`) 스타일을 제어합니다.
 * - `loading`이 `true`이면 스피너를 표시하고 버튼을 비활성화합니다.
 * - 로딩 중에는 `aria-busy`가 자동 적용됩니다.
 *
 * @author junyeol
 */

interface BasicButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** 버튼 내부 콘텐츠 */
  children: ReactNode;
  /** 로딩 상태 여부 (default: `false`) */
  loading?: boolean;
  /** 버튼 크기 (default: `medium`) */
  size?: Size;
  /** 버튼 스타일 변형 (default: `primary`) */
  variant?: Variant;
}

/**
 * @example
 * ```tsx
 * <BasicButton size="big" onClick={handleSubmit}>
 *   저장
 * </BasicButton>
 *
 * <BasicButton size="small" >
 *   취소
 * </BasicButton>
 *
 * <BasicButton loading={...} onClick={...}>
 *   처리 중
 * </BasicButton>
 * ```
 */

const BasicButton = ({
  children,
  className,
  type = "button",
  disabled = false,
  loading = false,
  size = "medium",
  variant = "primary",
  ...props
}: BasicButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={cn(
        BASE_STYLES,
        SIZE_STYLES[size],
        VARIANT_STYLES[variant],
        STATE_STYLES,
        loading && LOADING_STYLES,
        className
      )}
      disabled={isDisabled}
      type={type}
    >
      <span className={cn(loading && "invisible")}>{children}</span>

      {loading && (
        <span className="absolute inset-0 flex-center">
          <LoadingSpinner size={LOADING_SPINNER_SIZE[size]} />
        </span>
      )}
    </button>
  );
};

export default BasicButton;
