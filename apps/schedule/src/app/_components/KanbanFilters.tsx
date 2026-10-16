import { User } from "lucide-react";
import type { ProfilesRow, TasksRow } from "@/types/tables";
import { cn } from "@/utils";
import { PRIORITY_META, PRIORITY_ORDER } from "../_lib/kanbanUtils";
import type { KanbanFilterState } from "../_types/kanban";
import ProfilePickerPopover from "./ProfilePickerPopover";

const TRIGGER_CLASSNAME =
  "w-auto rounded-md border border-border bg-surface-elevated px-3 py-[6px] text-xs font-medium text-text-default hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

/** 우선순위 세그먼트의 막대 아이콘. PriorityPickerPopover 트리거와 같은 막대 높이 규칙을, 선택 중인
 * 값 하나가 아니라 각 우선순위 고유의 "서명" 아이콘으로 고정해 세그먼트마다 보여준다. */
const PriorityBars = ({ priority }: { priority: TasksRow["priority"] }) => {
  const activeIndex = PRIORITY_ORDER.indexOf(priority);
  const heights = [6, 9, 12];

  return (
    <span className="flex items-end gap-[2px]">
      {heights.map((height, index) => (
        <span
          key={height}
          className="w-[3px] rounded-[1px]"
          style={{
            height,
            backgroundColor: index <= activeIndex ? PRIORITY_META[priority].color : "#E5E7EB",
          }}
        />
      ))}
    </span>
  );
};

interface KanbanFiltersProps {
  filter: KanbanFilterState;
  profiles: ProfilesRow[];
  onFilterChange: (filter: KanbanFilterState) => void;
}

const KanbanFilters = ({ filter, profiles, onFilterChange }: KanbanFiltersProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ProfilePickerPopover
        clearLabel="전체"
        placeholder="담당자: 전체"
        profiles={profiles}
        selectedId={filter.assigneeId}
        triggerClassName={TRIGGER_CLASSNAME}
        onSelect={(assigneeId) => onFilterChange({ ...filter, assigneeId })}
      />

      <ProfilePickerPopover
        clearLabel="전체"
        placeholder="보고자: 전체"
        profiles={profiles}
        selectedId={filter.reporterId}
        triggerClassName={TRIGGER_CLASSNAME}
        onSelect={(reporterId) => onFilterChange({ ...filter, reporterId })}
      />

      <div
        aria-label="우선순위 필터"
        role="group"
        className="flex items-center gap-0.5 rounded-md border border-border bg-surface-elevated p-0.5"
      >
        <button
          aria-pressed={filter.priority === null}
          className={cn(
            "rounded px-2 py-1 text-xs font-medium text-text-muted transition hover:text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            filter.priority === null && "bg-primary/10 font-semibold text-primary"
          )}
          type="button"
          onClick={() => onFilterChange({ ...filter, priority: null })}
        >
          전체
        </button>
        {PRIORITY_ORDER.map((priority) => (
          <button
            key={priority}
            aria-pressed={filter.priority === priority}
            className={cn(
              "flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-text-muted transition hover:text-text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              filter.priority === priority && "bg-primary/10 font-semibold text-primary"
            )}
            type="button"
            onClick={() => onFilterChange({ ...filter, priority })}
          >
            <PriorityBars priority={priority} />
            {PRIORITY_META[priority].label}
          </button>
        ))}
      </div>

      <button
        aria-pressed={filter.onlyMine}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-3 py-[6px] text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          filter.onlyMine
            ? "bg-primary/10 border-primary text-primary"
            : "border-border text-text-muted"
        )}
        type="button"
        onClick={() => onFilterChange({ ...filter, onlyMine: !filter.onlyMine })}
      >
        <User aria-hidden className="size-3.5" />내 일정만 보기
      </button>
    </div>
  );
};

export default KanbanFilters;
