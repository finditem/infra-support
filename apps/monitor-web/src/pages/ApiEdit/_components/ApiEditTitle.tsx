import ApiEditSaveButton from "./ApiEditSaveButton";

const ApiEditTitle = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <p className="typo-header2-bold text-layout-header">Kakao Map API 정보 수정</p>
        <p className="typo-body2-regular text-fg-neutural-inversed-entered">
          모니터링 목록과 상세 페이지에 노출되는 정보를 수정합니다.
        </p>
      </div>
      <ApiEditSaveButton />
    </div>
  );
};

export default ApiEditTitle;
