import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TaskDetailHeaderProps {
  title: string;
}

const TaskDetailHeader = ({ title }: TaskDetailHeaderProps) => {
  return (
    <header className="flex items-center gap-4 border-b border-border bg-surface-elevated px-4 py-5 sm:px-8">
      <Link
        className="flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text-default"
        href="/"
      >
        <ArrowLeft aria-hidden className="size-4" />
        목록으로
      </Link>
      <h1 className="text-lg font-semibold text-text-default">{title}</h1>
    </header>
  );
};

export default TaskDetailHeader;
