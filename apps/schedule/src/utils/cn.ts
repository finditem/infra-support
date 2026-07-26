import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** clsx를 기반으로 클래스명을 병합하는 유틸리티 함수입니다. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
