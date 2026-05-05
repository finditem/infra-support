import { Icon, type IconName } from "@/components/common";
import { StatusLayout } from "./_internal";

/**
 * 데이터 조회 결과가 없는 빈 상태 UI입니다.
 *
 * @remarks
 * - `message`를 생략하면 기본 문구 "데이터가 없습니다."를 표시합니다.
 * - `icon`을 생략하면 아이콘 없이 메시지만 표시됩니다.
 *
 * @author jikwon
 */

interface EmptyStateProps {
  /** 빈 상태 안내 메시지 */
  message?: string;
  /** 표시할 아이콘 */
  icon?: IconName;
  /** 아이콘 크기 (default: `32`) */
  iconSize?: number;
  /** 아이콘에 적용할 스타일 (default: `"text-gray-400"`) */
  iconClassName?: string;
}

/**
 * @example
 * // 기본
 * <EmptyState />
 *
 * // 아이콘, 메시지 커스텀
 * <EmptyState icon="check" iconClassName="text-blue-400" message="검색 결과가 없습니다." />
 */

const EmptyState = ({
  message = "데이터가 없습니다.",
  icon,
  iconSize = 32,
  iconClassName = "text-gray-400",
}: EmptyStateProps) => {
  return (
    <StatusLayout>
      {icon && <Icon className={iconClassName} name={icon} size={iconSize} />}
      <p className="text-sm text-gray-500">{message}</p>
    </StatusLayout>
  );
};

export default EmptyState;
