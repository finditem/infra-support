import type { ButtonHTMLAttributes } from "react";
import Icon, { type IconName } from "../Icon";
import { cn } from "@/utils";

/**
 * 공통 아이콘 버튼 컴포넌트입니다.
 *
 * @remarks
 * - 아이콘만 렌더링하는 버튼입니다.
 * - 접근성을 위해 스크린 리더용 레이블(`ariaLabel`)을 필수로 받습니다.
 * - 기본 `type`은 `"button"`입니다.
 *
 * @author junyeol
 */

interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "aria-label"
> {
  /** 렌더링할 아이콘 이름 */
  iconName: IconName;
  /** 스크린 리더용 레이블 */
  ariaLabel: string;
  /** 아이콘 크기(px) (default: `24`) */
  iconSize?: number;
}

/**
 * @example
 * ```tsx
 * <IconButton iconName="clear" ariaLabel="닫기" onClick={handleClose} />
 * <IconButton iconName="alert" ariaLabel="알림 열기" />
 * ```
 */
const IconButton = ({
  iconName,
  iconSize = 24,
  ariaLabel,
  className,
  type = "button",
  ...props
}: IconButtonProps) => {
  return (
    <button {...props} aria-label={ariaLabel} className={cn(className)} type={type}>
      <Icon name={iconName} size={iconSize} />
    </button>
  );
};

export default IconButton;
