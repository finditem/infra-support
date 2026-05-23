import { Chip, Badge } from "@/components";
import type { LogListItemData } from "../_types";

interface LogListItemProps {
  data: LogListItemData;
}

const LogListItem = ({ data }: LogListItemProps) => {
  return (
    <li className="flex items-center justify-between border-b border-[#1D1D1D/10] px-12 py-6">
      <div className="flex flex-col items-start justify-center gap-2">
        <div className="flex items-center gap-3">
          <span className="typo-header3-bold">{data.apiName}</span>
          <Badge
            className="border-[#FF3030] bg-white px-2 text-[12px] font-bold leading-6 text-[#FF3030]"
            label={data.errorType}
          />
        </div>
        <span className="typo-body2-medium text-[#858585]">{data.errorMessage}</span>
      </div>
      <div className="flex items-center gap-6">
        <span className="typo-body2-medium text-[#858585]">{data.occurredAt}</span>
        <Chip checked={data.status} label={data.status ? "확인완료" : "확인전"} size="sm" />
      </div>
    </li>
  );
};

export default LogListItem;
