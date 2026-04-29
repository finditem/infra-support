import type { ButtonHTMLAttributes, ReactNode } from "react";
import Icon from "./Icon";
import { cn } from "@/utils";

interface CheckboxProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  children?: ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

const Checkbox = ({
  checked = false,
  onCheckedChange,
  size = "md",
  className,
  children,
  ...props
}: CheckboxProps) => {
  return (
    <button
      className={cn("flex cursor-pointer items-center gap-2", className)}
      type="button"
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <Icon
        className={checked ? "text-green-500" : "text-gray-300"}
        name="check"
        size={SIZE_MAP[size]}
      />
      {children}
    </button>
  );
};

export default Checkbox;
