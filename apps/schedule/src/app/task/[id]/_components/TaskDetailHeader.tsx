import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ProjectKey } from "@/app/_lib/projects";

interface TaskDetailHeaderProps {
  title: string;
  /** 이 일정이 속한 프로젝트. 목록으로 돌아갈 때 기본 프로젝트가 아니라 원래 보드로 보낸다. */
  projectKey: ProjectKey;
}

const TaskDetailHeader = ({ title, projectKey }: TaskDetailHeaderProps) => {
  return (
    <header className="flex items-center gap-4 border-b border-border bg-surface-elevated px-4 py-5 sm:px-8">
      <Link
        className="flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text-default"
        href={`/project/${projectKey}`}
      >
        <ArrowLeft aria-hidden className="size-4" />
        목록으로
      </Link>
      <h1 className="text-lg font-semibold text-text-default">{title}</h1>
    </header>
  );
};

export default TaskDetailHeader;
