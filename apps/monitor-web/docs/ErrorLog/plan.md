# ErrorLog 작업 계획

## 페이지네이션 추가

- [x] ErrorLog 페이지 전용 Pagination 컴포넌트 작성 (`_components/Pagination.tsx`)
- [x] LogList에 페이지 상태(currentPage) 추가하고 mock 배열을 클라이언트 측에서 slice
- [x] LogList 하단에 Pagination 컴포넌트 연결
- [x] 상태 필터 변경 시 페이지를 1페이지로 초기화 — 필터 기능(아래 항목) 구현과 함께 처리
- [x] 페이지네이션 번호 버튼 모서리를 8px로 조정
- [x] 이전/다음 버튼을 화살표+텍스트 형태로 변경하고 첫/마지막 페이지에서 각각 비활성화
- [x] 이전/다음 버튼에 테두리(border-divider-default, 1px), radius 12px, 패딩(좌우 12px/상하 8px 기준) 적용
- [x] 이전/다음 버튼 텍스트를 16px/medium/lineHeight 24px(typo-body2-medium)로 적용
- [x] 이전/다음 버튼 크기를 64x40에 맞춰 패딩 값으로 조정
- [x] 화살표 아이콘 SVG 내부 여백으로 인한 아이콘-텍스트 간격 오차를 마이너스 마진으로 보정
- [x] mock 데이터를 21개로 확장해 페이지네이션 3페이지 노출 확인
- [x] 각 페이지의 마지막 로그 항목에서 하단 구분선 제거

## 필터 버튼 카운트 배지 라운디드 고정

- [x] LogListFilterButton의 카운트 Badge는 rounded-full을 유지하고, 한 자리 숫자일 때만 좌우 padding을 넓혀(px-[6px]) 정원에 가깝게, 두 자리 이상일 때는 좁혀(px-[4px]) 폭만 늘어나도록 조정
- [x] 카운트 Badge의 tabular-nums 제거 — 고정폭 숫자 렌더링이 두 자리 숫자(예: 21) 사이 간격을 부자연스럽게 벌려 보이는 문제 해결. padding이 이미 자릿수별 가변 처리되어 고정폭의 이점(레이아웃 흔들림 방지)이 불필요해짐

## 상태 필터 버튼 필터링 기능

- [x] `selectedFilter`를 고정 상수("all")에서 useState로 전환
- [x] `filteredItems` 계산 추가 — unchecked/checked는 `item.status` 기준으로 필터링, all은 전체 노출
- [x] 필터 버튼 onClick(no-op)을 `handleFilterChange`로 연결 — 필터 변경 시 currentPage를 1로 초기화

## 요약 카드(LogSummaryCards) mock 데이터 연동

- [x] `items` state를 LogList에서 ErrorLog로 상향 — LogList는 `items`/`onCheckedChange`를 props로 받도록 변경, LogSummaryCards와 동일 데이터 공유
- [x] `_utils/index.ts`에 `getLogSummaryData` 추가 — 전체 건수, 미확인 건수, 최근 발생 API명(occurredAt 최댓값 기준)을 mock items에서 계산
- [x] ErrorLog.tsx의 하드코딩된 `{ totalErrors: 0, ... }` 및 onRefresh no-op을 실제 계산값/mock 재설정으로 교체 — 체크 상태 토글 시 요약 카드도 즉시 갱신

## TSDoc 및 \_utils 구조 정리

- [x] `_utils/index.ts`(배럴)에 있던 `getLogSummaryData` 구현을 `_utils/ErrorLogUtils.ts`로 분리하고 index.ts는 re-export만 담당하도록 정리 — 페이지별 `_utils`에 분리 사례가 없어 전역 [utils/](../../src/utils)의 PascalCase+Utils suffix 네이밍(`ApiResponseTimeChartUtils.ts`)을 따름
- [x] `ErrorLogUtils.ts`의 `getLogSummaryData`에 TSDoc 작성 (`ApiResponseTimeChartUtils.ts` 스타일: 설명 → @remarks → @returns → @author junyeol)
- [x] `Pagination.tsx` TSDoc은 사용자 요청 범위 밖이라 제거 — TSDoc은 사용자가 지목한 파일에만 작성

## mock 데이터를 Supabase 실 데이터로 전환

