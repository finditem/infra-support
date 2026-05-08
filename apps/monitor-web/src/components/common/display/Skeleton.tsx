import { cn } from "@/utils";

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const ROUNDED_CLASS_MAP = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
} as const;

const Skeleton = ({ className, rounded = "md" }: SkeletonProps) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "skeleton-shimmer pointer-events-none select-none bg-slate-200/70",
        ROUNDED_CLASS_MAP[rounded],
        className
      )}
    />
  );
};

export default Skeleton;
