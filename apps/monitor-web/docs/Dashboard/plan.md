# Dashboard 작업 계획

- [x] DashboardTimeToggle: 24일/7일 토글 상태별 UI 작업
- [x] DashboardSummaryCard: 사용 중인 아이콘 색상 수정
- [ ] DashboardResponseTimeChart: 마우스 이벤트로 확대/축소 시 표출되는 차트 수정
- [x] DashboardApiList: 상태 뱃지 디자인 수정
- [x] MOCK_RESPONSE_TIME_DATA: 7일치 raw 체크 데이터로 확장 (24h/7d 뷰가 동일 소스에서 필터링되도록)
- [x] ApiResponseTimeChartUtils: 7일 뷰용 일 단위 tick 생성 유틸 추가 (createThreeHourTicks에 대응)
- [x] DashboardResponseTimeChart/ApiResponseTimeChart: range를 24h 데이터 필터링 + period prop으로 연결해 토글이 실제 차트에 반영되도록 수정
- [x] DashboardResponseTimeChart: 장애 배지 문구를 range/outage 개수 기반 동적 텍스트로 변경
- [x] DashboardResponseTimeChart: 평균/최고/최저 응답속도 하드코딩 값을 목업 데이터 기준 계산으로 변경 (calculateResponseTimeStats)
- [x] DashboardResponseStatusChart: 하드코딩된 CHART_DATA를 range 기준 API별 최신 상태 분포 계산으로 변경 (calculateApiStatusDistribution)
- [x] DashboardSummaryCard: Supabase 연결 상태 카드를 제외한 응답속도/마지막 장애/장애 API 카드를 range 기준 목업 데이터 계산으로 변경

## Supabase 실 데이터 연동

- [x] Supabase `monitoring_results.api_id` → `apis.id` FK 관계 확인 후 PostgREST embed 쿼리(`apis(name)`)로 API 이름을 함께 가져올 수 있는지 확정
- [x] `queryKeys.ts`에 `monitoringQueryKeys` factory 추가 (`all` → `responseTime()`) — 7일치 원본 데이터를 단일 쿼리로 캐시하고 24h/7d 필터링은 기존 `filterLatest24HourData` 유틸을 그대로 재사용
- [x] `queries/dashboard/dashboard.queries.ts` 신규 작성: `monitoring_results`를 최근 7일 기준으로 조회해 `ApiResponseTimeData[]`로 변환하는 `getApiResponseTimeData` 함수 + `useApiResponseTimeQuery` 훅 (`useAppQuery` + `throwOnError: true`, 기존 `login.queries.ts`/`mock.queries.ts` 패턴 따름). 조회 기준은 `now() - 7일`(사용자 확인), `monitoring_results.status`의 `"정상"`은 `"healthy"`로 매핑(사용자 확인)
- [x] DashboardResponseTimeChart: `MOCK_RESPONSE_TIME_DATA` → `useApiResponseTimeQuery` 훅으로 교체, 로딩 중 `LoadingSpinner` 표시
- [x] DashboardResponseStatusChart: `MOCK_RESPONSE_TIME_DATA` → `useApiResponseTimeQuery` 훅으로 교체 (동일 queryKey라 캐시 재사용, 추가 요청 없음)
- [x] DashboardSummaryCard: `MOCK_RESPONSE_TIME_DATA` → `useApiResponseTimeQuery` 훅으로 교체
- [x] DashboardSummaryCard: "Supabase 연결/조회 상태" 카드의 하드코딩 "정상" 문구를 쿼리 성공/에러 상태 기반으로 교체할지 결정 후 반영 — `useApiResponseTimeQuery`가 `throwOnError: true`라 에러는 isError로 도달하지 않고 렌더링 중 throw됨 + 현재 앱에 ErrorBoundary가 마운트되어 있지 않음(에러 시 화면 전체가 깨짐)을 확인, 사용자 결정에 따라 `isLoading` 기준 "확인 중"/"정상"만 반영
- [x] DashboardApiList: 기존 `apis.queries.ts`의 `getApis`(apis 테이블 목록)와 `useApiResponseTimeQuery`(7일치 monitoring_results)를 조합해 API별 최신 상태/응답속도/최근 성공률을 계산하는 `_utils` 함수 추가 — 실제 파일은 `queries/mock/mock.queries.ts`의 `getApis`(plan.md 작성 당시 예정 경로와 다름). 이 김에 `getApis` select에 실제 `apis` 테이블에 없는 `url` 컬럼이 들어있던 버그 발견해 `source`/`category`로 수정 (`DashboardApiList`에 필요한 컬럼이기도 함). `DashboardApiListUtils.ts`에 `buildDashboardApiList` 추가
- [x] DashboardApiList: `MOCK_DASHBOARD_API_LIST` → 위 조합 데이터로 교체
- [x] `.env`의 `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` 로컬 설정 여부 사용자 확인 — 최초 확인 시 루트/`apps/monitor-web` 모두 `.env.example`만 존재하고 실제 `.env` 없었음. 이후 사용자가 `apps/monitor-web/.env`에 직접 값 채워 넣어 로컬 연동 정상 동작 확인
- [x] 마이그레이션 완료 후 `src/mock/ApiResponseTime.ts`, `src/mock/dashboardApiList.ts` 사용처가 남아있는지 확인 후 삭제 여부 결정 — grep 결과 두 상수 모두 자기 자신 외 참조 없음 확인 후 삭제, `mock/index.ts` barrel export도 함께 정리

