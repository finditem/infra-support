# apps/schedule 작업 계획

- [x] 주차 계산/조회 유틸 (현재 주 월요일 계산, weeks 테이블에서 해당 주 없으면 자동 생성) — `src/app/_lib/kanban.ts`, `_lib/kanbanUtils.ts`
- [x] 칸반보드 데이터 조회 함수 (task_statuses, profiles, 해당 주 tasks 조회 - Server Component에서 사용) — `src/app/page.tsx`
- [x] KanbanHeader: 주차 네비게이션 (`?week=` 쿼리 파라미터로 서버 라우팅, 로그아웃)
- [x] KanbanFilters: 담당자/보고자/우선순위 필터 + 내 일정만 보기 (클라이언트 컴포넌트, 로컬 필터링)
- [x] KanbanProgress: 담당자별 완료율 (완료 상태 기준 계산)
- [x] KanbanBoard/KanbanColumn/KanbanCard: task_statuses 컬럼 6개(할 일/진행 중/검토 중/완료/지연됨/미완료), 우선순위 배지, 마감일 초과 강조, 하위 일정 개수
- [x] 카드 간단 추가 Server Action (제목만 입력, 해당 컬럼 상태로 INSERT) — `src/app/_lib/actions.ts`
- [x] src/app/page.tsx를 실제 데이터 연동 버전으로 교체
- [x] middleware.ts: "/"를 로그인 여부와 무관하게 접근 가능한 OPEN_PATHS로 분리 (GUEST_ONLY_PATHS와 별도 처리, "/" 로그인 상태에서도 리다이렉트 루프 없이 접근 가능)
- [x] pnpm build / pnpm lint 검증

## 캘린더 페이지 퍼블리싱 (design/calendar, mockup_calendar.html 기준)

- [x] 팀원 색상/이니셜 유틸 재사용 확인 (`_lib/kanbanUtils.ts`의 `MEMBER_COLORS`, `buildProfileColorMap`)
- [x] 목업용 더미 팀원/가능 시간 데이터 — `src/app/calendar/_lib/calendarMockData.ts`
- [x] CalendarHeader (월 네비게이션, 메인으로 링크, 로그아웃) — `src/app/calendar/_components/CalendarHeader.tsx`
- [x] MemberSidebar (팀원 필터 토글) — `src/app/calendar/_components/MemberSidebar.tsx`
- [x] CalendarGrid (월간 그리드, 오늘 강조, 팀원별 색상 시간 블록) — `src/app/calendar/_components/CalendarGrid.tsx`
- [x] AvailabilityTimePicker (날짜 클릭 시 시작/종료 시간 선택 팝오버 UI, 확인/취소는 현재 no-op) — `src/app/calendar/_components/AvailabilityTimePicker.tsx`
- [x] CalendarView로 필터/팝오버 상태 조립, calendar/page.tsx를 실제 목업 레이아웃으로 교체
- [x] pnpm build / pnpm lint 검증
- [ ] Supabase `availability` 테이블 연동 (조회/등록/삭제) — 다음 단계
- [ ] 여러 팀원 가능 시간 겹침 표시(공통 가능 시간) — 다음 단계

## 상단 네비게이션 바 추가 (일정/캘린더 이동 + 로그아웃 통합)

- [x] NavBar 공용 컴포넌트 생성 (로고, "일정"/"캘린더" 링크, 로그아웃 버튼, `usePathname` 활성 표시) — `src/components/NavBar.tsx`
- [x] KanbanHeader에서 로그아웃 버튼 제거 (NavBar로 이동)
- [x] CalendarHeader에서 로그아웃 버튼, "메인으로" 링크 제거 (NavBar로 대체)
- [x] page.tsx, calendar/page.tsx에 NavBar 배치
- [x] pnpm build / pnpm lint 검증

## Vercel 빌드 실패 수정 (fix/vercel-error, develop 기준)

- [x] 원인 파악: PR #104(팀원 색상 리팩터링, `ProfileWithColor.colorClassName` → `color`)와 PR #105(캘린더 페이지)가 각각 develop에 머지되면서, 캘린더 컴포넌트가 옛 `colorClassName` 필드를 참조해 develop 기준 빌드가 타입 에러로 실패하는 상태였음
- [x] MemberSidebar.tsx, CalendarGrid.tsx를 `style={{ backgroundColor: profile.color }}` 방식으로 수정
- [x] `colorClassName` 잔존 참조 전체 검색으로 없음 확인
- [x] `.husky/commit-msg`, `.husky/pre-commit`의 기존 버그(monitor-web+schedule 경로가 함께 커밋되면 `cd` 상대경로가 꼬여 실패) 서브셸로 수정
- [x] turbo 캐시 배제(`--force`) 재빌드로 전체 5개 패키지 통과 확인, schedule 단독 pnpm build/lint 통과 확인

## 일정 등록 모달 추가 (design/calendar, mockup_task_create_light.html 기준)

