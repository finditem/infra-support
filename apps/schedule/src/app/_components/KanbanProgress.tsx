import { getInitial } from "../_lib/kanbanUtils";
import type { KanbanProgressEntry } from "../_types/kanban";

interface KanbanProgressProps {
  progress: KanbanProgressEntry[];
}

const KanbanProgress = ({ progress }: KanbanProgressProps) => {
  if (progress.length === 0) {
    return <p className="text-xs text-text-muted">아직 등록된 팀원이 없습니다.</p>;
  }

  return (
    <div className="flex flex-wrap gap-6">
      {progress.map(({ profile, percent }) => (
        <div key={profile.id} className="flex min-w-[180px] items-center gap-2">
          <span
            className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${profile.colorClassName}`}
          >
            {getInitial(profile.name)}
          </span>
          <span className="shrink-0 text-xs font-medium text-text-default">{profile.name}</span>
          <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-fill-neutural-subtle-default">
            <div
              className={`h-full rounded-full ${profile.colorClassName}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="shrink-0 text-xs text-text-muted">{percent}%</span>
        </div>
      ))}
    </div>
  );
};

export default KanbanProgress;
