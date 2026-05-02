import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils";
import LoadingSpinner from "../LoadingSpinner";
import {
  BASE_STYLES,
  LOADING_SPINNER_SIZE,
  SIZE_STYLES,
  VARIANT_STYLES,
  Size,
} from "./constantButton";

/**
 * 공통 베이직 버튼 컴포넌트입니다.
 *
 * @remarks
 * - `size`와 `variant` 조합으로 버튼 외형을 제어합니다.
 * - `loading`이 `true`이면 스피너를 표시하고 버튼을 비활성화합니다.
 * - 로딩 중에는 `aria-busy`가 자동 적용됩니다.
 *
 * @author junyeol
 */

type Variant = "solid" | "outlined" | "inversed" | "auth";

type Hierarchy = "normal" | "subtle";

interface BasicButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** 버튼 내부 콘텐츠 */
  children: ReactNode;
  /** 로딩 상태 여부 (default: `false`) */
  loading?: boolean;
  /** 버튼 스타일 타입 (default: `solid`) */
  variant?: Variant;
  /** `solid` 강조 단계 (default: `normal`) */
  hierarchy?: Hierarchy;
  /** 버튼 크기 (default: `medium`) */
  size?: Size;
}

/**
 * @example
 * ```tsx
 * <BasicButton size="big" variant="solid" onClick={handleSubmit}>
 *   저장
 * </BasicButton>
 *
 * <BasicButton size="small" variant="outlined">
 *   취소
 * </BasicButton>
 *
 * <BasicButton loading variant="solid">
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
  variant = "solid",
  hierarchy = "normal",
  ...props
}: BasicButtonProps) => {
  const variantClass =
    variant === "solid" ? VARIANT_STYLES.solid[hierarchy] : VARIANT_STYLES[variant].base;

  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={cn(BASE_STYLES, SIZE_STYLES[size], variantClass, className)}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? <LoadingSpinner size={LOADING_SPINNER_SIZE[size]} /> : children}
    </button>
  );
};

export default BasicButton;