- [x] 마감일 기본값 계산 유틸 추가 (오늘이 토/일이면 다음주 일요일, 아니면 이번주 일요일) — `_lib/kanbanUtils.ts`
- [x] TaskPriority 라벨/색상 상수 통합 (`KanbanCard.tsx`의 `PRIORITY_BADGE`, `KanbanFilters.tsx`의 `PRIORITY_OPTIONS` 중복 제거하고 공용으로 추출)
- [x] PropertyPopover 공용 클릭-외부-닫힘 팝오버 컴포넌트 — `_components/TaskCreateModal/PropertyPopover.tsx`
- [x] 담당자/보고자 선택 팝오버 (이름 실시간 필터링, profiles 재사용) — `_components/TaskCreateModal/ProfilePickerPopover.tsx`
- [x] 마감일 선택 팝오버 (월간 그리드, `CalendarGrid.tsx` 패턴 재사용) — `_components/TaskCreateModal/DatePickerPopover.tsx`
- [x] 우선순위 선택 팝오버 (빨강/노랑/초록 바 클릭) — `_components/TaskCreateModal/PriorityPickerPopover.tsx`
- [x] 상태 선택 팝오버 (task_statuses 목록) — `_components/TaskCreateModal/StatusPickerPopover.tsx`
- [x] TaskCreateModal 본체 (제목/본문 인라인 입력, 속성 그리드, 단축키 ⌘⏎ 등록/Esc 취소) — `_components/TaskCreateModal/TaskCreateModal.tsx`
- [x] createTask 서버 액션 추가 (title/body/assignee/reporter/priority/due_date/status_id/week_id 전부 insert, created_by는 현재 로그인 프로필) — `_lib/actions.ts` (기존 addQuickTask는 대체되어 제거)
- [x] KanbanColumn "+ 일정 추가" 클릭 시 addQuickTask 즉시 생성 대신 TaskCreateModal 오픈으로 변경, statusId를 모달 기본 상태값으로 전달 — `KanbanBoard.tsx`, `KanbanColumn.tsx`
- [x] pnpm build / pnpm lint 검증

## 캘린더 날짜 셀 레이아웃 시프트 수정 + 공휴일 빨간색 표시 (팀원 피드백)

`CalendarGrid.tsx`의 날짜 숫자가 문서 흐름(static position)에 있어 셀 내용에 따라 위치가 밀릴 수 있는 문제를 좌상단 고정으로 수정하고, 공휴일 날짜를 빨간색으로 표시한다.

- [x] `date-holidays` 패키지 추가 (정적 하드코딩 대신 연도별 한국 공휴일을 계산 — 대체공휴일/음력 명절 포함)
- [x] `_lib/holidays.ts` 신규 작성: `getHolidayDates(years: number[]): string[]` — 서버 컴포넌트(`calendar/page.tsx`)에서만 호출해 클라이언트 번들에 포함되지 않도록 함
- [x] `calendar/page.tsx`: 조회 월 기준 연도-1~연도+1의 공휴일을 계산해 `CalendarView` → `CalendarGrid`로 `holidayDates` prop 전달 (그리드가 인접 연도로 넘어가는 경우 대비)
- [x] `CalendarGrid.tsx`: 날짜 셀 버튼을 `relative`로 만들고 날짜 숫자 `span`을 `absolute left-2 top-2`로 좌상단 고정, 가능 시간 블록 목록에 `mt-[30px]` 추가해 겹치지 않도록 조정
- [x] `CalendarGrid.tsx`: 날짜 숫자 색상 조건에 공휴일(`isHoliday`) 분기 추가 (`text-fg-state-error`, 요일 헤더 일요일과 동일 토큰), 오늘 강조(`isToday`)가 최우선
- [x] pnpm build / pnpm lint 검증

## 캘린더 헤더에 연/월 직접 선택 팝오버 추가

이전/다음 달 화살표만 있던 월 이동 UI에, 월 라벨을 클릭하면 연도 네비게이션 + 12개월 그리드로 원하는 연/월을 바로 선택할 수 있는 팝오버를 추가한다.

- [x] `PropertyPopover.tsx`: `label` prop을 옵셔널로 변경 (없으면 라벨 span 미노출) — 헤더처럼 label 없이 트리거만 필요한 곳에서도 재사용
- [x] `calendar/_components/MonthPickerPopover.tsx` 신규 작성: `PropertyPopover` 재사용, 연도 네비게이션(‹ yyyy년 ›) + 1~12월 3x4 그리드, 현재 조회 중인 연/월 강조, 선택 시 `router.push(/calendar?month=yyyy-MM-01)`
- [x] `CalendarHeader.tsx`: 월 라벨 `span`을 `MonthPickerPopover`로 교체
- [x] pnpm build / pnpm lint 검증

## 가능 시간 등록 모달 개선 (기존 "가능한 시간 추가" 위젯)

날짜 클릭 시 뜨는 `AvailabilityTimePicker`가 화면 오른쪽에 고정된 사이드 패널 형태였던 것을, 캘린더 중앙에 뜨는 모달로 바꾸고 시간 선택을 시/분 단위로 세분화한다. 이름도 "가능한 시간 추가"에서 "가능 시간 등록"으로 바꾼다 (plan.md의 기존 "등록/삭제" 용어와 통일).

- [x] `AvailabilityTimePicker.tsx`: 제목 텍스트 "가능한 시간 추가" → "가능 시간 등록"
- [x] `AvailabilityTimePicker.tsx`: `fixed right-7 top-[200px]` 사이드 패널 대신, `TaskCreateModal.tsx`처럼 `fixed inset-0 flex items-center justify-center` 오버레이로 변경해 캘린더 중앙에 뜨도록 수정
- [ ] `AvailabilityTimePicker.tsx`: 시작/종료 시간 선택을 시(00~23) + 분(00/10/20/30/40/50) 두 개의 select로 분리
- [x] `AvailabilityTimePicker.tsx`: 배경 오버레이 클릭 시 `onCancel` 호출로 모달 닫힘 (모달 패널 클릭은 `stopPropagation`으로 전파 차단)
- [ ] pnpm build / pnpm lint 검증
