import getActiveApis from "../repositories/api.repository";
import { processApi } from "./monitoring.processor";

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
  let cursor = 0;
  let failedCount = 0;
  const workerCount = Math.min(CONCURRENCY, apis.length);

  const workers = Array.from({ length: workerCount }, async () => {
    while (true) {
      const idx = cursor++;
      if (idx >= apis.length) break;
      const ok = await processApi(apis[idx]);
      if (!ok) failedCount += 1;
    }
  });

  await Promise.all(workers);

  if (failedCount > 0) {
    throw new Error(`모니터링 저장 실패 ${failedCount}건`);
  }
};
