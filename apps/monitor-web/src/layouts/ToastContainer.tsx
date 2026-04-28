import { createPortal } from "react-dom";
import { Toast } from "@/components";
import { useToastList } from "@/hooks/useToast";

const ToastContainer = () => {
  const toasts = useToastList();

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
