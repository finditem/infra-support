import type { SVGProps } from "react";
import { ICON_MAP } from "@/assets/icons.constants";

export type IconName = keyof typeof ICON_MAP;

/**
 * `ICON_MAP`에 등록된 아이콘 이름과 크기를 받아 SVG 컴포넌트를 렌더링합니다.
 *
 * @remarks 장식용 아이콘은 기본값 `aria-hidden={true}`로 스크린 리더에서 제외됩니다.
 * 의미 있는 아이콘(단독 버튼 등)은 `aria-hidden={false}`와 함께 `aria-label`을 명시해야 합니다.
 *
 * @author jikwon
 */

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "aria-hidden"> {
  /** 스크린 리더 노출 여부. 기본값 `true` */
  "aria-hidden"?: boolean;
  /** `ICON_MAP`에 등록된 아이콘 키 */
  name: IconName;
  /** 아이콘 크기(px). `width`와 `height`에 동일하게 적용됩니다. 기본값 `24` */
  size?: number;
}

/**
 * @example
 * // 장식용 (기본)
 * <Icon name="alert" size={20} className="text-red-500" />
 *
 * // 의미 있는 아이콘
 * <Icon name="alert" aria-hidden={false} aria-label="알림" />
 */

const Icon = ({ "aria-hidden": ariaHidden = true, name, size = 24, ...props }: IconProps) => {
  const SvgIcon = ICON_MAP[name];

  return <SvgIcon aria-hidden={ariaHidden} height={size} width={size} {...props} />;
};

export default Icon;
