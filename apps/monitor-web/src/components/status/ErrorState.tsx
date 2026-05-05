import { ReactNode } from "react";
import { Icon, type IconName } from "@/components/common";
import { StatusLayout } from "./_internal";

/**
 * 데이터 로딩 실패 등 오류 상태 UI입니다.
 *
 * @remarks
 * - `message`를 생략하면 기본 문구 "오류가 발생했습니다."를 표시합니다.
 * - `icon`을 생략하면 아이콘 없이 메시지만 표시됩니다.
 *
 * @author jikwon
 */

interface ErrorStateProps {
  /** 오류 안내 메시지 */
  message?: string;
  /** 표시할 아이콘 */
  icon?: IconName;
  /** 아이콘 크기 (default: `32`) */
  iconSize?: number;
  /** 아이콘에 적용할 스타일 (default: `"text-gray-400"`) */
  iconClassName?: string;
  /** 추가 UI */
  children?: ReactNode;
}

/**
 * @example
 * // 기본
 * <ErrorState />
 *
 * // 아이콘, 메시지 커스텀
 * <ErrorState icon="clear" message="데이터를 불러오는 중 문제가 발생했습니다." />
 */

const ErrorState = ({
  message = "오류가 발생했습니다.",
  icon,
  iconSize = 32,
  iconClassName = "text-gray-400",
  children,
}: ErrorStateProps) => {
  return (
    <StatusLayout role="alert">
      {icon && <Icon className={iconClassName} name={icon} size={iconSize} />}
      <p className="text-sm text-gray-500">{message}</p>
      {children}
    </StatusLayout>
  );
};

export default ErrorState;
