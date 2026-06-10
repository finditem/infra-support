import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/utils";
import ClearButton from "../buttons/ClearButton";
import { Icon } from "@/components";

/**
 * URL 쿼리스트링 기반 검색 입력 컴포넌트의 props
 *
 * @remarks
 * - 검색 트리거(엔터 키 또는 버튼 클릭) 시 `paramKey`에 해당하는 쿼리스트링을 업데이트합니다.
 * - 빈 값으로 검색하면 쿼리스트링을 제거합니다.
 * - 현재 쿼리스트링과 동일한 값으로 검색하면 URL을 업데이트하지 않습니다.
 *
 * @author jikwon
 */

interface SearchInputProps {
  /** URL 쿼리스트링 키 (default: 'q') */
  paramKey?: string;
  /** input 플레이스홀더 텍스트 (default: "검색어를 입력해 주세요.") */
  placeholder?: string;
  /** 입력 최대 글자 수 (default: 30) */
  maxLength?: number;
  /** form 요소에 추가할 스타일 클래스 */
  className?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * @example
 * // 기본 사용 — URL: ?q=검색어
 * <SearchInput placeholder="검색어를 입력하세요" />
 *
 * // 커스텀 쿼리 키 — URL: ?keyword=검색어
 * <SearchInput paramKey="keyword" placeholder="검색어를 입력하세요" />
 */

const SearchInput = ({
  paramKey = "q",
  placeholder = "검색어를 입력해 주세요.",
  maxLength = 30,
  className,
  disabled,
}: SearchInputProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentQuery = searchParams.get(paramKey) ?? "";
  const [value, setValue] = useState(currentQuery);

  useEffect(() => {
    setValue(currentQuery);
  }, [currentQuery]);

  const handleSearch = () => {
    if (value === currentQuery) return;

    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(paramKey);
    } else {
      next.set(paramKey, value);
    }
    setSearchParams(next);
  };

  return (
    <form
      role="search"
      className={cn("flex items-center gap-2", className)}
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      <div className="relative flex items-center">
        <input
          aria-label="검색어"
          className={cn(
            "typo-body1-regular w-[518px] bg-white py-5 pl-[46px] pr-4",
            "rounded-[10px] border border-border-neutural-normal-default",
            "disabled:cursor-not-allowed disabled:bg-fill-neutural-subtle-disabled disabled:text-fg-neutural-disabled"
          )}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <button
          aria-label="검색"
          className={cn(
            "absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center",
            "text-border-primary-normal-default disabled:text-border-primary-normal-disabled"
          )}
          disabled={disabled}
          type="submit"
        >
          <Icon name="search" size={24} />
        </button>

        {value && !disabled && (
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center">
            <ClearButton onClick={() => setValue("")} />
          </div>
        )}
      </div>
    </form>
  );
};

export default SearchInput;
