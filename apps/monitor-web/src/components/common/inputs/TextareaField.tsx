import { useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils";

/**
 * 여러 줄의 텍스트를 입력받는 텍스트 영역 컴포넌트입니다.
 *
 * @remarks
 * - `label`과 `error` 메시지를 함께 렌더링할 수 있습니다.
 * - 내부적으로 `useId`를 사용하여 `label`과 `textarea`를 연결합니다.
 *
 * @author jikwon
 */

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 텍스트 영역 상단에 표시할 레이블 */
  label?: string;
  /** 에러 상태일 때 표시할 에러 메시지 */
  errorMessage?: string;
}

/**
 * @example
 * ```tsx
 * // 기본 사용
 * <TextareaField label="설명" placeholder="상세 내용을 입력하세요" />
 *
 * // 에러 표시
 * <TextareaField label="내용" error="필수 입력 항목입니다." />
 * ```
 */

const TextareaField = ({ className, label, errorMessage, id, ...props }: TextareaFieldProps) => {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label className="text-sm text-gray-700" htmlFor={textareaId}>
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        aria-describedby={errorMessage ? errorId : undefined}
        aria-invalid={!!errorMessage}
        className={cn(
          "w-full rounded-md border border-gray-300 px-3 py-2 text-sm",
          "placeholder:text-gray-400",
          "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
          errorMessage && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />

      {errorMessage && (
        <p id={errorId} className="text-sm text-red-500">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default TextareaField;
