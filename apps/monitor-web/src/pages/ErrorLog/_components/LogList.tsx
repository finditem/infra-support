import type { LogListData } from "../_types";
import { Badge } from "@/components";
import LogListItem from "./LogListItem";
import { MOCK_ERROR_LOG_ITEMS } from "@/mock";
import { LOG_LIST_FILTERS, type LogListFilterKey } from "../_constants/";

interface LogListProps {
  data: LogListData;
}

const LogList = ({ data }: LogListProps) => {
  const selectedFilter: LogListFilterKey = "all";

  const countByKey: Record<LogListFilterKey, number> = {
    all: data.total,
    unchecked: data.unChecked,
    checked: data.checked,
  };

  return (
    <section className="mt-3 flex h-full flex-col rounded-xl border border-[#DFDFDF] bg-white">
      <div
        aria-label="에러 로그 상태 필터"
        role="group"
        className="flex items-center gap-6 px-12 py-8"
      >
        {LOG_LIST_FILTERS.map((filter) => (
          <LogListFilterButton
            key={filter.key}
            isActive={selectedFilter === filter.key}
            label={filter.label}
            value={countByKey[filter.key]}
            onClick={() => {}}
          />
        ))}
      </div>

      <LogListHeader />

      <ul className="flex-1 pb-6">
        {MOCK_ERROR_LOG_ITEMS.map((item) => (
          <LogListItem key={item.id} data={item} />
        ))}
      </ul>
    </section>
  );
};

export default LogList;

interface LogListFilterButtonProps {
  label: string;
  value: number;
  isActive: boolean;
  onClick: () => void;
}

const LogListFilterButton = ({ label, value, isActive, onClick }: LogListFilterButtonProps) => {
  return (
    <button
      aria-pressed={isActive}
      className="flex items-center gap-2 py-3"
      type="button"
      onClick={onClick}
    >
      <span className="text-header3-bold">{label}</span>
      <Badge
        className="border-transparent bg-[#E3FCEE] px-[6px] py-1 font-bold leading-6 text-[#0AA874] [font-size:20px]"
        label={value}
      />
    </button>
  );
};

const LogListHeader = () => {
  return (
    <div className="text-body2-bold flex items-center justify-between bg-[#F9F9F9] px-12 py-6 text-[#858585]">
      <span>API 정보</span>
      <div className="flex items-center gap-6 text-center">
        <span className="w-[223px]">발생 시간</span>
        <span className="w-[90px]">상태</span>
      </div>
    </div>
  );
};
