import { InputHTMLAttributes, useId } from "react";
import { cn } from "@/utils";

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
  /** 성공 메시지. `errorMessage`가 없을 때만 하단에 표시됩니다. */
  successMessage?: string;
  /** 추가 클래스. input 요소에 적용됩니다. */
  className?: string;
}

/**
 * @example
 * // 기본 사용
 * <TextField id="email" label="이메일" placeholder="example@email.com" />
 *
 * // 에러 상태
 * <TextField id="email" label="이메일" errorMessage="올바른 이메일을 입력해주세요." />
 *
 * // 성공 상태
 * <TextField id="email" label="이메일" successMessage="사용 가능한 이메일입니다." />
 *
 * // 에러, 성공 동시 전달 — errorMessage가 우선되어 에러 메시지만 표시됩니다.
 * <TextField
 *   id="email"
 *   label="이메일"
 *   errorMessage="올바른 이메일을 입력해주세요."
 *   successMessage="사용 가능한 이메일입니다."
 * />
 */

const TextField = ({
  id,
  label,
  errorMessage,
  successMessage,
  className,
  ...props
}: TextFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const showSuccess = !errorMessage && !!successMessage;
  const errorId = errorMessage ? `${inputId}-error` : undefined;
  const successId = showSuccess ? `${inputId}-success` : undefined;

  return (
    <div className="flex flex-col gap-2">
      {label && <label htmlFor={inputId}>{label}</label>}

      <input
        id={inputId}
        aria-describedby={errorId ?? successId}
        aria-invalid={!!errorMessage}
        className={cn(
          "border-1 rounded-4 border-gray-300 px-4 py-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
          className
        )}
        {...props}
      />

      {errorMessage && (
        <span id={errorId} className="text-sm text-red-500">
          {errorMessage}
        </span>
      )}
      {showSuccess && (
        <span id={successId} className="text-sm text-green-500">
          {successMessage}
        </span>
      )}
    </div>
  );
};

export default TextField;
