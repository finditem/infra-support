import { Icon } from "@/components";
import type { DashboardTimeRangeProps } from "../_types";
import DashboardTimeToggle from "./DashboardTimeToggle";

const DashboardHeader = ({ range, onRangeChange }: DashboardTimeRangeProps) => {
  return (
    <header
      aria-labelledby="dashboard-title"
      className="-mx-8 -mt-8 flex items-center justify-between border border-border-divider-default bg-white px-10 py-5"
    >
      <div className="flex items-center">
        <Icon className="m-4" height={23} name="sidebarDashboard" width={23} />
        <h1 id="dashboard-title" className="typo-header1-bold">
          메인 대시보드
        </h1>
      </div>

      <DashboardTimeToggle range={range} onRangeChange={onRangeChange} />
    </header>
  );
};

export default DashboardHeader;
