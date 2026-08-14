# ApiDetail 작업 계획

## 완료된 작업

- [x] `/api/:apiId` 라우팅 추가 및 페이지 폴더 구조 생성
- [x] API 상세 페이지 UI 기초 퍼블리싱
- [x] 책임별 컴포넌트 분리 (DetailHeader, DetailSummaryCards, DetailResponseChart, DetailCheckLogs, DetailImpactedFeatures, DetailSettings, DetailIncidentHistory)
- [x] DetailHeader 리팩토링 및 접근성, 시맨틱 태그 개선
- [x] DetailSummaryCards 리팩토링 및 접근성, 시맨틱 태그 개선
- [x] DetailCheckLogs 리팩토링 및 접근성, 시맨틱 태그 개선
- [x] DetailImpactedFeatures 리팩토링 및 접근성, 시맨틱 태그 개선
- [x] DetailSettings 리팩토링 및 접근성, 시맨틱 태그 개선, 중복 스타일 제거
- [x] 목업 데이터를 `src/mock/apiDetail.ts`로 분리
- [x] `ApiStatus` 타입을 전역 `src/types`로 분리
- [x] 타이포 스타일 및 디자인 수정 반영

## 남은 작업

### 데이터 연동 (Supabase 실데이터 전환)

- [x] `src/queries/apiDetail/apiDetail.queries.ts` 신설 — `useAppQuery` 래퍼와 `apisQueryKeys.detail(apiId)` 사용
- [x] ApiDetail.tsx에서 `useParams`의 `apiId`를 쿼리 파라미터로 사용하고 임시 `console.warn(apiId)` 제거
- [x] DetailHeader의 `MOCK_HEADER_DATA` 실데이터 전환 (이름, 상태 코드, 로고 이미지)
- [x] DetailHeader의 하드코딩된 설명 문구, 카테고리(`map`), 출처 링크(Kakao developers)를 API 데이터 기반으로 변경
- [x] DetailHeader 로고 이미지 경로를 `/src/assets/mocks/api-detail-mock.png` 대신 실제 에셋 또는 API 응답 값으로 교체 (현재 경로는 프로덕션 빌드에서 깨짐)
- [x] DetailSummaryCards의 하드코딩된 `SUMMARY_CARD_DATA`(상태, 마지막 체크 시간, 응답 속도, 성공률) 실데이터 전환
- [x] DetailCheckLogs의 `MOCK_LOGS` 실데이터 전환
- [x] DetailCheckLogs의 하드코딩된 범례 카운트(`LEGEND_ITEMS`), 체크 주기 배지("3시간 주기"), 조회 구간("오늘 00:00 - 24:00") 실데이터 전환
- [x] DetailImpactedFeatures의 `MOCK_FEATURES` 실데이터 전환
- [x] DetailSettings의 `MOCK_SETTINGS` 실데이터 전환 및 HTTP Method 하드코딩("GET") 제거
- [x] DetailIncidentHistory의 `MOCK_ERROR_LOG_ITEMS` 실데이터 전환 및 "최근 7일" 기준 필터 적용

### 미구현 기능

- [x] DetailResponseChart 구현 — 현재 회색 placeholder div만 존재하므로 `src/components/charts`의 Recharts 기반 차트로 응답 시간 추이 렌더링
- [x] DetailHeader "수동요청" 버튼에 수동 체크 실행 mutation 연결 (현재 onClick 없음)
- [x] DetailHeader "수정" 버튼에 `/api/:apiId/edit` 이동 연결 (현재 onClick 없음)
- [x] DetailSettings "설정수정" 버튼에 `/api/:apiId/edit` 이동 연결 (현재 onClick 없음)
- [x] DetailIncidentHistory 확인 처리 버튼을 로컬 state 변경 대신 실제 mutation으로 연결

### 수동 체크 실행 (수동요청 버튼)

monitor-web은 지금까지 Supabase에만 직접 접근했고 monitor-server를 호출하는 경로가 없었다. 기존 `POST /api/monitor`는 `CRON_SECRET` Bearer로 보호되는데 Vite의 `VITE_*`는 번들에 노출되므로 웹에서 재사용할 수 없다. 따라서 Supabase 세션 JWT로 인증하는 단일 API 전용 엔드포인트를 새로 만든다.

