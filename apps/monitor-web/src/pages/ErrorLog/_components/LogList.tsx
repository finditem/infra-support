import { useMemo, useState } from "react";
import { Badge } from "@/components";
import LogListItem from "./LogListItem";
import Pagination from "./Pagination";
import { MOCK_ERROR_LOG_ITEMS } from "@/mock";
import { LOG_LIST_FILTERS, LOG_LIST_PAGE_SIZE, type LogListFilterKey } from "../_constants";
import { cn } from "@/utils";
import type { LogListItemData } from "../_types";

const LogList = () => {
  const selectedFilter: LogListFilterKey = "all";
  const [items, setItems] = useState<LogListItemData[]>(MOCK_ERROR_LOG_ITEMS);
  const [currentPage, setCurrentPage] = useState(1);

  const countByKey: Record<LogListFilterKey, number> = useMemo(() => {
    const checkedCount = items.filter((item) => item.status).length;
    const uncheckedCount = items.length - checkedCount;

    return {
      all: items.length,
      unchecked: uncheckedCount,
      checked: checkedCount,
    };
  }, [items]);

  const handleCheckedChange = (itemId: number, checked: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: checked } : item))
    );
  };

  const totalPages = Math.max(1, Math.ceil(items.length / LOG_LIST_PAGE_SIZE));
  const pagedItems = items.slice(
    (currentPage - 1) * LOG_LIST_PAGE_SIZE,
    currentPage * LOG_LIST_PAGE_SIZE
  );

  return (
    <section className="mt-3 flex flex-col rounded-xl border border-[#DFDFDF] bg-white">
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

      <ul>
        {pagedItems.map((item, index) => (
          <LogListItem
            key={item.id}
            data={item}
            isLast={index === pagedItems.length - 1}
            onCheckedChange={(checked) => handleCheckedChange(item.id, checked)}
          />
        ))}
      </ul>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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
      className="typo-header3-bold flex items-center gap-2 py-3"
      type="button"
      onClick={onClick}
    >
      <span className={cn(isActive ? "text-[#1D1D1D]" : "text-[#1D1D1D]/40")}>{label}</span>
      <Badge
        className={cn(
          "border-transparent py-1",
          value < 10 ? "px-[6px]" : "px-[4px]",
          isActive ? "bg-[#E3FCEE] text-[#0AA874]" : "bg-[#F2F2F2] text-[#1D1D1D]/40"
        )}
        label={value}
      />
    </button>
  );
};

const LogListHeader = () => {
  return (
    <div className="typo-body2-bold flex items-center justify-between bg-[#F9F9F9] px-12 py-6 text-[#858585]">
      <span>API 정보</span>
      <div className="flex items-center gap-6 text-center">
        <span className="w-[223px]">발생 시간</span>
        <span className="w-[90px]">상태</span>
      </div>
    </div>
  );
};
