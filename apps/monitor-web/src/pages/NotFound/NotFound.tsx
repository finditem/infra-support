import { useNavigate } from "react-router-dom";
import { BasicButton, Icon } from "@/components";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="-m-8 size-[calc(100%+64px)] bg-gradient-to-b from-[#F0F9F6] to-[#F4F5F7] flex-center">
      <div className="flex flex-col items-center space-y-12">
        <div className="gap-9 flex-col-center">
          <Icon height={250} name="notFound" width={584} />
          <h1 className="typo-header1-medium text-layout-header">
            존재하지 않는 API ID로 접근했습니다.
          </h1>
        </div>

        <BasicButton className="h-[56px] w-[150px] px-[25px] py-4" onClick={handleGoHome}>
          <span className="flex items-center gap-1">
            <Icon name="leftArrow" size={22} />
            <span className="typo-header4-bold">돌아가기</span>
          </span>
        </BasicButton>
      </div>
    </div>
  );
};

export default NotFound;
