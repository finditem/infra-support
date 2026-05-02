import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils";
import LoadingSpinner from "../LoadingSpinner";
import {
  BASE_STYLES,
  LOADING_SPINNER_SIZE,
  SIZE_STYLES,
  VARIANT_STYLES,
  Size,
} from "./constantButton";

type Variant = "solid" | "outlined" | "inversed" | "auth";
type Hierarchy = "normal" | "subtle";

interface BasicButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode;
  loading?: boolean;
  variant?: Variant;
  hierarchy?: Hierarchy;
  size?: Size;
}

const BasicButton = ({
  children,
  className,
  type = "button",
  disabled = false,
  loading = false,
  size = "medium",
  variant = "solid",
  hierarchy = "normal",
  ...props
}: BasicButtonProps) => {
  const variantClass =
    variant === "solid" ? VARIANT_STYLES.solid[hierarchy] : VARIANT_STYLES[variant].base;

  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={cn(BASE_STYLES, SIZE_STYLES[size], variantClass, className)}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? <LoadingSpinner size={LOADING_SPINNER_SIZE[size]} /> : children}
    </button>
  );
};

export default BasicButton;
