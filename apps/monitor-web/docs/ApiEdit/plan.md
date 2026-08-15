# ApiEdit 작업 계획

## 완료된 작업

- [x] `/api/:apiId/edit` 라우팅 추가 및 페이지 폴더 구조 생성
- [x] 수정 페이지 UI 기초 퍼블리싱 (ApiEditHeader, ApiEditTitle, ApiDefaultInformation, ApiOperationInformation, ApiEditActionBar, ApiEditSaveButton, ApiInfoTooltip)
- [x] ApiDetail의 "수정" 버튼과 DetailSettings "설정수정" 버튼에서 이 페이지로 이동 연결 (ApiDetail 작업 범위에서 처리됨)

## 착수 전 결정 필요

- [ ] 출처(`source`) 선택 UI의 선택지를 어디서 가져올지 결정 — 현재 `ApiDefaultInformation.tsx:48`은 "Kakao"가 박힌 버튼이고 드롭다운 자체가 없다. 고정 상수 목록으로 둘지, `apis` 테이블의 `source` distinct 조회로 채울지, 아니면 드롭다운을 포기하고 자유 입력 `TextField`로 바꿀지 정해야 한다
- [ ] API별 임계값(`apis.timeout_ms`, `apis.delay_threshold_ms`) 입력 필드를 이번 범위에 포함할지 결정 — 컬럼과 `@infra-support/shared` 타입은 PR #134에서 이미 추가됐지만 읽어 쓰는 코드가 없다. 포함한다면 "운영 정보" 섹션에 두 필드를 추가하고, 비워두면 `null`(전역 기준값 사용)로 저장하는 규칙을 명시한다
- [ ] 폼 상태 관리 방식 결정 — 프로젝트에 폼 라이브러리 의존성이 없으므로 `useState` 단일 form state 객체를 `_hooks/useApiEditForm.ts`로 분리하는 방향을 기본으로 본다

## 데이터 조회 연동

- [ ] `queries/apiEdit/` 도메인을 새로 만들지, 기존 `queries/apiDetail/apiDetail.queries.ts`의 `useApiDetailQuery`를 그대로 재사용할지 결정 — `getApiDetail`이 이미 `name`, `description`, `category`, `source`, `source_url`, `request_url`, `http_method`, `check_interval_minutes`, `is_notification_enabled`, `icon_url`, `is_active`를 반환하므로 `apisQueryKeys.detail(apiId)` 캐시를 상세 페이지와 공유할 수 있다
- [ ] 조회 필드 부족분 보완 — ApiEdit의 "메모" 필드에 대응하는 `apis.memo`가 `getApiDetail` select에 빠져 있다. 임계값 필드를 포함하기로 했다면 `timeout_ms`, `delay_threshold_ms`도 함께 추가한다. `ApiDetailData` 타입과 `mapToApiDetailData`도 같이 갱신한다
- [ ] `ApiEdit.tsx`에서 `useParams`의 `apiId`를 조회 파라미터로 사용하고, 조회 결과를 하위 컴포넌트에 props 또는 컨텍스트로 전달하는 구조 결정

## 하드코딩된 목업 값 제거

- [ ] `ApiEditHeader.tsx:13` 브레드크럼의 "Kakao Map API"를 조회한 API 이름으로 교체
- [ ] `ApiEditTitle.tsx:7` 제목의 "Kakao Map API 정보 수정"을 조회한 API 이름 기반으로 교체
- [ ] `ApiDefaultInformation.tsx:27` API 이름 `defaultValue="Kakao Map API"` 제거
- [ ] `ApiDefaultInformation.tsx:73` 출처 바로가기 `defaultValue="https://apis.map.kakao.com/"`를 `source_url`로 교체
- [ ] `ApiDefaultInformation.tsx:94` 카테고리 `defaultValue="map"`을 `category`로 교체
- [ ] `ApiOperationInformation.tsx:40` 활성화 토글의 `defaultChecked`를 `is_active` 값으로 교체
- [ ] `ApiOperationInformation.tsx:51` 메모 `defaultValue=""`를 `memo` 값으로 교체
- [ ] `TextareaField`의 자리표시자 문구 `caption="Caption"` 2곳(`ApiDefaultInformation.tsx:35`, `ApiOperationInformation.tsx:51`)을 실제 안내 문구로 교체하거나 제거

