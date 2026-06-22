import { ApiResponseTimeChart, Icon } from "@/components";
import { MOCK_RESPONSE_TIME_DATA } from "@/mock";

const DashboardResponseTimeChart = () => {
  return (
    <section className="rounded-xl border border-border-divider-default bg-bg-layout-1depth px-8 py-12">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="typo-header4-bold">전체 API 응답 속도 추이</h2>
          <p className="typo-body2-medium mt-3 text-layout-body">
            평균 443ms 최고 1,230ms 최저 210ms
          </p>
        </div>

        <div className="flex items-center gap-[10px]">
          <span className="size-4 rounded-full bg-fill-primary-strong-default text-white flex-center">
            <Icon height={7} name="check" width={10} />
          </span>
          <p className="typo-body2-medium text-fg-primary-strong-default">
            최근 24시간 기준 장애 없음
          </p>
        </div>
      </div>
      <div className="mt-[60px] h-[433px]">
        <ApiResponseTimeChart data={MOCK_RESPONSE_TIME_DATA} />
      </div>
    </section>
  );
};

export default DashboardResponseTimeChart;
