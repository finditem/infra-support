import { CheckboxButton } from "../buttons";
import {
  CHIP_ACTIVE_STYLE,
  CHIP_BASE_STYLE,
  CHIP_INACTIVE_STYLE,
} from "./_internal/chip.constants";
import { cn } from "@/utils";

interface ChipProps {
  label: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Chip = ({ label, checked = false, onCheckedChange, disabled, className }: ChipProps) => {
  return (
    <CheckboxButton
      className={cn(
        CHIP_BASE_STYLE,
        checked ? CHIP_ACTIVE_STYLE : CHIP_INACTIVE_STYLE,
        // disabled && CHIP_DISABLED_STYLE,
        className
      )}
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
    >
      {label}
    </CheckboxButton>
  );
};

export default Chip;
