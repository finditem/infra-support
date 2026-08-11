import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  ElementType,
  MouseEvent,
  ReactNode,
} from "react";
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
 * - `as`로 렌더링할 엘리먼트/컴포넌트를 바꿀 수 있습니다 (예: `react-router-dom`의 `Link`). 이때 `disabled`는 클릭만 막고, 네이티브 `disabled` 속성에 의존하는 비활성 스타일은 적용되지 않습니다.
 *
 * @author junyeol
 */

interface BasicButtonOwnProps {
  /** 버튼 내부 콘텐츠 */
  children: ReactNode;
  /** 비활성화 여부 (default: `false`) */
  disabled?: boolean;
  /** 로딩 상태 여부 (default: `false`) */
  loading?: boolean;
  /** 클릭 핸들러. `disabled`이면 호출되지 않습니다. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** 버튼 크기 (default: `medium`) */
  size?: Size;
  /** 네이티브 `button`의 `type` 속성 (default: `button`) */
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  /** 버튼 스타일 변형 (default: `primary`) */
  variant?: Variant;
}

type BasicButtonProps<T extends ElementType> = BasicButtonOwnProps & {
  /** 렌더링할 엘리먼트/컴포넌트 (default: `button`) */
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof BasicButtonOwnProps | "as">;

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
 *
 * <BasicButton as={Link} to="/login">
 *   로그인
 * </BasicButton>
 * ```
 */

const BasicButton = <T extends ElementType = "button">({
  as,
  children,
  className,
  disabled = false,
  loading = false,
  onClick,
  size = "medium",
  type = "button",
  variant = "primary",
  ...props
}: BasicButtonProps<T>) => {
  const Component = as ?? "button";
  const isNativeButton = Component === "button";
  const isDisabled = disabled || loading;

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <Component
      {...props}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      className={cn(
        BASE_STYLES,
        SIZE_STYLES[size],
        VARIANT_STYLES[variant],
        STATE_STYLES,
        loading && LOADING_STYLES,
        className
      )}
      disabled={isNativeButton ? isDisabled : undefined}
      type={isNativeButton ? type : undefined}
      onClick={handleClick}
    >
      <span className={cn(loading && "invisible")}>{children}</span>

      {loading && (
        <span className="absolute inset-0 flex-center">
          <LoadingSpinner size={LOADING_SPINNER_SIZE[size]} />
        </span>
      )}
    </Component>
  );
};

export default BasicButton;
