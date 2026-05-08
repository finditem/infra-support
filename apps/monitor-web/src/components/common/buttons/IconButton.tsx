import type { ButtonHTMLAttributes } from "react";
import Icon, { type IconName } from "../display/Icon";

/**
 * 공통 아이콘 버튼 컴포넌트입니다.
 *
 * @remarks
 * - 아이콘만 렌더링하는 버튼입니다.
 * - 접근성을 위해 스크린 리더용 레이블(`aria-label`)을 필수로 받습니다.
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
  "aria-label": string;
  /** 아이콘 크기(px) (default: `24`) */
  iconSize?: number;
}

/**
 * @example
 * ```tsx
 * <IconButton iconName="clear" aria-label="닫기" onClick={handleClose} />
 * <IconButton iconName="alert" aria-label="알림 열기" />
 * ```
 */

const IconButton = ({
  iconName,
  iconSize = 24,
  "aria-label": ariaLabel,
  className,
  type = "button",
  ...props
}: IconButtonProps) => {
  return (
    <button {...props} aria-label={ariaLabel} className={className} type={type}>
      <Icon name={iconName} size={iconSize} />
    </button>
  );
};

export default IconButton;
