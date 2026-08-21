"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { getWeekLabel } from "../../_lib/kanbanUtils";
import { updateWeekSprintName } from "../_lib/actions";
import type { WeeksRow } from "@/types/tables";

interface SprintSettingsTableProps {
  weeks: WeeksRow[];
}

const SprintSettingsTable = ({ weeks }: SprintSettingsTableProps) => {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const getValue = (week: WeeksRow) => drafts[week.id] ?? week.sprint_name ?? "";

  const handleBlur = async (week: WeeksRow) => {
    const value = getValue(week).trim();
    if (value === (week.sprint_name ?? "")) return;

    setSavingId(week.id);
    await updateWeekSprintName(week.id, value === "" ? null : value);
    setSavingId(null);
    router.refresh();
  };

  if (weeks.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        아직 생성된 주차가 없습니다. 메인 일정 화면에서 해당 주로 이동하면 목록에 나타납니다.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-elevated text-left text-text-muted">
            <th className="px-4 py-2 font-medium">주차</th>
            <th className="px-4 py-2 font-medium">기간</th>
            <th className="px-4 py-2 font-medium">스프린트 이름</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week.id} className="border-b border-border last:border-b-0">
              <td className="px-4 py-2 text-text-default">
                {getWeekLabel(new Date(week.start_date))}
              </td>
              <td className="px-4 py-2 text-text-muted">
                {format(new Date(week.start_date), "M/d")} ~{" "}
                {format(new Date(week.end_date), "M/d")}
              </td>
              <td className="px-4 py-2">
                <input
                  className="w-full max-w-xs rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-text-default outline-none transition focus:border-primary"
                  disabled={savingId === week.id}
                  placeholder="예: 1차 스프린트"
                  type="text"
                  value={getValue(week)}
                  onBlur={() => handleBlur(week)}
                  onChange={(event) =>
                    setDrafts((prev) => ({ ...prev, [week.id]: event.target.value }))
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SprintSettingsTable;