### 해결됨: monitoring_results에 데이터가 안 쌓이던 문제 (2026-07-20)

- 증상: `getApiResponseTimeData`(`queries/dashboard/dashboard.queries.ts`)는 `monitoring_results.checked_at >= now() - 7일` 기준으로 조회하는데, 실 DB의 `monitoring_results`가 `2026-05-19` 이후로 멈춰 있어 대시보드가 계속 빈 상태로 보임.
- 근본 원인: `pg_cron`의 `monitor-cron` 작업(00/04/09시 UTC 매일 실행)이 `monitoring-cron-run` edge function을 `net.http_post`로 호출할 때 `headers`가 `{}`로 비어 있어, `verify_jwt: true`인 edge function이 매번 401로 거부하고 있었음. `cron.job_run_details`는 `net.http_post` 호출 자체(비동기 큐잉)만 성공 여부로 기록해 `status: succeeded`로 남기 때문에 몇 달간 아무도 눈치채지 못함.
- 조치: `apply_migration`(`fix_monitor_cron_auth_headers`)으로 `cron.alter_job`을 이용해 `Authorization`/`apikey` 헤더(anon key)를 추가하고, `timeout_milliseconds`도 5000 → 15000으로 상향(활성 API 8개를 동시성 5로 처리하며 API당 최대 10초 타임아웃이라 5초는 애초에 부족했음).
- 검증: 수정 직후 `net.http_post`로 수동 1회 트리거 → edge function이 `{"ok":true,"total":8,"failed":0}`로 200 응답, `monitoring_results`에 `2026-07-20 13:36` 기준 8건 신규 insert 확인(104건 → 112건). 다음 정기 스케줄(00/04/09시 UTC)부터도 정상 적재될 것으로 예상.

### 해결됨: 데이터는 쌓이는데 차트에 안 보이던 문제 (2026-07-20)

- 증상: `monitoring_results`에 실제로 새 데이터가 쌓였는데도 대시보드 차트에는 반영되지 않음.
- 원인 1(코드 버그, 수정 완료): `apis(name)` embed의 실제 PostgREST 응답은 `monitoring_results → apis`가 many-to-one이라 단일 객체(`{"apis":{"name":"..."}}`)로 오는데, `Database` 제네릭이 없는 supabase-js 클라이언트라 타입 추론이 배열로 나와 `row.apis?.[0]?.name`으로 접근하고 있었음. anon key로 실제 REST 엔드포인트를 직접 호출해 응답 형태가 객체임을 확인 후 `row.apis?.name`으로 수정, 타입 캐스팅도 `as unknown as MonitoringResultRow[]`로 조정(컴파일러가 제안한 방식). 다만 이 버그만으로는 "차트에 아예 안 보임"까지는 설명되지 않고 `apiName`이 `"-"`로만 나오는 정도의 영향.
- 원인 2(클라이언트 캐시, 코드 변경 없음): `lib/queryClient.ts`의 `staleTime: 60_000`, `refetchOnWindowFocus: false`이고 refetch interval도 없어서, 브라우저 탭을 계속 켜둔 채로는(리로드/재마운트 없이는) cron 수정 이전에 캐시된 빈 배열 응답이 자동으로 다시 fetch되지 않음. 브라우저 새로고침(F5)이나 라우트 이동 후 재진입으로 해소.
