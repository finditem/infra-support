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
  /** 도움말 메시지. `errorMessage`가 없을 때만 하단에 표시됩니다. */
  caption?: string;
}

/**
 * @example
 * ```tsx
 * // 기본 사용
 * <TextareaField label="설명" placeholder="상세 내용을 입력하세요" />
 *
 * // 에러 표시
 * <TextareaField label="내용" error="필수 입력 항목입니다." />
 *
 * // 도움말 표시
 * <TextareaField label="내용" caption="최대 1000자까지 입력 가능합니다." />
 * ```
 */

const TextareaField = ({
  className,
  label,
  errorMessage,
  caption,
  id,
  value,
  ...props
}: TextareaFieldProps) => {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;
  const captionId = `${textareaId}-caption`;

  const hasError = !!errorMessage;
  const showCaption = !hasError && !!caption;
  const describedBy = hasError ? errorId : showCaption ? captionId : undefined;

  return (
    <div className="flex w-full flex-col gap-4">
      {label && (
        <label className="typo-header4-regular text-layout-header" htmlFor={textareaId}>
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        aria-describedby={describedBy}
        aria-invalid={hasError}
        className={cn(
          "typo-header4-medium w-full rounded-[10px] border border-border-neutural-normal-default px-4 py-5",
          "placeholder:text-fg-neutural-placeholder",
          "disabled:cursor-not-allowed disabled:bg-fill-neutural-subtle-disabled disabled:text-fg-neutural-disabled",
          "h-[300px] resize-none",
          errorMessage && "border-error focus:border-error",
          className
        )}
        value={value}
        {...props}
      />

      <div className="flex items-center justify-between">
        {errorMessage && (
          <p id={errorId} className="typo-body1-regular text-error">
            {errorMessage}
          </p>
        )}

        {showCaption && (
          <p id={captionId} className="typo-body1-regular text-layout-body">
            {caption}
          </p>
        )}

        <span className="typo-body1-regular ml-auto text-layout-body">
          {String(value ?? "").length}/{props.maxLength ?? 1000}
        </span>
      </div>
    </div>
  );
};

export default TextareaField;
