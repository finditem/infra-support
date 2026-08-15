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
    <div className="-mb-8 mt-9 flex h-[100px] items-center justify-between border-b border-[#E2E8F0] bg-white px-11 shadow-[0px_0px_1px_rgba(0,0,0,0.08),0px_2px_2px_rgba(0,0,0,0.12)]">
      <p className="typo-body1-regular text-layout-body">변경 내용이 없으면 저장할수 없어요.</p>

      <div className="flex items-center gap-4">
        <BasicButton
          className="min-h-[56px] min-w-[109px] border border-[#DFDFDF] bg-white py-4 text-layout-header"
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
