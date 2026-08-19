import type { ApiDetailData } from "@/pages/ApiDetail/_types";
import type { ApiUpdateValues } from "@/queries";
import type { ApiEditFormErrors, ApiEditFormValues } from "../_types";

const REQUIRED_MESSAGE = {
  name: "API 이름을 입력해 주세요.",
  source: "출처를 선택해 주세요.",
  category: "카테고리를 입력해 주세요.",
} as const;

const INVALID_URL_MESSAGE = "http 또는 https로 시작하는 주소를 입력해 주세요.";

/**
 * 조회한 API 정보를 폼 입력 값으로 변환합니다.
 *
 * @remarks
 * - `null`인 값은 입력 필드에 바인딩할 수 있도록 빈 문자열로 바꿉니다.
 *
 * @returns 폼 입력 값
 *
 * @author jikwon
 */

export const toApiEditFormValues = (apiData: ApiDetailData): ApiEditFormValues => ({
  name: apiData.name,
  description: apiData.description,
  source: apiData.source,
  sourceUrl: apiData.sourceUrl ?? "",
  category: apiData.category,
  iconUrl: apiData.iconUrl ?? "",
  isActive: apiData.isActive,
  memo: apiData.memo,
});

/**
 * 두 폼 입력 값이 다른지 비교합니다.
 *
 * @remarks
 * - 저장 버튼 활성화 여부를 정하는 변경 감지에 사용합니다.
 * - 모든 필드가 원시값이라 키 단위 비교로 충분합니다.
 *
 * @returns 하나라도 다른 필드가 있으면 `true`
 *
 * @author jikwon
 */

export const hasApiEditFormChanges = (
  initialValues: ApiEditFormValues,
  currentValues: ApiEditFormValues
): boolean => {
  const keys = Object.keys(initialValues) as (keyof ApiEditFormValues)[];

  return keys.some((key) => initialValues[key] !== currentValues[key]);
};

const isValidHttpUrl = (value: string): boolean => {
  try {
    const { protocol } = new URL(value);

    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * 폼 입력 값의 유효성을 검사합니다.
 *
 * @remarks
 * - 필수 항목은 공백만 입력한 경우도 미입력으로 봅니다.
 * - URL 항목은 비어 있으면 검사하지 않습니다. 값을 지우는 것은 허용되기 때문입니다.
 *
 * @returns 실패한 필드만 담은 메시지 객체. 모두 통과하면 빈 객체
 *
 * @author jikwon
 */

export const validateApiEditForm = (values: ApiEditFormValues): ApiEditFormErrors => {
  const errors: ApiEditFormErrors = {};

  if (!values.name.trim()) {
    errors.name = REQUIRED_MESSAGE.name;
  }

  if (!values.source.trim()) {
    errors.source = REQUIRED_MESSAGE.source;
  }

  if (!values.category.trim()) {
    errors.category = REQUIRED_MESSAGE.category;
  }

  if (values.sourceUrl.trim() && !isValidHttpUrl(values.sourceUrl.trim())) {
    errors.sourceUrl = INVALID_URL_MESSAGE;
  }

  if (values.iconUrl.trim() && !isValidHttpUrl(values.iconUrl.trim())) {
    errors.iconUrl = INVALID_URL_MESSAGE;
  }

  return errors;
};

/**
 * 폼 입력 값을 `apis` 테이블 수정 payload로 변환합니다.
 *
 * @remarks
 * - 앞뒤 공백을 제거하고, 선택 입력 항목이 비어 있으면 `null`로 저장합니다.
 *
 * @returns `apis` 테이블에 그대로 전달할 수 있는 수정 payload
 *
 * @author jikwon
 */

export const toApiUpdatePayload = (values: ApiEditFormValues): ApiUpdateValues => {
  const description = values.description.trim();
  const sourceUrl = values.sourceUrl.trim();
  const iconUrl = values.iconUrl.trim();
  const memo = values.memo.trim();

  return {
    name: values.name.trim(),
    description: description || null,
    source: values.source.trim(),
    source_url: sourceUrl || null,
    category: values.category.trim(),
    icon_url: iconUrl || null,
    is_active: values.isActive,
    memo: memo || null,
  };
};
