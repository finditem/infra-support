# ApiEdit 작업 계획

## 완료된 작업

- [x] `/api/:apiId/edit` 라우팅 추가 및 페이지 폴더 구조 생성
- [x] 수정 페이지 UI 기초 퍼블리싱 (ApiEditHeader, ApiEditTitle, ApiDefaultInformation, ApiOperationInformation, ApiEditActionBar, ApiEditSaveButton, ApiInfoTooltip)
- [x] ApiDetail의 "수정" 버튼과 DetailSettings "설정수정" 버튼에서 이 페이지로 이동 연결 (ApiDetail 작업 범위에서 처리됨)

## 확정된 결정

착수 전에 정해야 했던 항목들이다. 2026년 8월 15일에 확정했다.

- 임계값(`apis.timeout_ms`, `apis.delay_threshold_ms`) 입력 필드는 이번 범위에서 제외한다. 조회와 상세 화면 표시는 PR #137에서 이미 처리되어 있으므로 보기 전용으로 두고, 값 변경은 당분간 Supabase에서 직접 한다. 이에 따라 임계값 숫자 범위 검증 항목도 함께 제외한다.
- 출처(`source`) 선택지는 `apis` 테이블의 `source` 값을 조회해 중복을 제거한 목록으로 채운다. Supabase가 distinct를 직접 지원하지 않으므로 `source`만 select한 뒤 클라이언트에서 중복을 제거한다.
- 폼 상태는 폼 라이브러리 없이 `useState` 단일 form state 객체로 관리하고 `_hooks/useApiEditForm.ts`로 분리한다.
- 조회는 `queries/apiEdit/` 도메인을 새로 만들지 않고 `useApiDetailQuery`를 재사용해 `apisQueryKeys.detail(apiId)` 캐시를 상세 페이지와 공유한다.
- 조회 결과는 컨텍스트 없이 props로 하위 컴포넌트에 전달한다.
- 취소 버튼은 변경 사항이 있을 때 확인 모달을 띄운다. 브라우저 기본 `confirm`은 쓰지 않는다.
- 존재하지 않는 `apiId`로 접근하면 404 페이지로 이동시킨다.
- 출처 바로가기와 아이콘 URL은 형식 검증을 적용한다.
- 저장에 성공하면 상세 페이지 `/api/:apiId`로 돌아간다.

### 남은 판단

- 출처 목록이 기존 데이터에서만 만들어지므로, 아직 어떤 API도 사용하지 않은 새 출처는 드롭다운에 넣을 수 없다. ApiEdit은 수정 전용이라 당장 문제가 되지 않지만, API 등록 화면이 생기면 자유 입력을 허용하는 형태를 다시 검토해야 한다.

## 데이터 조회 연동

- [x] 조회 필드 부족분 보완 — ApiEdit의 "메모" 필드에 대응하는 `apis.memo`가 `getApiDetail` select에 빠져 있다. `ApiRow`, `ApiDetailData` 타입과 `mapToApiDetailData`도 같이 갱신한다
- [x] 출처 목록 조회 추가 — `apisQueryKeys.sources()` 키와 `useApiSourcesQuery`를 `queries/apis/apis.queries.ts`에 추가한다. 이 쿼리는 목록과 상세 양쪽에 걸치지 않는 독립 조회이므로 기존 `apis` 도메인에 둔다
- [x] `ApiEdit.tsx`에서 `useParams`의 `apiId`를 조회 파라미터로 사용하고, 조회 결과를 하위 컴포넌트에 props로 전달

## 하드코딩된 목업 값 제거

- [x] `ApiEditHeader.tsx:13` 브레드크럼의 "Kakao Map API"를 조회한 API 이름으로 교체
- [x] `ApiEditTitle.tsx:7` 제목의 "Kakao Map API 정보 수정"을 조회한 API 이름 기반으로 교체
- [x] `ApiDefaultInformation.tsx:27` API 이름 `defaultValue="Kakao Map API"` 제거
- [x] `ApiDefaultInformation.tsx:73` 출처 바로가기 `defaultValue="https://apis.map.kakao.com/"`를 `source_url`로 교체
- [x] `ApiDefaultInformation.tsx:94` 카테고리 `defaultValue="map"`을 `category`로 교체
- [x] `ApiOperationInformation.tsx:40` 활성화 토글의 `defaultChecked`를 `is_active` 값으로 교체
- [x] `ApiOperationInformation.tsx:51` 메모 `defaultValue=""`를 `memo` 값으로 교체
- [x] `TextareaField`의 자리표시자 문구 `caption="Caption"` 2곳(`ApiDefaultInformation.tsx:35`, `ApiOperationInformation.tsx:51`)을 실제 안내 문구로 교체하거나 제거

