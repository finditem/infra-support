import { useState } from "react";
import {
  DashboardHeader,
  DashboardResponseTimeChart,
  DashboardResponseStatusChart,
  DashboardSummaryCard,
  DashboardApiList,
} from "./_components";
import type { DashboardTimeRange } from "./_types";

const Dashboard = () => {
  const [range, setRange] = useState<DashboardTimeRange>("24h");

  return (
    <>
      <DashboardHeader range={range} onRangeChange={setRange} />

      <div className="mt-[30px] flex flex-col gap-[30px]">
        <DashboardSummaryCard range={range} />

        <div className="grid grid-cols-[minmax(0,1fr)_372px] gap-6">
          <DashboardResponseTimeChart range={range} />
          <DashboardResponseStatusChart range={range} />
        </div>

        <DashboardApiList />
      </div>
    </>
  );
};

export default Dashboard;
