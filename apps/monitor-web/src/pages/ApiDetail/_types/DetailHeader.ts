export interface ApiDetailData {
  id: string;
  name: string;
  description: string;
  category: string;
  source: string;
  sourceUrl: string | null;
  requestUrl: string | null;
  httpMethod: string;
  checkIntervalMinutes: number;
  isNotificationEnabled: boolean;
  iconUrl: string | null;
  isActive: boolean;
  /** API별 타임아웃(ms). `null`이면 monitor-server의 전역 기준값을 사용한다. */
  timeoutMs: number | null;
  /** API별 지연 판정 임계값(ms). `null`이면 monitor-server의 전역 기준값을 사용한다. */
  delayThresholdMs: number | null;
}