## 미구현 UI

- [x] 출처 선택 드롭다운 구현 — `useApiSourcesQuery` 결과로 목록을 채운다. 현재는 `chevronDown` 아이콘만 있고 열리는 목록이 없다
- [x] 아이콘 미리보기 연결 — `ApiDefaultInformation.tsx:102`의 회색 원 placeholder를 `icon_url` 이미지로 렌더링하고, URL이 비었거나 로드에 실패하면 placeholder로 폴백한다
- [x] `TextareaField` 글자수 카운터가 항상 `0/500`으로 표시되는 문제 해결 — `TextareaField.tsx:100`의 카운터는 controlled `value`를 읽는데 ApiEdit는 `defaultValue`로만 쓰고 있어 입력해도 숫자가 갱신되지 않는다. 폼을 controlled로 전환하면서 함께 해소한다

## 저장 및 취소 동작

- [x] `apis` 테이블 업데이트 mutation 추가 — `queries/base/useAppMutation.ts` 래퍼를 사용하고, 성공 시 `apisQueryKeys.detail(apiId)`와 `apisQueryKeys.list()`를 invalidate한다
- [x] 저장 성공/실패 토스트 연결 — 기존 `hooks/useToast` 재사용
- [x] 저장 성공 후 상세 페이지 `/api/:apiId`로 이동 연결
- [x] `ApiEditSaveButton.tsx:15`의 하드코딩된 `disabled` 제거 — 초기 조회 값과 현재 폼 값을 비교하는 변경 감지(dirty) 로직을 붙여 변경이 있을 때만 활성화한다. `ApiEditActionBar`의 "변경 내용이 없으면 저장할수 없어요" 문구가 이 동작을 전제하고 있다
- [x] 저장 진행 중 로딩 상태 표시 (버튼 비활성화 및 중복 제출 방지)
- [x] `ApiEditActionBar.tsx:11` "취소" 버튼에 동작 연결 — 변경 사항이 있으면 확인 모달을 띄우고, 없으면 바로 상세 페이지로 돌아간다
- [x] 취소 확인 모달 신규 작성 — `components/common/modals`의 `ModalLayout`을 감싸 `ApiEdit/_components/ApiEditCancelModal.tsx`로 만든다. 첫 사용처이므로 페이지 안에 두고, 두 번째 사용처가 생기면 공통으로 올린다
- [x] `ApiEditHeader.tsx:9` "이전으로" 버튼에 상세 페이지 이동 연결 — 최근에 추가된 `BasicButton`의 `as` prop 패턴을 사용한다

## 유효성 검사

- [x] 필수 항목(API 이름, 출처, 카테고리) 미입력 시 저장 차단 및 에러 메시지 표시 — `TextField`/`TextareaField`가 이미 `errorMessage` prop을 지원하므로 그대로 사용한다
- [x] 출처 바로가기(`source_url`)와 아이콘 URL의 형식 검증 — `http`/`https` 스킴의 URL만 허용하고, 비어 있으면 검증하지 않고 `null`로 저장한다

## 상태 처리

- [x] 최초 조회 로딩 중 `LoadingState` 렌더링
- [x] 조회 실패 시 `ErrorBoundary` + `ErrorState` 처리 — `ErrorLog.tsx`, `ErrorDetail.tsx`가 쓰는 "페이지를 껍데기와 내용으로 나누는" 패턴을 그대로 따른다
- [x] 존재하지 않는 `apiId`로 접근하면 404 페이지로 이동 — `App.tsx`의 `NotFound`가 `path="*"` catch-all이라 코드에서 보낼 주소가 없으므로 `/404` 라우트를 추가하고 그리로 보낸다. `getApiDetail`이 Supabase의 `PGRST116`(행 없음)을 구분 가능한 에러로 던지게 하고, ErrorBoundary fallback에서 그 에러일 때만 이동시킨다

## 구조 및 정리

- [x] 비어 있는 `_hooks`, `_types`, `_utils` 배럴 채우기 — 폼 상태 훅과 폼 값 타입, 변경 감지 유틸을 각 위치에 분리한다. `_utils` 파일명은 전역 `utils/`의 PascalCase + `Utils` suffix 규칙(`ApiEditUtils.ts`)을 따른다
