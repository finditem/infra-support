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
  // 스크롤 컨테이너는 App.tsx의 main이고 p-6(하단 패딩 24px)을 갖는다.
  // -mb-6으로 그 패딩을 상쇄하고 -bottom-6으로 sticky 고정 위치를 같은 값만큼 내려야 바가 바닥에 밀착한다.
  // 실측 기준 바 하단 = 뷰포트 하단 - bottom - 24px 이므로 bottom이 -24px일 때 gap이 0이 된다.
  return (
    <div className="sticky -bottom-6 z-10 -mb-6 mt-6 flex h-[72px] items-center justify-between border-b border-[#E2E8F0] bg-white px-8 shadow-[0px_0px_1px_rgba(0,0,0,0.08),0px_2px_2px_rgba(0,0,0,0.12)]">
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
