import type { ChartDotProps } from "../types";

const ErrorDot = ({ cx, cy, payload }: ChartDotProps) => {
  if (!payload || payload.status !== "outage" || cx === undefined || cy === undefined) {
    return null;
  }

  return (
    <circle
      className="fill-fg-state-error"
      cx={cx}
      cy={cy}
      r={6}
      stroke="#FFFFFF"
      strokeWidth={1}
    />
  );
};

export default ErrorDot;
