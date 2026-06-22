import { useState } from "react";
import {
  DashboardHeader,
  DashboardResponseTimeChart,
  DashboardResponseStatusChart,
} from "./_components";
import type { DashboardTimeRange } from "./_types";

const Dashboard = () => {
  const [range, setRange] = useState<DashboardTimeRange>("24h");

  return (
    <>
      <DashboardHeader range={range} onRangeChange={setRange} />

      <main className="mt-[30px] grid grid-cols-[minmax(0,1fr)_372px] gap-6">
        <DashboardResponseTimeChart />
        <DashboardResponseStatusChart />
      </main>
    </>
  );
};

export default Dashboard;
