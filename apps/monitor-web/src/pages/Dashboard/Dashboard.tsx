import { useState } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { BasicButton, ErrorBoundary, ErrorState } from "@/components";
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
  const { reset: resetQueryErrors } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      fallback={(_error, resetBoundary) => (
        <ErrorState icon="clear" message="대시보드를 불러오는 중 문제가 발생했습니다.">
          <BasicButton
            onClick={() => {
              resetQueryErrors();
              resetBoundary();
            }}
          >
            다시 시도
          </BasicButton>
        </ErrorState>
      )}
    >
      <DashboardHeader range={range} onRangeChange={setRange} />

      <div className="mt-5 flex flex-col gap-5">
        <DashboardSummaryCard range={range} />

        <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-5">
          <DashboardResponseTimeChart range={range} />
          <DashboardResponseStatusChart range={range} />
        </div>

        <DashboardApiList />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
