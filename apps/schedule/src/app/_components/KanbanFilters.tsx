import type { ProfilesRow } from "@/types/tables";
import { cn } from "@/utils";
import { PRIORITY_META, PRIORITY_ORDER } from "../_lib/kanbanUtils";
import type { KanbanFilterState } from "../_types/kanban";

const SELECT_CLASSNAME =
  "rounded-md border border-border bg-surface-elevated px-3 py-[6px] text-xs font-medium text-text-default";

interface KanbanFiltersProps {
  filter: KanbanFilterState;
  profiles: ProfilesRow[];
  onFilterChange: (filter: KanbanFilterState) => void;
}

const KanbanFilters = ({ filter, profiles, onFilterChange }: KanbanFiltersProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="담당자 필터"
        className={SELECT_CLASSNAME}
        value={filter.assigneeId ?? ""}
        onChange={(event) => onFilterChange({ ...filter, assigneeId: event.target.value || null })}
      >
        <option value="">담당자: 전체</option>
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            담당자: {profile.name}
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
            보고자: {profile.name}
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
        {PRIORITY_ORDER.map((priority) => (
          <option key={priority} value={priority}>
            우선순위: {PRIORITY_META[priority].label}
          </option>
        ))}
      </select>

      <button
        aria-pressed={filter.onlyMine}
        className={cn(
          "rounded-full border px-3 py-[6px] text-xs font-semibold transition",
          filter.onlyMine
            ? "bg-primary/10 border-primary text-primary"
            : "border-border text-text-muted"
        )}
        type="button"
        onClick={() => onFilterChange({ ...filter, onlyMine: !filter.onlyMine })}
      >
        내 일정만 보기
      </button>
    </div>
  );
};

export default KanbanFilters;
