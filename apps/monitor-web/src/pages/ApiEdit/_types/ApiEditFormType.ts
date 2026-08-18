/**
 * API 정보 수정 폼이 다루는 입력 값입니다.
 *
 * @remarks
 * - 입력 필드에 그대로 바인딩하기 위해 DB에서 `null`인 값도 빈 문자열로 다룹니다. 저장 시점에 다시 `null`로 되돌립니다.
 *
 * @author jikwon
 */

export interface ApiEditFormValues {
  /** API 이름 */
  name: string;
  /** 상세 패널에 노출되는 설명 */
  description: string;
  /** API 제공처 */
  source: string;
  /** API 제공처 또는 공식 문서 링크 */
  sourceUrl: string;
  /** 분류값 */
  category: string;
  /** 아이콘 이미지 URL */
  iconUrl: string;
  /** 모니터링 목록 노출 여부 */
  isActive: boolean;
  /** 운영용 메모 */
  memo: string;
}

/**
 * 필드별 유효성 검사 메시지입니다. 통과한 필드는 키가 없습니다.
 *
 * @author jikwon
 */

export type ApiEditFormErrors = Partial<Record<keyof ApiEditFormValues, string>>;
