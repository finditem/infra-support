"use client";

import { useState } from "react";
import { cn } from "@/utils";
import ProfileAvatar from "../../_components/ProfileAvatar";
import PropertyPopover from "../../_components/TaskCreateModal/PropertyPopover";
import { filterMentionTargets, getMentionKey, getMentionLabel } from "../../_lib/mentions";
import type { MentionTarget } from "../../_lib/mentions";

/** 트리거에 이름을 그대로 늘어놓을 최대 인원. 넘으면 "외 N명"으로 줄인다. */
const MAX_VISIBLE_NAMES = 2;

const getTriggerLabel = (selectedTargets: MentionTarget[]) => {
  const names = selectedTargets.map(getMentionLabel);

  if (names.length <= MAX_VISIBLE_NAMES) return names.join(", ");

  return `${names[0]} 외 ${names.length - 1}명`;
};

interface AvailabilityTargetPickerProps {
  /** 고를 수 있는 팀과 팀원. buildMentionTargets가 만든 목록을 그대로 쓴다. */
  targets: MentionTarget[];
  selectedTargets: MentionTarget[];
  onChange: (targets: MentionTarget[]) => void;
}

/**
 * 가능 시간을 등록할 대상을 고르는 다중 선택 팝오버.
 * 팀을 고르면 그 자리에서는 팀 한 줄로 보이고, 등록 시점에 소속 팀원으로 펼쳐진다
 * (`resolveMentionProfiles`). 언급 기능과 같은 후보 목록을 쓰므로 팀/개인 판정도 그쪽 규칙을 따른다.
 */
const AvailabilityTargetPicker = ({
  targets,
  selectedTargets,
  onChange,
}: AvailabilityTargetPickerProps) => {
  const [query, setQuery] = useState("");
  const filtered = filterMentionTargets(targets, query);
  const selectedKeys = new Set(selectedTargets.map(getMentionKey));

  const toggleTarget = (target: MentionTarget) => {
    const key = getMentionKey(target);

    onChange(
      selectedKeys.has(key)
        ? selectedTargets.filter((selected) => getMentionKey(selected) !== key)
        : [...selectedTargets, target]
    );
  };

  return (
    <PropertyPopover
      label="대상"
      panelClassName="w-60"
      trigger={
        selectedTargets.length === 0 ? (
          <span className="text-xs text-text-muted">팀원 선택</span>
        ) : (
          <span className="truncate text-xs text-text-default">
            {getTriggerLabel(selectedTargets)}
          </span>
        )
      }
      triggerClassName="border border-border"
    >
      {() => (
        <div className="flex flex-col gap-1">
          <input
            className="mb-1 w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-default outline-none"
            autoFocus
            placeholder="팀 또는 이름으로 검색"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          {filtered.length === 0 && (
            <p className="px-2 py-1.5 text-xs text-text-muted">해당하는 팀이나 팀원이 없습니다.</p>
          )}

          <div className="flex max-h-52 flex-col gap-1 overflow-y-auto">
            {filtered.map((target) => {
              const isSelected = selectedKeys.has(getMentionKey(target));

              return (
                <button
                  key={getMentionKey(target)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-text-default hover:bg-fill-neutural-subtle-hover",
                    isSelected && "bg-fill-neutural-subtle-hover"
                  )}
                  type="button"
                  onClick={() => toggleTarget(target)}
                >
                  {target.kind === "team" ? (
                    <span
                      className="size-4 shrink-0 rounded-full"
                      style={{ backgroundColor: target.team.color }}
                    />
                  ) : (
                    <ProfileAvatar profile={target.profile} size="sm" />
                  )}

                  <span className="truncate">{getMentionLabel(target)}</span>

                  {target.kind === "team" && (
                    <span className="shrink-0 text-text-muted">{target.team.members.length}명</span>
                  )}

                  {isSelected && <span className="ml-auto shrink-0 text-primary">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </PropertyPopover>
  );
};

export default AvailabilityTargetPicker;
