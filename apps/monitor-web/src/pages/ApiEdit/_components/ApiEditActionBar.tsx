import { BasicButton } from "@/components";
import ApiEditSaveButton from "./ApiEditSaveButton";

interface ApiEditActionBarProps {
  /** 저장 가능한 상태인지 여부 */
  canSave: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const ApiEditActionBar = ({ canSave, isSaving, onSave, onCancel }: ApiEditActionBarProps) => {
  return (
    <div className="-mb-6 mt-6 flex h-[72px] items-center justify-between border-b border-[#E2E8F0] bg-white px-8 shadow-[0px_0px_1px_rgba(0,0,0,0.08),0px_2px_2px_rgba(0,0,0,0.12)]">
      <p className="typo-body1-regular text-layout-body">변경 내용이 없으면 저장할수 없어요.</p>

      <div className="flex items-center gap-3">
        <BasicButton
          className="min-h-[44px] min-w-[92px] border border-[#DFDFDF] bg-white py-2 text-layout-header"
          disabled={isSaving}
          onClick={onCancel}
        >
          <span className="typo-header4-medium">취소</span>
        </BasicButton>
        <ApiEditSaveButton disabled={!canSave} isPending={isSaving} onClick={onSave} />
      </div>
    </div>
  );
};

export default ApiEditActionBar;
