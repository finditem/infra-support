import { Icon } from "@/components";
import { cn } from "@/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav aria-label="에러 로그 페이지 이동" className="gap-4 py-6 flex-center">
      <PaginationNavButton
        disabled={isFirstPage}
        iconName="arrowLeft"
        label="이전"
        onClick={() => onPageChange(currentPage - 1)}
      />

      <ul className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <li key={page}>
            <button
              aria-current={page === currentPage ? "page" : undefined}
              className={cn(
                "typo-body2-bold h-8 w-8 rounded-[8px] tabular-nums flex-center",
                page === currentPage ? "bg-[#E3FCEE] text-[#0AA874]" : "text-[#1D1D1D]/40"
              )}
              type="button"
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}
      </ul>

      <PaginationNavButton
        disabled={isLastPage}
        iconName="arrowRight"
        label="다음"
        onClick={() => onPageChange(currentPage + 1)}
      />
    </nav>
  );
};

export default Pagination;

interface PaginationNavButtonProps {
  disabled: boolean;
  iconName: "arrowLeft" | "arrowRight";
  label: string;
  onClick: () => void;
}

const PaginationNavButton = ({ disabled, iconName, label, onClick }: PaginationNavButtonProps) => {
  return (
    <button
      className={cn(
        "typo-body2-medium gap-2 rounded-[12px] border border-border-divider-default px-2 py-2 flex-center",
        disabled ? "text-fg-neutural-inversed-default" : "text-[#1D1D1D]/60"
      )}
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {iconName === "arrowLeft" && <Icon className="-mr-1.5" name={iconName} size={16} />}
      {label}
      {iconName === "arrowRight" && <Icon className="-ml-1.5" name={iconName} size={16} />}
    </button>
  );
};
