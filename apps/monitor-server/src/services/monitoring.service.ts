import getActiveApis, { getApiById } from "@/repositories/api.repository";
import { processApi, type CheckResult } from "@/services/monitoring.processor";

const CONCURRENCY = 5;

/**
 * 모니터링 배치를 실행하는 함수입니다.
 *
 * @remarks
 * - 활성 API 목록을 조회한 뒤 병렬 점검합니다.
 * - API 단위 실패는 집계 후 배치 종료 시점에 에러로 전파합니다.
 *
 * @throws 하나 이상의 API 처리에 실패하면 에러를 던집니다.
 *
 * @author junyeol
 */

export const runMonitoring = async (): Promise<void> => {
  const apis = await getActiveApis();
  let nextIndex = 0;
  let failedCount = 0;
  const workerCount = Math.min(CONCURRENCY, apis.length);

  const workers = Array.from({ length: workerCount }, async () => {
    while (true) {
      const currentIndex = nextIndex++;
      if (currentIndex >= apis.length) break;

      const { ok } = await processApi(apis[currentIndex]);
      if (!ok) failedCount += 1;
    }
  });

  await Promise.all(workers);

  if (failedCount > 0) {
    throw new Error(`모니터링 저장 실패 ${failedCount}건`);
  }
};

export type ManualCheckFailureReason =
  | "not_found"
  | "inactive"
  | "no_request_url"
  | "save_failed";

export type ManualCheckOutcome =
  | { ok: true; result: CheckResult }
  | { ok: false; reason: ManualCheckFailureReason };

/**
 * 단일 API를 즉시 점검하는 함수입니다.
 *
 * @remarks
 * - 배치와 동일한 `processApi`를 사용하므로 결과가 `monitoring_results`에 그대로 저장되고, 상태에 따라 `error_logs`에도 기록됩니다.
 * - 배치 대상 조건(`is_active`, `request_url` 존재)을 동일하게 적용해, 배치가 건너뛰는 API는 수동으로도 점검하지 않습니다.
 * - 실패 사유는 예외 대신 `reason`으로 구분해 반환합니다. 라우트가 이 값을 HTTP 상태 코드로 변환합니다.
 *
 * @param apiId - 점검할 API의 id
 *
 * @returns 점검 성공 시 결과, 실패 시 사유
 *
 * @author jikwon
 */

export const runManualCheck = async (apiId: string): Promise<ManualCheckOutcome> => {
  const api = await getApiById(apiId);

  if (!api) return { ok: false, reason: "not_found" };
  if (!api.is_active) return { ok: false, reason: "inactive" };
  if (!api.request_url) return { ok: false, reason: "no_request_url" };

  const { ok, result } = await processApi(api);

  if (!ok || !result) return { ok: false, reason: "save_failed" };

  return { ok: true, result };
};
