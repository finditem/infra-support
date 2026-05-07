import { cn } from "@/utils";

type ApiStatus = "healthy" | "degraded" | "outage";

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

const API_STATUS_BADGE_STYLES: Record<ApiStatus, { label: string; className: string }> = {
  healthy: {
    label: "정상",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  degraded: {
    label: "지연",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  outage: {
    label: "장애",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

const BADGE_BASE_STYLE =
  "inline-flex w-fit h-6 items-center justify-center gap-1 rounded-[100px] border px-3 py-1 text-xs font-medium";

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
