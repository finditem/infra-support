import { BasicButton, Icon } from "@/components";

const ApiEditTitle = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <p className="typo-header2-bold text-layout-header">Kakao Map API 정보 수정</p>
        <p className="typo-body2-regular text-fg-neutural-inversed-entered">
          모니터링 목록과 상세 페이지에 노출되는 정보를 수정합니다.
        </p>
      </div>
      <BasicButton className="min-h-[56px] min-w-[247px] border border-border-neutural-normal-default bg-white py-4 text-[#ACACAC]">
        <span className="flex items-center gap-2">
          <Icon name="save" size={20} />
          <span className="typo-header4-semibold">저장</span>
        </span>
      </BasicButton>
    </div>
  );
};

export default ApiEditTitle;
