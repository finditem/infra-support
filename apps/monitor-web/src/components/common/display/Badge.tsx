import { cn } from "@/utils";
import {
  API_STATUS_BADGE_STYLES,
  BADGE_BASE_STYLE,
  type ApiStatus,
} from "./_internal/badge.constants";

type StatusBadgeProps = {
  status: ApiStatus;
  label?: never;
  className?: string;
};

type CustomBadgeProps = {
  label: string;
  status?: never;
  className?: string;
};

type BadgeProps = StatusBadgeProps | CustomBadgeProps;

const Badge = (props: BadgeProps) => {
  if (props.status !== undefined) {
    const meta = API_STATUS_BADGE_STYLES[props.status];
    return (
      <span className={cn(BADGE_BASE_STYLE, meta.className, props.className)}>{meta.label}</span>
    );
  }

  return <span className={cn(BADGE_BASE_STYLE, props.className)}>{props.label}</span>;
};

export default Badge;
