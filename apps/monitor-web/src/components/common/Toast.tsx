import { useEffect } from "react";
import type { Toast as ToastItem } from "@/types";
import { cn } from "@/utils/cn";
import { removeToast } from "@/hooks/useToast";

// TODO(지권): 토스트 디자인 변경 필요

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
  toast: ToastItem;
}

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
