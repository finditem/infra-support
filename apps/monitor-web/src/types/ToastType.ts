/**
 * 토스트 알림에 사용되는 타입 정의 모음입니다.
 *
 * @author jikwon
 */

/** 토스트 종류 */
export type ToastType = "success" | "error" | "warning";

export interface Toast {
  /** 토스트 고유 ID */
  id: string;
  /** 토스트에 표시할 메시지 */
  message: string;
  /** 토스트 종류 */
  type: ToastType;
  /** 자동 제거까지의 시간 ms (default: 3000) */
  duration?: number;
}
