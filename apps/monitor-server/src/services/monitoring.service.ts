import getActiveApis from "../repositories/api.repository";
import { processApi } from "./monitoring.processor";

const CONCURRENCY = 5;

/**
 * 모니터링 배치를 실행하는 함수입니다.
 * 
 * @remarks
 * - 활성 API 목록을 조회한 뒤 병렬 점검합니다.
 * - API 단위 실패는 전체 배치를 중단하지않고 진행합니다.
 * 
 * @author junyeol
 */

export const runMonitoring = async (): Promise<void> => {
  const apis = await getActiveApis();
  let cursor = 0;
  const workerCount = Math.min(CONCURRENCY, apis.length);

  const workers = Array.from({ length: workerCount }, async () => {
    while (true) {
      const idx = cursor++;
      if (idx >= apis.length) break;
      await processApi(apis[idx]);
    }
  });

  await Promise.all(workers);
};
