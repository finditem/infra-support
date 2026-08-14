import { BasicButton, Icon } from "@/components";
import { cn } from "@/utils";

interface ApiEditSaveButtonProps {
  className?: string;
}

const ApiEditSaveButton = ({ className }: ApiEditSaveButtonProps) => {
  return (
    <BasicButton
      className={cn(
        "min-h-[44px] min-w-[180px] border border-border-neutural-normal-default bg-white py-2 text-[#ACACAC]",
        className
      )}
      disabled
    >
      <span className="flex items-center gap-2">
        <Icon name="save" size={18} />
        <span className="typo-header4-semibold">저장</span>
      </span>
    </BasicButton>
  );
};

export default ApiEditSaveButton;
