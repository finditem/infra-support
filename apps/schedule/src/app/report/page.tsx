import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getRegisteredProfiles } from "../_lib/profiles";
import ProfileAvatar from "../_components/ProfileAvatar";
import { getMemberReportStats, isReportRange, type ReportRange } from "./_lib/report";

interface ReportPageProps {
  searchParams: Promise<{ range?: string }>;
}

const RANGE_TABS: { key: ReportRange; label: string }[] = [
  { key: "week", label: "최근 7일" },
  { key: "month", label: "최근 30일" },
  { key: "quarter", label: "최근 90일" },
];

const formatPercent = (value: number | null) => (value === null ? "—" : `${value}%`);
const formatDays = (value: number | null) => (value === null ? "—" : `${value}일`);

const ReportPage = async ({ searchParams }: ReportPageProps) => {
  const { range: rawRange } = await searchParams;
  const range: ReportRange = rawRange && isReportRange(rawRange) ? rawRange : "week";

  const supabase = await createClient();
  const profiles = await getRegisteredProfiles(supabase);
  const stats = await getMemberReportStats(supabase, profiles, range);

  const hasTrackedData = stats.some((row) => row.trackedCompletionCount > 0);

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-border bg-surface-elevated px-4 py-5 sm:px-8">
        <h1 className="text-lg font-semibold text-text-default">일정 분석 리포트</h1>
        <p className="mt-1 text-xs text-text-muted">
          팀원별 일정 완료율과 일정관리 활용도를 보여줍니다. 운영·모바일·어드민·모니터링 전체
          프로젝트를 합산합니다.
        </p>

        <div className="mt-4 flex items-center gap-1 border-b border-border">
          {RANGE_TABS.map((tab) => (
            <Link
              key={tab.key}
              className={`-mb-px border-b-2 px-3 py-2 text-sm ${
                range === tab.key
                  ? "border-primary font-semibold text-text-default"
                  : "border-transparent text-text-muted hover:text-text-default"
              }`}
              href={`/report?range=${tab.key}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-x-auto px-4 py-6 sm:px-8">
        {!hasTrackedData && (
          <p className="mb-4 rounded-md border border-border bg-surface-elevated px-3 py-2 text-xs text-text-muted">
            마감일 준수율과 평균 완료 소요 시간은 상태 변경 기록이 쌓이기 시작한 시점 이후 완료된
            일정만 집계합니다. 과거 데이터는 소급해서 보여줄 수 없어, 값이 쌓이기 전까지는 전부
            "—"로 표시됩니다.
          </p>
        )}

        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-muted">
              <th className="py-2 pr-4 font-medium">팀원</th>
              <th className="py-2 pr-4 font-medium">완료율</th>
              <th className="py-2 pr-4 font-medium">담당 일정</th>
              <th className="py-2 pr-4 font-medium">마감일 준수율</th>
              <th className="py-2 pr-4 font-medium">평균 완료 소요</th>
              <th className="py-2 pr-4 font-medium">설명 작성률</th>
              <th className="py-2 pr-4 font-medium">하위일정 보유율</th>
              <th className="py-2 pr-4 font-medium">댓글</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((row) => (
              <tr key={row.profile.id} className="border-b border-border last:border-b-0">
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <ProfileAvatar profile={row.profile} size="sm" />
                    <span className="font-medium text-text-default">{row.profile.name}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="h-[6px] w-16 overflow-hidden rounded-full border border-border bg-fill-neutural-subtle-default">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${row.completionRate ?? 0}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-text-default">
                      {formatPercent(row.completionRate)}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 pr-4 tabular-nums text-text-default">
                  {row.completedCount}/{row.totalAssigned}
                </td>
                <td className="py-2.5 pr-4 tabular-nums text-text-default">
                  {formatPercent(row.onTimeRate)}
                </td>
                <td className="py-2.5 pr-4 tabular-nums text-text-default">
                  {formatDays(row.avgCompletionDays)}
                </td>
                <td className="py-2.5 pr-4 tabular-nums text-text-default">
                  {row.totalAssigned === 0
                    ? "—"
                    : `${Math.round((row.bodyFilledCount / row.totalAssigned) * 100)}%`}
                </td>
                <td className="py-2.5 pr-4 tabular-nums text-text-default">
                  {row.totalAssigned === 0
                    ? "—"
                    : `${Math.round((row.hasSubtaskCount / row.totalAssigned) * 100)}%`}
                </td>
                <td className="py-2.5 pr-4 tabular-nums text-text-default">{row.commentCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {stats.length === 0 && (
          <p className="mt-4 text-sm text-text-muted">아직 가입을 완료한 팀원이 없습니다.</p>
        )}
      </div>
    </main>
  );
};

export default ReportPage;
