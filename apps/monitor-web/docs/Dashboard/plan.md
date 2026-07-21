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

### 해결됨: 24h 뷰 윈도우가 실제 cron 주기와 안 맞던 문제 (2026-07-21)

- 증상: 데이터가 쌓여도 24h 뷰 차트에 선이 안 그려짐(점 1개짜리 API가 많아서였던 초기 증상과 별개로, 근본적인 윈도우 설계 문제).
- 원인: 기존 `filterLatest24HourData`는 "가져온 데이터 중 가장 최근 checkedAt이 속한 09:00~다음날 06:59" 구간을 계산했는데, 이건 원래 목업 데이터(하루 종일 촘촘한 패턴)에 맞춘 로직이라 실제 cron(하루 3번, UTC 0/4/9시 = KST 9/13/18시)과 안 맞음. 22시간짜리 창 중 실제 체크가 있는 구간은 9시간(09~18시 KST)뿐이라 항상 절반 이상이 비고, 창이 아직 안 끝난 시점(예: 오늘 다음날 06:59 전)엔 데이터가 더 적어 보임.
- 조치: `filterLatest24HourData`를 "어제 00:00(로컬 자정)~지금"으로 재설계 — 매일 어제치 크론 3번 + 오늘 지금까지의 크론 결과가 항상 함께 보이도록 변경. cron이 KST 18시~다음날 09시엔 안 돌기 때문에 로컬 자정을 경계로 잡아도 실제 체크 시각과 겹치지 않음(사용자 확인). X축 눈금(`createThreeHourTicks`)도 고정 8개(09~30시) 대신 `createDailyTicks`와 같은 패턴(minTimestamp~maxTimestamp를 3시간 간격으로 채우고 마지막에 maxTimestamp 추가)으로 변경, 날짜가 바뀌어도 라벨은 `HH:mm`만 표시(날짜 구분 없음, 사용자 확인).
- 영향 파일: `pages/Dashboard/_utils/DashboardResponseTimeUtils.ts`(`filterLatest24HourData`), `utils/ApiResponseTimeChartUtils.ts`(`createThreeHourTicks`, 시그니처 `(timestamp)` → `(minTimestamp, maxTimestamp)`로 변경), `components/charts/ApiResponseTimeChart.tsx`(호출부 인자 및 TSDoc 갱신).

### 차트 UX 개선 (2026-07-21)

- 툴팁 위치가 recharts의 axis 기반 shared tooltip 때문에 부정확했던 문제를 `Tooltip content={() => null}` + 각 dot(`ErrorDot`)의 `onMouseEnter`/`onMouseLeave`로 hover 상태를 직접 제어하는 방식으로 교체. 같은 시간대에 여러 API가 겹쳐도 실제 hover한 dot의 데이터/좌표만 정확히 표시됨. 모든 지점(정상 포함)에 투명 hit 영역(r=10)을 추가해 아무 지점이나 정밀하게 hover 가능.
- 툴팁에 `apiName` 표시 추가(기존엔 데이터에 있는데 렌더링 안 하고 있었음), 에러 메시지에 `truncate` 적용.
- 차트 하단에 API별 색상-이름 legend를 직접 그려서 추가(recharts `Legend`는 축 너비를 고려하지 않아 왼쪽 정렬이 어긋나 미사용).

### pg_cron 스케줄을 3시간 간격으로 변경 + 24h 윈도우를 rolling 24시간으로 재수정 (2026-07-21)

- pg_cron `monitor-cron`을 `0 0,4,9 * * *`(하루 3번) → `0 */3 * * *`(UTC 3시간마다, 하루 8번, KST 9/12/15/18/21/00/03/06시)로 변경(`apply_migration: change_monitor_cron_to_every_3_hours`). X축 3시간 그리드와 정확히 일치하고, 새벽 시간대 커버리지도 확보.
- 위 스케줄 변경에 따라, 세션 중 수동 트리거로 쌓인 비정렬 테스트 데이터(2026-07-20 13:36/13:55/13:57×2/14:22 UTC, 5개 배치 40건) 삭제하고, 새 3시간 그리드의 새벽 슬롯(2026-07-20 15:00/18:00/21:00 UTC = KST 7/21 00/03/06시) 목업 데이터 24건(API 8개, 전부 healthy) 추가.
- cron 주기가 3시간으로 촘촘해지면서, "하루 3번뿐이라 진짜 rolling 24h면 데이터가 부족하다"는 이전 전제가 깨져 `filterLatest24HourData`를 다시 "어제 자정~지금"에서 **`now() - 24시간`(진짜 rolling 24시간)**으로 재수정. "최근 24시간" 라벨과 실제 동작(이전엔 최대 47~48시간까지 늘어날 수 있었음)이 정확히 일치하게 됨.
- 스케줄 변경 전 이미 예약되어 있던 옛 스케줄 실행 결과(`2026-07-21 04:00` UTC = KST 13시, 새 3시간 그리드엔 없는 시각) 8건 삭제. rolling 24h 윈도우로 바뀌면서 새로 필요해진 그리드 슬롯(`2026-07-20 06/09/12시` UTC)에도 목업 데이터 24건(API 8개, 전부 healthy) 추가해 최근 24시간 그리드가 끊김 없이 채워지도록 정리.

### Gemini 코드리뷰 반영: ErrorBoundary 추가 및 Supabase 연결 상태 isError 표시 (2026-07-21)

- PR #103에 달린 Gemini 리뷰 중 "DashboardSummaryCard가 isError 없이 isLoading만으로 상태를 표시해 위험하다"는 지적을 재검토. 앞서 `throwOnError: true` + ErrorBoundary 미마운트 문제로 `isLoading`만 반영하기로 결정했던 사항이었으나, 사용자와 논의 후 근본 해결로 방향 전환.
- `useApiResponseTimeQuery`의 `throwOnError`를 `true` → `false`로 변경. `throwOnError: true`에서는 쿼리가 에러 상태가 되는 순간 hook 호출 자체가 렌더링 중 throw되어 `isError`를 정상적으로 관측할 수 있는 렌더 경로가 존재하지 않았음(항상 throw로 대체됨). `false`로 바꿔 `isError`가 실제로 관측 가능한 상태값이 되도록 함.
- `DashboardSummaryCard`에 `isError` 분기 복원: `isLoading ? "확인 중" : isError ? "연결 실패" : "정상"`.
- `Dashboard.tsx` 루트를 기존 `components/common/feedback/ErrorBoundary.tsx`(이미 존재하지만 어디에도 마운트되어 있지 않았음)로 감싸고, fallback으로 기존 `components/status/ErrorState.tsx`를 사용. 이 쿼리와 무관한 다른 렌더링 에러가 나도 전체 화면이 깨지지 않도록 하는 일반 안전망 역할.
