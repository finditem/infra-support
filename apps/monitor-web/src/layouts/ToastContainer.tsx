import { createPortal } from "react-dom";
import { Toast } from "@/components";
import { useToastList } from "@/hooks/useToast";

/**
 * 모든 토스트를 화면 우하단에 렌더링하는 레이아웃 컴포넌트입니다.
 *
 * @remarks
 * - `createPortal`을 사용해 `document.body`에 직접 마운트됩니다.
 * - `App.tsx` 루트에 한 번만 사용 됩니다.
 *
 * @author jikwon
 */

/**
 * @example
 * ```tsx
 * // App.tsx
 * export default function App() {
 *   return (
 *     <div>
 *       <Routes>...</Routes>
 *       <ToastContainer />
 *     </div>
 *   );
 * }
 * ```
 */

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
