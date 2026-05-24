import { CheckboxButton, Badge } from "@/components";
import type { LogListItemData } from "../_types";
import { cn } from "@/utils";

interface LogListItemProps {
  data: LogListItemData;
}

const LogListItem = ({ data }: LogListItemProps) => {
  return (
    <li className="flex items-center justify-between border-b border-[#1D1D1D]/10 px-12 py-6">
      <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-2">
        <div className="flex items-center gap-3">
          <span className="typo-header3-bold">{data.apiName}</span>
          <Badge
            className="shrink-0 border-[#FF3030] bg-white px-2 text-[12px] font-bold leading-6 text-[#FF3030]"
            label={data.errorType}
          />
        </div>
        <span className="typo-body2-medium block w-full truncate text-[#858585]">
          {data.errorMessage}
        </span>
      </div>
      <div className="flex items-center gap-6">
        <span className="typo-body2-medium text-[#858585]">{data.occurredAt}</span>
        <CheckboxButton
          className={cn(
            "typo-body2-semibold rounded-full border px-[17px] py-[3px]",
            data.status
              ? "border-transparent bg-[#E3FCEE] text-[#0AA874]"
              : "border-transparent bg-[#FFECEC] text-[#FF6363]"
          )}
          checked={data.status}
          disabled
          iconClassName={cn(
            data.status ? "group-disabled:border-[#0AA874]" : "group-disabled:border-[#FF6363]"
          )}
          size="sm"
        >
          {data.status ? "확인완료" : "확인전"}
        </CheckboxButton>
      </div>
    </li>
  );
};

export default LogListItem;
