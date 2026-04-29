import type { SVGProps } from "react";
import { ICON_MAP } from "@/assets/icons.constants";

export type IconName = keyof typeof ICON_MAP;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "aria-hidden"> {
  "aria-hidden"?: boolean;
  name: IconName;
  size?: number;
}

const Icon = ({ "aria-hidden": ariaHidden = true, name, size = 24, ...props }: IconProps) => {
  const SvgIcon = ICON_MAP[name];

  return <SvgIcon aria-hidden={ariaHidden} height={size} width={size} {...props} />;
};

export default Icon;
