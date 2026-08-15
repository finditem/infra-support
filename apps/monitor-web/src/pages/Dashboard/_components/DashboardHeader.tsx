import { Icon } from "@/components";
import type { DashboardTimeRangeProps } from "../_types";
import DashboardTimeToggle from "./DashboardTimeToggle";

const DashboardHeader = ({ range, onRangeChange }: DashboardTimeRangeProps) => {
  return (
    <header
      aria-labelledby="dashboard-title"
      className="-mx-6 -mt-6 flex items-center justify-between border border-border-divider-default bg-white px-6 py-4"
    >
      <div className="flex items-center">
        <Icon className="mr-2" height={20} name="sidebarDashboard" width={20} />
        <h1 id="dashboard-title" className="typo-header3-bold">
          메인 대시보드
        </h1>
      </div>

      <DashboardTimeToggle range={range} onRangeChange={onRangeChange} />
    </header>
  );
};

export default DashboardHeader;
