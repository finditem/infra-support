import { BasicButton, Icon } from "@/components";
import { cn } from "@/utils";

interface ApiEditSaveButtonProps {
  className?: string;
  /** 저장 가능한 상태인지 여부. 변경 사항이 없으면 `false`입니다. */
  disabled: boolean;
  /** 저장 요청이 진행 중인지 여부 */
  isPending: boolean;
  onClick: () => void;
}

const ApiEditSaveButton = ({ className, disabled, isPending, onClick }: ApiEditSaveButtonProps) => {
  return (
    <BasicButton
      className={cn(
        "min-h-[44px] min-w-[180px] border border-border-neutural-normal-default bg-white py-2 text-[#ACACAC]",
        !disabled && !isPending && "text-layout-header",
        className
      )}
      disabled={disabled || isPending}
      onClick={onClick}
    >
      <span className="flex items-center gap-2">
        <Icon name="save" size={18} />
        <span className="typo-header4-semibold">{isPending ? "저장 중" : "저장"}</span>
      </span>
    </BasicButton>
  );
};

export default ApiEditSaveButton;
