import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApiUpdateMutation } from "@/queries";
import {
  hasApiEditFormChanges,
  toApiEditFormValues,
  toApiUpdatePayload,
  validateApiEditForm,
} from "../_utils";
import type { ApiDetailData } from "@/pages/ApiDetail/_types";
import type { ApiEditFormErrors, ApiEditFormValues } from "../_types";

/**
 * API 정보 수정 폼의 입력 값, 유효성 검사, 저장을 담당하는 훅입니다.
 *
 * @remarks
 * - 프로젝트에 폼 라이브러리가 없어 단일 form state 객체를 `useState`로 관리합니다.
 * - 변경 감지는 조회 결과로 만든 초기값과 현재 값을 비교해 계산하므로, 값을 되돌리면 다시 저장할 수 없는 상태가 됩니다.
 * - 유효성 검사는 저장 시점에 한 번 수행하고, 이후 해당 필드를 수정하면 그 필드의 메시지만 지웁니다.
 *
 * @param apiData - 조회한 API 기본 정보. 폼 초기값의 기준이 됩니다
 * @param apiId - 저장 대상 API의 식별자
 *
 * @returns 폼 상태와 조작 함수
 * - `values`: 현재 입력 값
 * - `errors`: 필드별 유효성 검사 메시지
 * - `isDirty`: 초기값과 달라진 필드가 있는지 여부
 * - `isSaving`: 저장 요청 진행 여부
 * - `handleChange`: 특정 필드의 값을 바꾸는 함수
 * - `handleSubmit`: 유효성 검사 후 저장을 실행하는 함수
 *
 * @author jikwon
 */

/**
 * @example
 * ```tsx
 * const { values, errors, isDirty, handleChange, handleSubmit } = useApiEditForm(apiData, apiId);
 * ```
 */

const useApiEditForm = (apiData: ApiDetailData, apiId: string) => {
  const navigate = useNavigate();
  const initialValues = useMemo(() => toApiEditFormValues(apiData), [apiData]);

  const [values, setValues] = useState<ApiEditFormValues>(initialValues);
  const [errors, setErrors] = useState<ApiEditFormErrors>({});

  const { mutate: updateApi, isPending: isSaving } = useApiUpdateMutation(apiId);

  const isDirty = hasApiEditFormChanges(initialValues, values);

  const handleChange = <TField extends keyof ApiEditFormValues>(
    field: TField,
    value: ApiEditFormValues[TField]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = () => {
    const nextErrors = validateApiEditForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    updateApi(
      { apiId, values: toApiUpdatePayload(values) },
      {
        onSuccess: () => {
          navigate(`/api/${apiId}`);
        },
      }
    );
  };

  return { values, errors, isDirty, isSaving, handleChange, handleSubmit };
};

export default useApiEditForm;
