import { useState } from "react";
import { DashboardHeader, DashboardResponseTimeChart } from "./_components";
import type { DashboardTimeRange } from "./_types";

const Dashboard = () => {
  const [range, setRange] = useState<DashboardTimeRange>("24h");

  return (
    <>
      <DashboardHeader range={range} onRangeChange={setRange} />

      <main className="mt-[30px]">
        <DashboardResponseTimeChart />
      </main>
    </>
  );
};

export default Dashboard;
