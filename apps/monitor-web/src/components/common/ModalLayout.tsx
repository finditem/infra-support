import { useEffect, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils";

/**
 * 공통 모달 컴포넌트입니다.
 *
 * @remarks
 * - `open`과 `onOpenChange`로 열림 상태를 제어합니다.
 * - 기본적으로 `Esc` 키와 오버레이 클릭으로 닫을 수 있습니다.
 * - 접근성을 위해 `role="dialog"`와 `aria-modal`을 적용합니다.
 *
 * @author junyeol
 */

interface ModalProps {
  /** 모달 열림 상태 */
  open: boolean;
  /** 모달 열림 상태 변경 콜백 */
  onOpenChange: (nextOpen: boolean) => void;
  /** 모달 내부 콘텐츠 */
  children: ReactNode;
  /** ESC 키로 닫기 허용 여부 (default: `true`) */
  closeOnEsc?: boolean;
  /** 오버레이 클릭으로 닫기 허용 여부 (default: `true`) */
  closeOnOverlayClick?: boolean;
  /** 모달 레이아웃 클래스명 */
  className?: string;
  /** 스크린 리더용 레이블 */
  "aria-label"?: string;
  /** 제목 요소 id ( 모달 이름 (제목))*/
  "aria-labelledby"?: string;
  /** 설명 요소 id ( 보조 설명 (본문 / 주의 문구))*/
  "aria-describedby"?: string;
}

/**
 * @example
 * ```tsx
 * // aria-label을 사용하는 경우
 * <ModalLayout open={open} onOpenChange={setOpen} aria-label="삭제 확인">
 *   <div className="...">
 *     ...
 *   </div>
 * </ModalLayout>
 *
 * // aria-labelledby + aria-describedby을 사용하는 경우
 * <ModalLayout open={open} onOpenChange={setOpen} aria-labelledby="modal-title" aria-describedby="modal-description">
 *  <h2 id="modal-title">삭제 확인</h2>
 *  <div id="modal-description" className="...">
 *    ...
 *  </div>
 * </ModalLayout>
 * ```
 */

const ModalLayout = ({
  open,
  onOpenChange,
  children,
  closeOnEsc = true,
  closeOnOverlayClick = true,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
}: ModalProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEsc) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnEsc, onOpenChange, open]);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!closeOnOverlayClick) {
      return;
    }

    if (event.target === event.currentTarget) {
      onOpenChange(false);
    }
  };

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 min-h-full bg-black/50 p-4 flex-center"
      onClick={handleOverlayClick}
    >
      <div
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-modal="true"
        role="dialog"
        className={cn("w-fit rounded-lg bg-white p-6", className)}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default ModalLayout;
