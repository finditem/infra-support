import { useState } from "react";
import { DashboardHeader } from "./_components";
import type { DashboardTimeRange } from "./_types";

const Dashboard = () => {
  const [range, setRange] = useState<DashboardTimeRange>("24h");

  return (
    <>
      <DashboardHeader range={range} onRangeChange={setRange} />
    </>
  );
};

export default Dashboard;
