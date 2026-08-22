"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSprint } from "../_lib/actions";
import type { SprintsRow } from "@/types/tables";

interface SprintListProps {
  sprints: SprintsRow[];
}

const inputClassName =
  "rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-default outline-none transition focus:border-primary";

const SprintList = ({ sprints }: SprintListProps) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim() !== "" && startDate !== "" && endDate !== "" && !submitting;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    await createSprint({ name: name.trim(), startDate, endDate });
    setSubmitting(false);
    setName("");
    setStartDate("");
    setEndDate("");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <button
          aria-label="스프린트 추가"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-elevated text-text-muted hover:bg-fill-neutural-subtle-hover disabled:opacity-50"
          disabled={!canSubmit}
          type="submit"
        >
          <Plus size={16} />
        </button>
        <input
          className={inputClassName}
          placeholder="예: 1차 스프린트"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          className={inputClassName}
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
        <span className="text-text-muted">~</span>
        <input
          className={inputClassName}
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </form>

      {sprints.length === 0 ? (
        <p className="text-sm text-text-muted">등록된 스프린트가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sprints.map((sprint) => (
            <li
              key={sprint.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-elevated px-4 py-2.5"
            >
              <span className="text-sm font-medium text-text-default">{sprint.name}</span>
              <span className="text-xs text-text-muted">
                {format(new Date(sprint.start_date), "M/d")} ~{" "}
                {format(new Date(sprint.end_date), "M/d")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SprintList;
