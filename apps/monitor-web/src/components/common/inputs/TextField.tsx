import { InputHTMLAttributes, useId } from "react";
import { cn } from "@/utils";
import ClearButton from "../buttons/ClearButton";

/**
 * 레이블과 유효성 메시지를 포함한 단일 라인 텍스트 입력 필드
 *
 * @remarks
 * -  `HTMLInputElement`의 모든 native 속성을 그대로 전달할 수 있음.
 * - 접근성을 위해 `id`를 전달하면 label과 aria-describedby가 자동 연결됩니다.
 *
 * @author jikwon
 */

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** input 요소의 id. label 연결 및 aria-describedby에 사용됩니다. */
  id?: string;
  /** input 위에 표시되는 레이블 텍스트 */
  label?: string;
  /** 에러 메시지. 전달 시 에러 스타일이 적용되고 하단에 표시됩니다. */
  errorMessage?: string;
  /** 도움말 메시지. `errorMessage`가 없을 때만 하단에 표시됩니다. */
  caption?: string;
  /** 추가 클래스. input 요소에 적용됩니다. */
  className?: string;
  /** 입력값을 초기화하는 핸들러. 이 함수가 전달되고 값이 존재하면 ClearButton이 노출됩니다. */
  onClear?: () => void;
}

/**
 * @example
 * // 기본 사용
 * <TextField id="email" label="이메일" placeholder="example@email.com" />
 *
 * // 에러 상태
 * <TextField id="email" label="이메일" errorMessage="올바른 이메일을 입력해주세요." />
 *
 * // 도움말
 * <TextField id="email" label="이메일" caption="사용 가능한 이메일입니다." />
 *
 * // 에러, 도움말 동시 전달 — errorMessage가 우선되어 에러 메시지만 표시됩니다.
 * <TextField
 *   id="email"
 *   label="이메일"
 *   errorMessage="올바른 이메일을 입력해주세요."
 *   caption="사용 가능한 이메일입니다."
 * />
 */

const TextField = ({
  id,
  label,
  errorMessage,
  caption,
  className,
  value,
  disabled,
  onClear,
  ...props
}: TextFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = errorMessage ? `${inputId}-error` : undefined;
  const captionId = caption && !errorMessage ? `${inputId}-caption` : undefined;
  const showClearButton = !disabled && !!value;

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <label className="text-body1-regular text-layout-body" htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className="relative flex w-full items-center">
        <input
          id={inputId}
          aria-describedby={errorId ?? captionId}
          aria-invalid={!!errorMessage}
          className={cn(
            "w-full rounded-[10px] border bg-white px-4 py-5 transition-colors",
            "border-border-neutural-default",
            "placeholder:text-body1-regular placeholder:text-fg-neutural-placeholder",
            "hover:text-fg-neutural-hover",
            "focus:text-fg-neutural-focused",
            "disabled:cursor-not-allowed disabled:bg-fill-neutural-iversed-disabled disabled:text-fg-neutural-disabled",
            errorMessage && "border-error",
            showClearButton && "pr-12",
            className
          )}
          disabled={disabled}
          value={value}
          {...props}
        />
        {showClearButton && (
          <ClearButton className="absolute right-4" onClick={() => onClear?.()} />
        )}
      </div>

      {errorMessage && (
        <span id={errorId} className="typo-body2-regular text-error">
          {errorMessage}
        </span>
      )}

      {!errorMessage && caption && (
        <span id={captionId} className="typo-body2-regular text-layout-body">
          {caption}
        </span>
      )}
    </div>
  );
};

export default TextField;
