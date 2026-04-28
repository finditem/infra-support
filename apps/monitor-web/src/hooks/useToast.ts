import { useSyncExternalStore, useMemo } from "react";
import type { Toast, ToastType } from "@/types";

let toasts: Toast[] = [];
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return toasts;
}

/**
 * 토스트를 추가하는 함수입니다.
 *
 * @remarks
 * - 훅 외부(이벤트 핸들러, 비동기 함수 등)에서 토스트를 발생시킬 때 사용합니다.
 * - `id`는 자동으로 생성됩니다.
 *
 * @param toast - `id`를 제외한 토스트 데이터
 *
 * @author jikwon
 */

/**
 * @example
 * ```ts
 * addToast({ type: "success", message: "저장되었습니다." });
 * addToast({ type: "error", message: "오류 발생", duration: 5000 });
 * ```
 */

export function addToast(toast: Omit<Toast, "id">) {
  toasts = [...toasts, { ...toast, id: crypto.randomUUID() }];
  emitChange();
}

/**
 * ID로 특정 토스트를 제거하는 함수입니다.
 *
 * @param id - 제거할 토스트의 고유 ID
 *
 * @author jikwon
 */

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emitChange();
}

/**
 * 현재 토스트 목록을 구독하는 훅입니다.
 *
 * @remarks
 * - `useSyncExternalStore`를 통해 모듈 레벨 상태를 React 렌더링 사이클에 연결합니다.
 * - 토스트 목록 렌더링 전용으로, 일반적으로 `ToastContainer` 내부에서만 사용합니다.
 *
 * @returns 현재 화면에 표시 중인 토스트 배열
 *
 * @author jikwon
 */

export function useToastList() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

function toast(message: string, type: ToastType, duration?: number) {
  addToast({ message, type, duration });
}

/**
 * 토스트 알림을 발생시키는 훅입니다.
 *
 * @remarks
 * - `ToastContainer`가 앱 루트에 마운트되어 있어야 토스트가 화면에 표시됩니다.
 * - 컴포넌트 외부에서 토스트를 발생시킬 때는 `addToast`를 직접 사용하세요.
 *
 * @returns 토스트 발생 메서드 객체
 * - `success`: 성공 토스트 표시
 * - `error`: 에러 토스트 표시
 * - `warning`: 경고 토스트 표시
 *
 * @author jikwon
 */

/**
 * @example
 * ```tsx
 * const { success, error, warning } = useToast();
 *
 * success("저장되었습니다.");
 * error("요청에 실패했습니다.", 5000);
 * warning("주의가 필요한 작업입니다.");
 * ```
 */

export function useToast() {
  return useMemo(
    () => ({
      success: (message: string, duration?: number) => toast(message, "success", duration),
      error: (message: string, duration?: number) => toast(message, "error", duration),
      warning: (message: string, duration?: number) => toast(message, "warning", duration),
    }),
    []
  );
}
