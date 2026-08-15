import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components";
import { cn } from "@/utils";

interface ApiSourceSelectProps {
  id: string;
  /** 현재 선택된 출처 */
  value: string;
  /** 선택할 수 있는 출처 목록 */
  sources: string[];
  errorMessage?: string;
  onChange: (source: string) => void;
}

const PLACEHOLDER = "출처를 선택해 주세요.";

const ApiSourceSelect = ({ id, value, sources, errorMessage, onChange }: ApiSourceSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 목록 바깥을 누르면 닫는다. 목록이 열려 있을 때만 리스너를 건다.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const handleSelect = (source: string) => {
    onChange(source);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={!!errorMessage}
        className={cn(
          "flex w-full items-center justify-between rounded-[10px] border border-border-neutural-normal-default bg-white px-[17px] py-[21px]",
          errorMessage && "border-error"
        )}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span
          className={cn(
            "typo-header4-semibold",
            value ? "text-fg-neutural-default" : "text-fg-neutural-placeholder"
          )}
        >
          {value || PLACEHOLDER}
        </span>
        <Icon name="chevronDown" size={20} />
      </button>

      {isOpen && (
        <ul
          aria-labelledby={id}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 max-h-[240px] overflow-y-auto rounded-[10px] border border-border-neutural-normal-default bg-white py-2 shadow-[0px_4px_20px_-4px_rgba(0,0,0,0.1)]"
        >
          {sources.length === 0 && (
            <li className="typo-body1-regular px-[17px] py-3 text-layout-body">
              선택할 수 있는 출처가 없습니다.
            </li>
          )}

          {sources.map((source) => (
            <li key={source} aria-selected={source === value} role="option">
              <button
                className={cn(
                  "typo-header4-semibold w-full px-[17px] py-3 text-left text-fg-neutural-default transition-colors hover:bg-fill-neutural-subtle-hover",
                  source === value && "bg-fill-neutural-subtle-hover"
                )}
                type="button"
                onClick={() => handleSelect(source)}
              >
                {source}
              </button>
            </li>
          ))}
        </ul>
      )}

      {errorMessage && <p className="typo-body1-regular mt-2 text-error">{errorMessage}</p>}
    </div>
  );
};

export default ApiSourceSelect;
