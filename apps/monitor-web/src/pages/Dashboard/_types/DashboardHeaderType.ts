export type DashboardTimeRange = "24h" | "7d";

export interface DashboardTimeRangeProps {
  range: DashboardTimeRange;
  onRangeChange: (range: DashboardTimeRange) => void;
}
