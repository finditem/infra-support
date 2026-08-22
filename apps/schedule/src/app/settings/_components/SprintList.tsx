"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import DatePickerPopover from "@/app/_components/TaskCreateModal/DatePickerPopover";
import { createSprint, deleteSprint, updateSprint } from "../_lib/actions";
import type { SprintsRow } from "@/types/tables";

interface SprintListProps {
  sprints: SprintsRow[];
}

const inputClassName =
  "rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-default outline-none transition focus:border-primary";

const getToday = () => format(new Date(), "yyyy-MM-dd");

const SprintList = ({ sprints }: SprintListProps) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(getToday);
  const [endDate, setEndDate] = useState(getToday);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim() !== "" && startDate <= endDate && !submitting;
  const canSaveEdit = editName.trim() !== "" && editStartDate <= editEndDate;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    const created = await createSprint({ name: name.trim(), startDate, endDate });
    setSubmitting(false);

    if (!created) {
      setError("스프린트 추가에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    setError(null);
    setName("");
    setStartDate(getToday());
    setEndDate(getToday());
    router.refresh();
  };

  const startEdit = (sprint: SprintsRow) => {
    setEditingId(sprint.id);
    setEditName(sprint.name);
    setEditStartDate(sprint.start_date);
    setEditEndDate(sprint.end_date);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !canSaveEdit) return;

    const updated = await updateSprint({
      id: editingId,
      name: editName.trim(),
      startDate: editStartDate,
      endDate: editEndDate,
    });

    if (!updated) {
      setError("스프린트 수정에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    setError(null);
    setEditingId(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    const deleted = await deleteSprint(id);

    if (!deleted) {
      setError("스프린트 삭제에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    setError(null);
    setPendingDeleteId(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      <form className="flex flex-wrap items-center gap-2" onSubmit={handleSubmit}>
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
        <DatePickerPopover
          label="시작일"
          labelClassName="w-auto"
          triggerClassName="w-auto gap-1"
          value={startDate}
          onChange={setStartDate}
        />
        <span className="text-text-muted">~</span>
        <DatePickerPopover
          label="종료일"
          labelClassName="w-auto"
          triggerClassName="w-auto gap-1"
          value={endDate}
          onChange={setEndDate}
        />
      </form>

      {error && <p className="text-xs text-fg-state-error">{error}</p>}

      {sprints.length === 0 ? (
        <p className="text-sm text-text-muted">등록된 스프린트가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sprints.map((sprint) => {
            if (editingId === sprint.id) {
              return (
                <li
                  key={sprint.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-primary bg-surface-elevated px-4 py-2.5"
                >
                  <input
                    className={inputClassName}
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                  />
                  <DatePickerPopover
                    label="시작일"
                    labelClassName="w-auto"
                    triggerClassName="w-auto gap-1"
                    value={editStartDate}
                    onChange={setEditStartDate}
                  />
                  <span className="text-text-muted">~</span>
                  <DatePickerPopover
                    label="종료일"
                    labelClassName="w-auto"
                    triggerClassName="w-auto gap-1"
                    value={editEndDate}
                    onChange={setEditEndDate}
                  />
                  <button
                    className="ml-auto rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-fill-neutural-subtle-hover disabled:opacity-50"
                    disabled={!canSaveEdit}
                    type="button"
                    onClick={() => void handleSaveEdit()}
                  >
                    저장
                  </button>
                  <button
                    className="rounded-md px-2 py-1 text-xs font-medium text-text-muted hover:bg-fill-neutural-subtle-hover"
                    type="button"
                    onClick={() => setEditingId(null)}
                  >
                    취소
                  </button>
                </li>
              );
            }

            if (pendingDeleteId === sprint.id) {
              return (
                <li
                  key={sprint.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-elevated px-4 py-2.5"
                >
                  <span className="text-sm text-text-default">삭제할까요?</span>
                  <div className="flex items-center gap-1">
                    <button
                      className="rounded-md px-2 py-1 text-xs font-medium text-fg-state-error hover:bg-fill-neutural-subtle-hover"
                      type="button"
                      onClick={() => void handleDelete(sprint.id)}
                    >
                      삭제
                    </button>
                    <button
                      className="rounded-md px-2 py-1 text-xs font-medium text-text-muted hover:bg-fill-neutural-subtle-hover"
                      type="button"
                      onClick={() => setPendingDeleteId(null)}
                    >
                      취소
                    </button>
                  </div>
                </li>
              );
            }

            return (
              <li
                key={sprint.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface-elevated px-4 py-2.5"
              >
                <span className="text-sm font-medium text-text-default">{sprint.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted">
                    {format(new Date(sprint.start_date), "M/d")} ~{" "}
                    {format(new Date(sprint.end_date), "M/d")}
                  </span>
                  <button
                    aria-label="스프린트 수정"
                    className="flex size-6 items-center justify-center rounded-md text-text-muted hover:bg-fill-neutural-subtle-hover"
                    type="button"
                    onClick={() => startEdit(sprint)}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    aria-label="스프린트 삭제"
                    className="flex size-6 items-center justify-center rounded-md text-text-muted hover:bg-fill-neutural-subtle-hover"
                    type="button"
                    onClick={() => setPendingDeleteId(sprint.id)}
                  >
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SprintList;
