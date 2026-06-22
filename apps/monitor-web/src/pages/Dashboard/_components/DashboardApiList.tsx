import type { ReactNode } from "react";
import { Badge } from "@/components";
import { MOCK_DASHBOARD_API_LIST } from "@/mock";
import type { ApiStatus } from "@/types";
import type { ApiListItem } from "../_types";

const API_STATUS_LABEL: Record<ApiStatus, string> = {
  healthy: "정상",
  degraded: "지연",
  outage: "장애",
};

const API_TABLE_COLUMNS: {
  id: string;
  label: string;
  render: (api: ApiListItem) => ReactNode;
}[] = [
  {
    id: "apiName",
    label: "API 명",
    render: (api) => api.apiName,
  },
  {
    id: "apiSource",
    label: "출처",
    render: (api) => api.apiSource,
  },
  {
    id: "apiCategory",
    label: "카테고리",
    render: (api) => api.apiCategory,
  },
  {
    id: "lastCheckedAt",
    label: "마지막 테스트 날짜",
    render: (api) => api.lastCheckedAt,
  },
  {
    id: "responseTime",
    label: "응답속도",
    render: (api) => `${api.responseTime}ms`,
  },
  {
    id: "recentSuccessRate",
    label: "성공률",
    render: (api) => `${api.recentSuccessRate}%`,
  },
  {
    id: "apiStatus",
    label: "상태",
    render: (api) => (
      <Badge
        className="min-w-[52px] px-2"
        label={API_STATUS_LABEL[api.apiStatus]}
        status={api.apiStatus}
      />
    ),
  },
];

const DashboardApiList = () => {
  return (
    <section className="rounded-xl border border-border-divider-default bg-bg-layout-1depth px-8 py-8">
      <h2 className="typo-header4-bold text-layout-header">전체 API 목록</h2>

      <div className="mt-6 overflow-hidden rounded-xl">
        <table className="w-full table-fixed">
          <thead className="bg-bg-layout-2depth">
            <tr className="typo-body2-medium text-layout-body">
              {API_TABLE_COLUMNS.map((column) => (
                <th key={column.id} className="px-5 py-4 text-center">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {MOCK_DASHBOARD_API_LIST.map((api) => (
              <tr key={api.id}>
                {API_TABLE_COLUMNS.map((column) => (
                  <td
                    key={column.id}
                    className="typo-header4-medium px-5 py-4 text-center text-layout-body"
                  >
                    {column.render(api)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DashboardApiList;
