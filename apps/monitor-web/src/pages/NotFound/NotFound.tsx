import { useNavigate } from "react-router-dom";
import { BasicButton, Icon } from "@/components";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="-m-8 size-[calc(100%+64px)] bg-gradient-to-b from-[#F0F9F6] to-[#F4F5F7] flex-center">
      <div className="flex flex-col items-center gap-9">
        <div className="gap-6 flex-col-center">
          <Icon height={250} name="notFound" width={584} />
          <h1 className="typo-header1-medium text-layout-header">
            요청하신 페이지를 찾을 수 없습니다.
          </h1>
        </div>

        <BasicButton className="h-[56px] px-[30px] py-4" onClick={handleGoHome}>
          <span className="flex items-center gap-1">
            <Icon name="arrowLeft" size={22} />
            <span className="typo-header4-bold">메인 페이지로 이동</span>
          </span>
        </BasicButton>
      </div>
    </div>
  );
};

export default NotFound;
