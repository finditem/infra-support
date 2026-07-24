import type { ProfilesRow, TasksRow } from "@/types/tables";
import type { KanbanFilterState } from "../_types/kanban";

const PRIORITY_OPTIONS: { id: TasksRow["priority"]; label: string }[] = [
  { id: "high", label: "높음" },
  { id: "medium", label: "중간" },
  { id: "low", label: "낮음" },
];

const SELECT_CLASSNAME =
  "rounded-md border border-border bg-surface-elevated px-3 py-[6px] text-xs font-medium text-text-default";

interface KanbanFiltersProps {
  filter: KanbanFilterState;
  profiles: ProfilesRow[];
  onFilterChange: (filter: KanbanFilterState) => void;
}

const KanbanFilters = ({ filter, profiles, onFilterChange }: KanbanFiltersProps) => {
  return (
    <div className="flex items-center gap-2">
      <select
        aria-label="담당자 필터"
        className={SELECT_CLASSNAME}
        value={filter.assigneeId ?? ""}
        onChange={(event) => onFilterChange({ ...filter, assigneeId: event.target.value || null })}
      >
        <option value="">담당자: 전체</option>
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </select>

      <select
        aria-label="보고자 필터"
        className={SELECT_CLASSNAME}
        value={filter.reporterId ?? ""}
        onChange={(event) => onFilterChange({ ...filter, reporterId: event.target.value || null })}
      >
        <option value="">보고자: 전체</option>
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </select>

      <select
        aria-label="우선순위 필터"
        className={SELECT_CLASSNAME}
        value={filter.priority ?? ""}
        onChange={(event) =>
          onFilterChange({
            ...filter,
            priority: (event.target.value || null) as KanbanFilterState["priority"],
          })
        }
      >
        <option value="">우선순위: 전체</option>
        {PRIORITY_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        aria-pressed={filter.onlyMine}
        className={`rounded-full border px-3 py-[6px] text-xs font-semibold transition ${
          filter.onlyMine
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-text-muted"
        }`}
        type="button"
        onClick={() => onFilterChange({ ...filter, onlyMine: !filter.onlyMine })}
      >
        내 일정만 보기
      </button>
    </div>
  );
};

export default KanbanFilters;