- [ ] 사전 확인: `error_logs` 테이블은 이미 존재하고 monitor-server(`monitoring.repository.ts`의 `insertErrorLog`)가 기록은 하지만, 조회용 API/쿼리 경로가 아직 없음. `mock.queries.ts`(`apis` 테이블을 monitor-web에서 Supabase로 직접 `.from().select()` 조회하는 기존 패턴)를 그대로 따를지, monitor-server에 GET 라우트를 새로 만들지 먼저 결정 필요
- [ ] `error_logs` 테이블 컬럼(`id, api_id, status, error_type, error_message, response_time, http_status, is_checked, occurred_at, created_at`)과 현재 `LogListItemData`(`id, apiName, errorType, errorStatus, errorMessage, occurredAt, status`) 필드 매핑 정의 — `apiName`은 `apis` 테이블과 join 필요, `is_checked` → `status`, `errorStatus`는 `status` 컬럼과 이름이 겹치므로 매핑 시 혼동 주의
- [ ] `queries/errorLog/` 도메인 추가 — `queryKeys.ts`에 `errorLogQueryKeys`(list/detail) factory 추가
- [ ] `queries/errorLog/errorLog.queries.ts`에 `useErrorLogListQuery` 작성 (`useAppQuery` 기반, `mock.queries.ts`의 `getApis` 패턴 참고)
- [ ] 확인 상태 토글(`is_checked`)을 Supabase에 반영하는 `useAppMutation` 기반 훅 추가 — 현재 `LogList`의 `onCheckedChange`가 로컬 state만 바꾸는 부분을 대체
- [ ] `ErrorLog.tsx`의 `useState<LogListItemData[]>(MOCK_ERROR_LOG_ITEMS)`를 위 쿼리 훅으로 교체, 로딩/에러 상태 UI 처리 방식 결정 (기존 `components/status/LoadingState`, `ErrorState` 재사용 여부 확인)
- [ ] mock 관련 코드(`@/mock/errorLog.ts`, `MOCK_ERROR_LOG_ITEMS` import) 정리 — 실 데이터 전환 완료 후 제거 여부는 다른 페이지의 mock 제거 여부와 일관되게 결정

## LogSummaryCards 새로고침 버튼 기능 연결

- [ ] 현재 `ErrorLog.tsx`의 `onRefresh`가 mock 배열 재할당(no-op에 가까움)으로 되어 있는 부분을, 위 Supabase 전환 이후에는 쿼리 refetch(TanStack Query의 `refetch` 또는 `queryClient.invalidateQueries(errorLogQueryKeys.list())`)로 교체
- [ ] 새로고침 진행 중 로딩 상태를 `IconButton`(현재 `iconName="refresh"`)에 시각적으로 반영할지 여부 결정 (예: 아이콘 회전 애니메이션, disabled 처리)
- [ ] 새로고침 성공/실패에 대한 사용자 피드백(토스트 등) 필요 여부 확인 — 프로젝트에 `useToast` 훅이 이미 있으므로 재사용 검토

## 데이터 없음/로딩/에러 상태 UI

- [ ] 사전 확인: `components/status/`에 `EmptyState`, `LoadingState`, `ErrorState`가 이미 구현되어 있음(`message`/`icon`/`iconSize`/`iconClassName` props 공통, `ErrorState`는 `children` 추가 지원). 신규 컴포넌트를 만들지 말고 이 셋을 재사용
- [ ] 목록 조회 결과가 빈 배열일 때 `LogList`(또는 `ErrorLog.tsx`)에서 기존 `ul` 대신 `EmptyState` 렌더링 — 필터 적용 후 빈 결과(예: "확인전" 필터인데 전부 확인완료)와 원본 데이터 자체가 없는 경우를 같은 메시지로 둘지, 문구를 구분할지 결정
- [ ] 최초 목록 조회 중(쿼리 `isPending`)에는 `LogList` 영역에 `LoadingState` 렌더링 — Supabase 전환(`useErrorLogListQuery`) 작업과 함께 진행
- [ ] 새로고침(`onRefresh`) 진행 중 UI 결정 — 목록 전체를 `LoadingState`로 덮을지, 기존 목록을 유지한 채 새로고침 아이콘 버튼만 로딩/disabled 표시할지 선택 (후자가 사용자 경험상 자연스러움에 가까움)
- [ ] 목록 조회 실패(쿼리 `isError`) 시 `LogList` 영역에 `ErrorState` 렌더링, 필요 시 `children`으로 재시도 버튼 추가 (쿼리의 `refetch` 연결)
- [ ] `LogSummaryCards`도 로딩/에러 시 카드 값을 어떻게 보여줄지 결정 (예: 스켈레톤, `-` 플레이스홀더, 또는 `LogList`와 동일한 상태 컴포넌트 공유)

## PR #96 Gemini 리뷰 대응

- [x] [high] `LogList.tsx`: 필터링/체크 상태 변경으로 `filteredItems`가 줄어들 때 `currentPage`가 새 `totalPages`를 초과해 빈 목록이 렌더링되는 문제 — 렌더링 중 `currentPage`를 `totalPages`로 보정하는 `activePage`를 도입하고, `pagedItems`와 `Pagination`의 `currentPage` prop 모두 `activePage`를 사용하도록 수정. 검증 결과 실제 버그로 확인되어 반영
- [x] [medium] `Pagination.tsx`의 `text-fg-neutural-inversed-default`가 오타라는 지적 — 검증 결과 오탐. `neutural`은 `packages/design-tokens`(preset.cjs, variables.css)에 실제로 정의된 토큰 철자이며, `DashboardTimeToggle.tsx`/`DetailIncidentHistory.tsx` 등 다른 파일에서도 동일하게 사용 중. `neutral`로 고치면 존재하지 않는 클래스가 되므로 수정하지 않음
