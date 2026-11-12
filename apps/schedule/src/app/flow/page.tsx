import { headers } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/utils";
import { getRegisteredProfiles } from "../_lib/profiles";
import { isReportRange, type ReportRange } from "../report/_lib/report";
import { getFlowGraph } from "./_lib/flowGraph";
import FlowGraph from "./_components/FlowGraph";

interface FlowPageProps {
  searchParams: Promise<{ range?: string; member?: string }>;
}

const RANGE_TABS: { key: ReportRange; label: string }[] = [
  { key: "week", label: "최근 7일" },
  { key: "month", label: "최근 30일" },
  { key: "quarter", label: "최근 90일" },
];

/** 전체(모든 담당자) 보기를 뜻하는 member 값. */
const ALL_MEMBERS = "all";

const FlowPage = async ({ searchParams }: FlowPageProps) => {
  const { range: rawRange, member: rawMember } = await searchParams;
  const range: ReportRange = rawRange && isReportRange(rawRange) ? rawRange : "month";

  const supabase = await createClient();
  const profiles = await getRegisteredProfiles(supabase);

  // 미들웨어가 검증해 넘긴 x-user-id로 "본인"을 기본 담당자로 잡는다.
  const currentUserId = (await headers()).get("x-user-id");
  const profileIds = new Set(profiles.map((profile) => profile.id));

  const resolveSelectedMember = () => {
    if (rawMember === ALL_MEMBERS) return ALL_MEMBERS;
    if (rawMember && profileIds.has(rawMember)) return rawMember;
    if (currentUserId && profileIds.has(currentUserId)) return currentUserId;
    return ALL_MEMBERS;
  };
  const selectedMember = resolveSelectedMember();
  const selectedName =
    selectedMember === ALL_MEMBERS
      ? "전체"
      : (profiles.find((profile) => profile.id === selectedMember)?.name ?? "담당자");

  const data = await getFlowGraph(
    supabase,
    range,
    selectedMember === ALL_MEMBERS ? null : selectedMember
  );

  const hrefWith = (next: { range?: ReportRange; member?: string }) =>
    `/flow?range=${next.range ?? range}&member=${next.member ?? selectedMember}`;

  const memberChips = [{ id: ALL_MEMBERS, name: "전체" }, ...profiles];

  return (
    <>
      <header className="border-b border-border bg-surface-elevated px-4 py-5 sm:px-8">
        <h1 className="text-lg font-semibold text-text-default">작업 흐름</h1>
        <p className="mt-1 text-xs text-text-muted">
          상위 일정을 줄기, 하위 일정을 가지로 그립니다. 하위 일정이 생긴 날 갈라져 나왔다가
          완료되면 줄기로 합류하고, 완료되지 못한 가지는 끊긴 끝점으로 남습니다.
        </p>

        <div className="mt-4 flex items-center gap-1 border-b border-border">
          {RANGE_TABS.map((tab) => (
            <Link
              key={tab.key}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-sm",
                range === tab.key
                  ? "border-primary font-semibold text-text-default"
                  : "border-transparent text-text-muted hover:text-text-default"
              )}
              href={hrefWith({ range: tab.key })}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </header>

      <div className="flex-1 px-4 py-6 sm:px-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-text-muted">담당자</span>
          {memberChips.map((chip) => (
            <Link
              key={chip.id}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                selectedMember === chip.id
                  ? "bg-primary/10 border-primary font-semibold text-text-default"
                  : "border-border text-text-muted hover:text-text-default"
              )}
              href={hrefWith({ member: chip.id })}
            >
              {chip.name}
            </Link>
          ))}
        </div>

        <p className="mb-4 rounded-md border border-border bg-surface-elevated px-3 py-2 text-xs text-text-muted">
          가지 위의 상태 전이 점은 상태 변경 기록이 쌓이기 시작한 시점 이후의 전이만 보여줍니다. 그
          전에 완료된 과거 일정은 중간 점 없이 시작과 완료만 표시됩니다.
        </p>

        {data.parents.length === 0 ? (
          <p className="mt-10 text-center text-sm text-text-muted">
            {selectedName} 기준으로 이 기간에 표시할 작업 흐름이 없습니다. 기간을 넓히거나 다른
            담당자를 선택해 보세요.
          </p>
        ) : (
          <FlowGraph data={data} />
        )}
      </div>
    </>
  );
};

export default FlowPage;