- [x] monitor-server: `api.repository.ts`에 `getApiById` 추가
- [x] monitor-server: `processApi`가 저장한 점검 결과를 함께 반환하도록 변경하고 `runMonitoring` 호출부 갱신 (성공/실패 집계 의미는 유지)
- [x] monitor-server: `lib/auth.ts` 추가 — Authorization 헤더의 Supabase access token 검증
- [x] monitor-server: `lib/cors.ts` 추가 — 허용 오리진 목록 기반 CORS 헤더 생성
- [x] monitor-server: `monitoring.service.ts`에 `runManualCheck(apiId)` 추가 (미존재/비활성/request_url 미설정을 구분해 반환)
- [x] monitor-server: `POST /api/monitor/[apiId]` 라우트 추가 (OPTIONS preflight 포함)
- [x] monitor-web: `.env.example`에 `VITE_MONITOR_SERVER_URL` 추가
- [x] monitor-web: `apiDetail.queries.ts`에 `useApiManualCheckMutation` 추가 — 성공 시 detail/checkLogs/errorLogs 무효화 및 결과 토스트
- [x] monitor-web: DetailHeader "수동요청" 버튼에 mutation 연결 및 실행 중 로딩 상태 표시
- [x] 배포 환경변수 반영 — monitor-server에 `MONITOR_WEB_ORIGINS`, monitor-web에 `VITE_MONITOR_SERVER_URL` 설정 (로컬 `.env`와 Vercel 양쪽 모두)

### 버그 수정

- [x] DetailIncidentHistory "전체보기" 버튼의 `navigate("/api-detail")`을 실제 라우트 `/errors`로 수정 (현재 존재하지 않는 경로라 NotFound로 이동)
- [x] DetailIncidentHistory "더보기" 버튼의 `navigate("/error-log")`를 실제 라우트 `/api/:apiId/errors/:errorId`로 수정 (현재 존재하지 않는 경로라 NotFound로 이동)

### 상태 처리 및 정리

- [x] 각 섹션의 로딩 상태 처리 (스켈레톤 또는 로딩 UI)
- [x] 데이터 조회 실패 시 에러 상태 처리 및 토스트 연결
- [x] DetailIncidentHistory의 `TODO(지권)` 해소 — BasicButton `as` prop 패턴 적용
- [x] DetailSettings의 `TODO(지권)` 해소 — 버튼 outline 스타일 변경
- [x] 데이터 가공 로직을 `_utils`로 분리 — `_utils/ApiDetailUtils.ts`에 `getApiSummaryData`, `getCheckLogStatusCounts`, `getCheckLogTimeRange`, `formatCheckInterval` 작성 완료

### \_hooks 분리

`_utils`(순수 계산 함수)는 채워졌으나 `_hooks`는 배럴만 있고 비어 있어, 쿼리 호출과 로컬 상태를 끼고 도는 로직을 훅으로 옮긴다.

- [x] `_hooks/useApiDetailData.ts` 신규 작성 — `ApiDetailContent`가 직접 호출하던 네 개의 쿼리(detail/checkLogs/affectedFeatures/errorLogs)와 `checkLogs` 기본값 처리, `getApiSummaryData` 계산을 훅으로 이동
- [x] `ApiDetail.tsx`: `useApiDetailData(apiId)` 호출로 교체하고 페이지 컴포넌트는 조립만 담당하도록 정리 (`!apiData` 로딩 분기와 ErrorBoundary 구조는 유지)
- [x] `_hooks/useIncidentResolution.ts` 신규 작성 — `DetailIncidentHistory`의 `resolvedIds` 상태, 확인 처리 결과를 목록에 덧씌우는 `items` 계산, `updateErrorLogChecked` 호출을 훅으로 이동
- [x] `DetailIncidentHistory.tsx`: `useIncidentResolution(incidents)` 호출로 교체하고 렌더링만 담당하도록 정리
- [x] `_hooks/index.ts`에 두 훅 re-export 추가 (`Login/_hooks/index.ts`의 `export { default as ... }` 패턴 유지)