## 미구현 UI

- [ ] 출처 선택 드롭다운 구현 — 위 "착수 전 결정 필요"의 결론을 따른다. 현재는 `chevronDown` 아이콘만 있고 열리는 목록이 없다
- [ ] 아이콘 미리보기 연결 — `ApiDefaultInformation.tsx:102`의 회색 원 placeholder를 `icon_url` 이미지로 렌더링하고, URL이 비었거나 로드에 실패하면 placeholder로 폴백한다
- [ ] `TextareaField` 글자수 카운터가 항상 `0/500`으로 표시되는 문제 해결 — `TextareaField.tsx:100`의 카운터는 controlled `value`를 읽는데 ApiEdit는 `defaultValue`로만 쓰고 있어 입력해도 숫자가 갱신되지 않는다. 폼을 controlled로 전환하면서 함께 해소한다

## 저장 및 취소 동작

- [ ] `apis` 테이블 업데이트 mutation 추가 — `queries/base/useAppMutation.ts` 래퍼를 사용하고, 성공 시 `apisQueryKeys.detail(apiId)`와 `apisQueryKeys.list()`를 invalidate한다
- [ ] 저장 성공/실패 토스트 연결 — 기존 `hooks/useToast` 재사용
- [ ] 저장 성공 후 이동 경로 결정 및 연결 (상세 페이지 `/api/:apiId` 복귀를 기본으로 본다)
- [ ] `ApiEditSaveButton.tsx:15`의 하드코딩된 `disabled` 제거 — 초기 조회 값과 현재 폼 값을 비교하는 변경 감지(dirty) 로직을 붙여 변경이 있을 때만 활성화한다. `ApiEditActionBar`의 "변경 내용이 없으면 저장할수 없어요" 문구가 이 동작을 전제하고 있다
- [ ] 저장 진행 중 로딩 상태 표시 (버튼 비활성화 및 중복 제출 방지)
- [ ] `ApiEditActionBar.tsx:11` "취소" 버튼에 동작 연결 — 변경 사항이 있을 때 확인 절차를 둘지 결정한다. 브라우저 기본 `confirm`은 지양하고 기존 모달 컴포넌트 재사용 여부를 확인한다
- [ ] `ApiEditHeader.tsx:9` "이전으로" 버튼에 상세 페이지 이동 연결 — 최근에 추가된 `BasicButton`의 `as` prop 패턴을 사용한다

## 유효성 검사

- [ ] 필수 항목(API 이름, 출처, 카테고리) 미입력 시 저장 차단 및 에러 메시지 표시 — `TextField`/`TextareaField`가 이미 `errorMessage` prop을 지원하므로 그대로 사용한다
- [ ] 출처 바로가기와 아이콘 URL의 형식 검증 여부 결정
- [ ] 임계값 필드를 포함한 경우 숫자 범위 검증 규칙 결정

## 상태 처리

- [ ] 최초 조회 로딩 중 `LoadingState` 렌더링
- [ ] 조회 실패 시 `ErrorBoundary` + `ErrorState` 처리 — `ErrorLog.tsx`, `ErrorDetail.tsx`가 쓰는 "페이지를 껍데기와 내용으로 나누는" 패턴을 그대로 따른다
- [ ] 존재하지 않는 `apiId`로 접근했을 때의 처리 결정 (NotFound 이동 또는 전용 안내 문구)

## 구조 및 정리

- [ ] 비어 있는 `_hooks`, `_types`, `_utils` 배럴 채우기 — 폼 상태 훅과 폼 값 타입, 변경 감지 유틸을 각 위치에 분리한다. `_utils` 파일명은 전역 `utils/`의 PascalCase + `Utils` suffix 규칙(`ApiEditUtils.ts`)을 따른다
- [ ] 하드코딩된 hex 색상을 디자인 토큰으로 교체 — `#DFDFDF`, `#1EB87B`, `#E2E8F0`, `#5D5D5D`, `#ACACAC`, `#62CDA3`이 컴포넌트 전반에 흩어져 있다
- [ ] 활성화 토글을 공통 컴포넌트로 뽑을지 검토 — 현재 `ApiOperationInformation.tsx`에 `peer` 클래스 조합으로 인라인 구현되어 있다
