import { BasicButton } from "@/components";
import ApiEditSaveButton from "./ApiEditSaveButton";

const ApiEditActionBar = () => {
  return (
    <div className="-mb-6 mt-6 flex h-[72px] items-center justify-between border-b border-[#E2E8F0] bg-white px-8 shadow-[0px_0px_1px_rgba(0,0,0,0.08),0px_2px_2px_rgba(0,0,0,0.12)]">
      <p className="typo-body1-regular text-layout-body">변경 내용이 없으면 저장할수 없어요.</p>

      <div className="flex items-center gap-3">
        <BasicButton className="min-h-[44px] min-w-[92px] border border-[#DFDFDF] bg-white py-2 text-layout-header">
          <span className="typo-header4-medium">취소</span>
        </BasicButton>
        <ApiEditSaveButton />
      </div>
    </div>
  );
};

export default ApiEditActionBar;
