import { useSyncExternalStore } from "react";
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

export function addToast(toast: Omit<Toast, "id">) {
  toasts = [...toasts, { ...toast, id: crypto.randomUUID() }];
  emitChange();
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emitChange();
}

export function useToastList() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

function toast(message: string, type: ToastType, duration?: number) {
  addToast({ message, type, duration });
}

export function useToast() {
  return {
    success: (message: string, duration?: number) => toast(message, "success", duration),
    error: (message: string, duration?: number) => toast(message, "error", duration),
    warning: (message: string, duration?: number) => toast(message, "warning", duration),
  };
}
