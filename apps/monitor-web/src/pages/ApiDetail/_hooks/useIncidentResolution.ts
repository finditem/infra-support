import { useState } from "react";
import { useUpdateErrorLogCheckedMutation } from "@/queries";
import type { LogListItemData } from "@/pages/ErrorLog/_types";

/**
 * 장애/에러 목록의 확인 처리를 담당하는 훅입니다.
 *
 * @remarks
 * - 서버 갱신에 성공한 뒤에만 로컬 상태를 반영하므로, 실패한 항목은 확인 처리되지 않은 상태로 남습니다.
 * - 확인 처리 결과는 쿼리 결과를 직접 수정하는 대신 `items`에 덧씌워 반환합니다.
 *
 * @param incidents - 확인 처리 대상이 되는 원본 장애/에러 목록
 *
 * @returns 확인 상태가 반영된 목록과 확인 처리 함수
 * - `items`: 확인 처리된 항목의 `status`를 `true`로 덮어쓴 목록
 * - `handleResolve`: 해당 id의 항목을 확인 처리하는 함수
 *
 * @author jikwon
 */

/**
 * @example
 * ```tsx
 * const { items, handleResolve } = useIncidentResolution(incidents);
 * ```
 */

const useIncidentResolution = (incidents: LogListItemData[]) => {
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const { mutate: updateErrorLogChecked } = useUpdateErrorLogCheckedMutation();

  // 목록은 쿼리 결과라 직접 수정할 수 없으므로, 확인 처리된 id를 따로 모아 덧씌운다.
  const items = incidents.map((incident) =>
    resolvedIds.includes(incident.id) ? { ...incident, status: true } : incident
  );

  // 실패 시 목록이 확인 처리된 것처럼 보이지 않도록, 서버 갱신에 성공한 뒤에만 로컬 상태를 반영한다.
  const handleResolve = (id: string) => {
    updateErrorLogChecked(
      { id, checked: true },
      {
        onSuccess: () => {
          setResolvedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
        },
      }
    );
  };

  return { items, handleResolve };
};

export default useIncidentResolution;
