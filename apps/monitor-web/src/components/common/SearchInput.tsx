import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/utils";
import ClearButton from "./ClearButton";

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
  /** 검색 버튼 표시 여부 (default: true) */
  showSearchButton?: boolean;
  /** form 요소에 추가할 스타일 클래스 */
  className?: string;
}

/**
 * @example
 * // 기본 사용 — URL: ?q=검색어
 * <SearchInput placeholder="검색어를 입력하세요" />
 *
 * // 커스텀 쿼리 키 — URL: ?keyword=검색어
 * <SearchInput paramKey="keyword" placeholder="검색어를 입력하세요" />
 *
 * // 검색 버튼 숨기기 — URL: ?q=검색어
 * <SearchInput placeholder="검색어를 입력하세요" showSearchButton={false} />
 */

const SearchInput = ({
  paramKey = "q",
  placeholder = "검색어를 입력해 주세요.",
  maxLength = 30,
  showSearchButton = true,
  className,
}: SearchInputProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentQuery = searchParams.get(paramKey) ?? "";
  const [value, setValue] = useState(currentQuery);

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
          className={cn(
            "border-1 rounded-4 border-gray-300 px-4 py-2 pr-8",
            "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          )}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {value && (
          <div className="absolute right-2">
            <ClearButton onClick={() => setValue("")} />
          </div>
        )}
      </div>
      {showSearchButton && (
        <button
          className="rounded-4 bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          type="submit"
        >
          검색
        </button>
      )}
    </form>
  );
};

export default SearchInput;
