import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils";
import LoadingSpinner from "../LoadingSpinner";

interface BasicButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode;
  loading?: boolean;
}

const BasicButton = ({
  children,
  className,
  type = "button",
  disabled = false,
  loading = false,
  ...props
}: BasicButtonProps) => {
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={cn(className)}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? <LoadingSpinner /> : children}
    </button>
  );
};

export default BasicButton;
