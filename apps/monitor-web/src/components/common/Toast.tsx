// TODO(지권): 토스트 디자인 변경 필요
import { useEffect } from "react";
import type { Toast as ToastItem } from "@/types";
import { cn } from "@/utils/cn";
import { removeToast } from "@/hooks/useToast";

/**
 * 단일 토스트 아이템을 렌더링하는 컴포넌트입니다.
 *
 * @remarks
 * - `duration` 이후 자동으로 제거되며, 닫기 버튼으로 즉시 제거할 수 있습니다.
 * - 직접 사용하지 않고 `ToastContainer`를 통해 렌더링됩니다.
 *
 * @author jikwon
 */

const STYLE_MAP: Record<ToastItem["type"], string> = {
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  warning: "bg-yellow-500 text-black",
};

const ICON_MAP: Record<ToastItem["type"], string> = {
  success: "",
  error: "",
  warning: "",
};

interface ToastProps {
  /** 렌더링할 토스트 데이터 */
  toast: ToastItem;
}

/**
 * @example
 * ```tsx
 * // ToastContainer 내부에서 자동으로 렌더링됩니다.
 * // 직접 사용이 필요한 경우:
 * <Toast toast={{ id: "1", type: "success", message: "저장되었습니다." }} />
 * ```
 */

const Toast = ({ toast }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration ?? 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration]);

  return (
    <div
      className={cn(
        "animate-toast-in flex min-w-64 max-w-sm items-center gap-3 rounded-lg px-4 py-3 shadow-lg",
        STYLE_MAP[toast.type]
      )}
    >
      <span className="text-base font-bold">{ICON_MAP[toast.type]}</span>
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        className="ml-1 text-sm opacity-60 transition-opacity hover:opacity-100"
        onClick={() => removeToast(toast.id)}
      >
        X
      </button>
    </div>
  );
};

export default Toast;
