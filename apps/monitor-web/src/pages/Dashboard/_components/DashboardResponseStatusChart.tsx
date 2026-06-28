import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const CHART_DATA = [
  { name: "정상", value: 5, color: "#1BC587" },
  { name: "지연", value: 1, color: "#FFB020" },
  { name: "장애", value: 2, color: "#FF6363" },
];

const DashboardResponseStatusChart = () => {
  const totalApiCount = CHART_DATA.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="flex h-full flex-col rounded-xl border border-border-divider-default bg-bg-layout-1depth px-12 py-8">
      <h2 className="typo-header4-bold">응답 상태 분포</h2>

      <div className="flex flex-1 flex-col justify-between">
        <div className="mt-[60px] h-[260px]">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={CHART_DATA}
                dataKey="value"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={4}
                pointerEvents="none"
              >
                {CHART_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>

              <text dominantBaseline="middle" textAnchor="middle" x="50%" y="48%">
                <tspan className="typo-body2-medium fill-layout-header" dy="-0.4em" x="50%">
                  전체 API 수
                </tspan>
                <tspan className="typo-header3-bold fill-layout-header" dy="1.6em" x="50%">
                  {totalApiCount}개
                </tspan>
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="flex flex-col gap-3">
          {CHART_DATA.map((item) => (
            <li key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="typo-body2-medium text-layout-header">{item.name}</span>
              </div>

              <span className="typo-body2-bold text-layout-body">{item.value}개</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default DashboardResponseStatusChart;
