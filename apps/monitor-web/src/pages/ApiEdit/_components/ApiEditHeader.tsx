import { BasicButton, Icon } from "@/components";
import { Link } from "react-router-dom";

interface ApiEditHeaderProps {
  apiId: string;
  apiName: string;
}

const ApiEditHeader = ({ apiId, apiName }: ApiEditHeaderProps) => {
  return (
    <div className="flex gap-4">
      <BasicButton
        className="min-h-[44px] min-w-[120px] border border-border-neutural-normal-default bg-white py-2 text-[#5D5D5D]"
        as={Link}
        to={`/api/${apiId}`}
      >
        <span className="flex items-center gap-1">
          <Icon name="arrowLeft" size={18} />
          <span className="typo-header4-semibold">이전으로</span>
        </span>
      </BasicButton>
      <div className="flex items-center gap-2">
        <p className="typo-body1-medium text-layout-body">{apiName}</p>
        <Icon name="arrowRight" size={16} />
        <p className="typo-body1-semibold text-layout-header">정보 수정</p>
      </div>
    </div>
  );
};

export default ApiEditHeader;
