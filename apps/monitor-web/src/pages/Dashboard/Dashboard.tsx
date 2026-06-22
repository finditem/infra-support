import { useState } from "react";
import {
  DashboardHeader,
  DashboardResponseTimeChart,
  DashboardResponseStatusChart,
  DashboardSummaryCard,
} from "./_components";
import type { DashboardTimeRange } from "./_types";

const Dashboard = () => {
  const [range, setRange] = useState<DashboardTimeRange>("24h");

  return (
    <>
      <DashboardHeader range={range} onRangeChange={setRange} />

      <main className="mt-[30px] flex flex-col gap-8">
        <DashboardSummaryCard />

        <div className="grid grid-cols-[minmax(0,1fr)_372px] gap-6">
          <DashboardResponseTimeChart />
          <DashboardResponseStatusChart />
        </div>
      </main>
    </>
  );
};

export default Dashboard;
