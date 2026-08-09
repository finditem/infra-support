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

## 라이트/다크 모드 도입

- [x] next-themes, lucide-react 의존성 추가, `tailwind.config.ts`에 `darkMode: "class"` 추가
- [x] `layout.tsx`에 `suppressHydrationWarning` + `ThemeProvider`(attribute="class", defaultTheme="system", enableSystem) 적용
- [x] `src/components/ThemeToggle.tsx` 신설 (lucide-react Sun/Moon, useTheme), `NavBar.tsx`에 배치
- [x] `globals.css`에 `:root`/`.dark` CSS 변수 세트 추가 (primary, primary-hover, surface, surface-elevated, text-default, text-muted, text-inverse, border, fg-state-error, fill-neutural-subtle-default, fill-neutural-subtle-hover)
- [x] `tailwind.config.ts`의 `theme.extend.colors`에서 위 토큰들을 `var(--color-*)` 참조로 오버라이드
- [x] `TaskCreateModal.tsx`, `AvailabilityTimePicker.tsx`의 임의값 shadow에 dark: variant 추가
- [x] `supabase/migrations/0002_add_task_status_dark_color.sql` 작성 (task_statuses.color_dark 컬럼 추가, 6개 상태 color/color_dark 갱신)
- [x] `src/types/tables/task_statuses.ts`에 `color_dark` 필드 추가
- [x] `kanbanUtils.ts`에 라이트/다크 상태색 선택 헬퍼(`getStatusColor`) 추가
- [x] `KanbanColumn.tsx`, `StatusPickerPopover.tsx`의 상태색 인라인 style을 헬퍼 기반으로 교체
- [x] `kanbanUtils.ts`의 `PRIORITY_META.badgeClassName`에 dark: variant 클래스 추가
- [x] `apps/schedule/CLAUDE.md`의 "앱 전용 다크 테마 미채택" 문구를 다크모드 구현 방식으로 갱신
- [x] Supabase 마이그레이션 적용 (사용자가 대시보드 SQL Editor에서 직접 실행)
- [x] pnpm build / pnpm lint 검증 (통과 확인)

## 하위 일정 전용 페이지 (일정 중첩, 2단계까지)

일정(a)을 클릭하면 `/task/[id]`로 이동해 a의 하위 일정(1,2,3...)을 기존 칸반보드와 동일한 UI로 보여준다. a 자체의 상세 편집(제목/본문/속성/삭제)과 3단계 이상 중첩은 이번 범위 밖.

- [x] `KanbanBoard.tsx`: `parentId`/`enableTaskNavigation` prop 추가, `topLevelTasks` 필터를 `parent_id === parentId` 기준으로 일반화, `weekId` 타입 `string | null`로 완화, `TaskCreateModal`에 `parentId` 전달
- [x] `KanbanColumn.tsx`: `navigable` prop 추가 및 `KanbanCard`로 전달
- [x] `KanbanCard.tsx`: `navigable` prop 추가, true일 때 `next/link`로 `/task/[id]` 이동 래핑
- [x] `TaskCreateModal.tsx`: `parentId` prop 추가 및 `createTask` 호출에 전달, `weekId` 타입 완화
- [x] `_lib/actions.ts`: `CreateTaskInput`/`TasksInsert`에 `parent_id` 추가, `weekId` 타입 완화
- [x] `src/app/task/[id]/page.tsx` 신규 작성 (부모 일정 + 하위 일정 + statuses/profiles fetch, notFound 가드, KanbanBoard 조립)
- [x] `src/app/task/[id]/_components/TaskDetailHeader.tsx` 신규 작성 (제목 읽기 전용 표시 + 목록으로 링크)
- [x] pnpm build / pnpm lint 검증

## 일정 카드 클릭 시 수정 모달 오픈 (페이지 직행 대신)

카드를 클릭하면 `/task/[id]`로 바로 이동하는 대신, "일정 추가"와 동일한 모달이 기존 일정 데이터로 채워져 뜨고 그 자리에서 수정 가능해야 한다. 상위 일정(parent_id가 없는 일정) 카드의 모달에서만 오른쪽 상단에 "바로가기" 버튼을 노출해 `/task/[id]`로 이동할 수 있게 한다.

- [x] `_lib/actions.ts`: `updateTask` 서버 액션 추가 (`TasksUpdate`로 id 기준 update)
- [x] `TaskCreateModal.tsx`: `task?: TasksRow | null` prop으로 생성/수정 겸용화 (필드 프리필, 제출 시 `updateTask`/`createTask` 분기, 버튼/브레드크럼 텍스트 분기), `parent_id`가 없는 일정 수정 시에만 상단 "바로가기" 버튼(`/task/[id]`) 노출
- [x] `KanbanBoard.tsx`: `editingTask` 상태 추가, 카드 클릭 시 수정 모달 오픈, 저장 시 목록에 upsert. `enableTaskNavigation` prop/로직 제거 (모든 카드가 클릭 시 모달을 열도록 통일했고, 바로가기 버튼 노출 여부는 board가 아니라 task.parent_id로 판단)
- [x] `KanbanColumn.tsx`/`KanbanCard.tsx`: `navigable`/`next/link` 방식 제거, `onSelect` 클릭 핸들러로 교체 (키보드 접근성 포함)
- [x] `src/app/task/[id]/page.tsx`: `enableTaskNavigation` prop 제거 (더 이상 필요 없음)
- [x] pnpm build / pnpm lint 검증

## 바로가기 버튼 위치를 모달 헤더 대신 카드 상단으로 이동

"바로가기" 버튼은 모달을 열어야만 보이는 것보다, 카드 상단(우선순위 배지와 같은 줄)에 오른쪽 정렬로 바로 노출되는 편이 낫다는 피드백 반영.

- [x] `KanbanCard.tsx`: 우선순위 배지 줄에 `justify-between`으로 `parent_id`가 없는 일정에만 "바로가기" 링크(`/task/[id]`) 추가, 클릭 시 카드의 수정 모달 오픈(`onSelect`)이 함께 트리거되지 않도록 `stopPropagation` 처리
- [x] `TaskCreateModal.tsx`: 모달 헤더의 "바로가기" 버튼/`showShortcut` 로직 제거 (카드로 일원화)
- [x] pnpm build / pnpm lint 검증
- [x] 바로가기 링크에 lucide-react `ExternalLink` 아이콘 추가 (`apps/schedule`에 `lucide-react` 의존성 신규 설치), 텍스트-아이콘 간격 `gap-0.5`로 조정
- [x] `KanbanFilters.tsx`: 담당자/보고자/우선순위 select의 선택지 텍스트에도 "담당자: "/"보고자: "/"우선순위: " 접두어 추가 (선택 후 표시되는 값도 라벨이 붙도록)

## 하위 일정이 있는 상위 일정의 메인 보드 상태를 하위 일정 상태로부터 계산

상위 일정이 하위 일정을 가지면, 메인 칸반보드에서 상위 일정이 표시되는 컬럼을 상위 일정 자신의 status_id가 아니라 하위 일정들의 상태로부터 계산한다. 우선순위: 하나라도 지연됨/미완료 > 전부 완료 > 전부 검토 중 > 하나라도 시작(할 일이 아님) > (해당 없으면) 상위 일정 자신의 상태.

- [x] `kanbanUtils.ts`: `resolveEffectiveStatusId(subtasks, statuses)` 추가
- [x] `KanbanBoard.tsx`: `childrenByParent` 맵 추가, 컬럼별 필터링 시 `task.status_id` 대신 `effectiveStatusId(task)` 사용
- [x] pnpm build / pnpm lint 검증

## 메인 칸반보드의 "새 작업" 모달에서 하위 일정 함께 추가

메인 칸반보드에서 새 상위 일정을 만들 때, 같은 모달 안에서 하위 일정(제목 + 설명)을 여러 개 추가할 수 있어야 한다. 단 이 UI는 메인 보드의 신규 작업 생성(`!isEditing && !parentId`)에서만 노출되고, `/task/[id]`(하위 일정 생성)나 기존 일정 수정 모달에서는 지금처럼 동일하게 유지한다.

- [x] `TaskCreateModal.tsx`: `subtaskDrafts` 상태(제목/설명 배열) 추가, `canAddSubtasks = !isEditing && !parentId`일 때만 "+ 하위 일정 추가" UI 노출
- [x] `handleSubmit`: 상위 일정 생성 후 `canAddSubtasks`면 draft마다 `createTask(parentId: 상위 id)` 순차 호출, 제목 비어있는 draft는 건너뜀
- [x] `onSaved` 콜백 시그니처를 단일 `TasksRow` → `TasksRow[]`로 변경 (상위 일정 + 생성된 하위 일정들을 한 번에 전달)
- [x] `KanbanBoard.tsx`: `onSaved` 핸들러가 배열을 순회하며 `tasks` 상태에 upsert하도록 수정
- [x] pnpm build / pnpm lint 검증

## PR 전 코드리뷰 반영

- [x] `KanbanCard.tsx`: "바로가기" `Link`의 `onKeyDown`에 `stopPropagation` 추가 — 키보드로 링크에 포커스 후 Enter를 누르면 부모 카드(`role="button"`)의 keydown 핸들러로 이벤트가 버블링되어 `preventDefault()`가 링크의 기본 이동 동작을 막고 대신 편집 모달이 열리던 버그 수정
- [x] `TaskCreateModal.tsx`: 하위 일정 draft 중 일부 생성이 실패해도 조용히 무시되던 것을, 실패한 draft 제목을 모아 `window.alert`로 안내하도록 수정 (성공한 항목은 그대로 저장됨)
- [x] `KanbanHeader.tsx`: 주차 이동 링크를 `/?week=...` → `?week=...`로 변경 (상대 경로, 불필요한 `/` 제거)
- [ ] (다음 작업으로 분리) 하위 일정 draft에 담당자/보고자/우선순위를 지정할 수 있게 하는 것 — 현재는 항상 담당자/보고자 없음, 우선순위 "중간"으로 고정 생성됨

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
- [x] `AvailabilityTimePicker.tsx`: 시작/종료 시간 선택을 시(00~23) + 분(00/10/20/30/40/50) 두 개의 select로 분리
- [x] `AvailabilityTimePicker.tsx`: 배경 오버레이 클릭 시 `onCancel` 호출로 모달 닫힘 (모달 패널 클릭은 `stopPropagation`으로 전파 차단)
- [x] pnpm build / pnpm lint 검증

## 가능 시간 등록 모달 시간 선택을 스크롤 휠 피커로 변경

시(select) + 분(select) 드롭다운 두 개 대신, 오전/오후 + 시(1~12) + 분 세 열을 세로 스크롤로 고르는 휠 피커 UI로 바꾼다. 시작/종료 구분은 유지.

- [x] `calendar/_components/TimeWheelPicker.tsx` 신규 작성: `overflow-y-scroll` + `snap-mandatory`인 재사용 가능한 휠 컬럼(오전/오후, 시, 분)과 가운데 선택 밴드(상하 보더) 렌더링, 스크롤 종료 시 가장 가까운 항목을 선택값으로 커밋
- [x] `AvailabilityTimePicker.tsx`: 시작/종료 각각의 상태를 24시간 `hour`/`minute`에서 `period`("오전"/"오후") + `hour12`(01~12) + `minute`로 변경, `TimeWheelPicker`로 select 대체
- [x] pnpm build / pnpm lint 검증

## 일요일 날짜 빨간색 표시 + 공휴일 이름 표기

날짜 셀에서 일요일은 공휴일 여부와 무관하게 항상 빨간색으로 표시하고, 공휴일인 날짜는 숫자 옆에 공휴일 이름을 함께 보여준다. 겸사겸사 `holidays.ts`가 `date-holidays`가 반환하는 `date` 필드(대표일 1개)만 보고 있어서 설날/추석처럼 여러 날에 걸친 연휴의 앞뒤 날짜가 누락되던 것도 `start`~`end` 구간 전체를 펼치는 방식으로 함께 고친다.

- [x] `holidays.ts`: `getHolidayDates(): string[]` → `getHolidayNameMap(): Record<string, string>`로 변경, `date` 단일 필드 대신 `start`~`end` 구간을 `eachDayOfInterval`로 펼쳐서 연휴 전체 날짜에 이름을 매핑
- [x] `calendar/page.tsx`, `CalendarView.tsx`: `holidayDates: string[]` prop을 `holidayNames: Record<string, string>`로 교체
- [x] `CalendarGrid.tsx`: `day.getDay() === 0`(일요일) 조건을 색상 분기에 추가해 공휴일 여부와 무관하게 항상 `text-fg-state-error` 적용 (오늘 강조가 최우선인 것은 유지)
- [x] `CalendarGrid.tsx`: 공휴일이면서 해당 월에 속한 날짜에 한해 날짜 숫자 옆에 공휴일 이름을 작은 빨간 텍스트로 표시 (`truncate`로 셀 폭 안에 맞춤)
- [x] pnpm build / pnpm lint 검증

## 캘린더 페이지의 팀원 색상이 칸반보드와 다르게 보이던 문제 수정

팀원 색상은 `buildProfileColorMap`(`_lib/kanbanUtils.ts`)이 `profile.id`를 해시해 결정하는데, 캘린더 페이지가 실제 Supabase `profiles`가 아니라 `calendarMockData.ts`의 하드코딩된 가짜 프로필(`profile-1`, `profile-6`)을 쓰고 있어서 같은 사람이라도 칸반보드와 다른 id로 해시되어 다른 색이 나왔다. 캘린더도 칸반보드(`src/app/page.tsx`)와 동일하게 실제 `profiles` 테이블을 조회하도록 바꾼다. `availability`(가능 시간) 테이블 연동은 아직 하지 않으므로, 목업 시간 블록은 실제로 조회한 팀원 중 처음 두 명의 id를 그대로 사용하도록만 맞춘다.

- [x] `calendar/page.tsx`: `mockProfiles`/`mockProfileColorMap` 대신 `createClient()`로 Supabase `profiles` 테이블을 조회(`src/app/page.tsx`와 동일한 패턴)하고 `buildProfileColorMap`으로 직접 색상 맵 생성
- [x] `calendarMockData.ts`: `mockAvailability`가 하드코딩된 `"profile-1"`/`"profile-6"` 대신 인자로 받은 프로필 id 2개를 사용하도록 시그니처 변경, `MOCK_PROFILES`/`mockProfileColorMap`/`mockProfiles` 제거
- [x] pnpm build / pnpm lint 검증

## 이전/다음 화살표 버튼의 아이콘이 세로 중앙에서 벗어나 보이던 문제 수정

`‹`/`›` 유니코드 문자를 텍스트로 그대로 쓰다 보니 폰트마다 글리프가 자기 em box 안에서 위쪽으로 치우쳐 있어, `flex items-center`로 감싸도 시각적으로 중앙이 아닌 것처럼 보였다. `lucide-react`의 `ChevronLeft`/`ChevronRight` SVG 아이콘으로 교체해 근본적으로 고친다. 같은 패턴이 캘린더/칸반 양쪽에 반복돼 있어 전부 통일한다.

- [x] `lucide-react` 의존성 추가
- [x] `CalendarHeader.tsx`, `KanbanHeader.tsx`: `size-8` 이전/다음 버튼의 `‹`/`›` 텍스트를 `<ChevronLeft size={16} />`/`<ChevronRight size={16} />`로 교체
- [x] `MonthPickerPopover.tsx`, `DatePickerPopover.tsx`: 연/월 네비게이션 버튼의 `‹`/`›` 텍스트를 `<ChevronLeft size={14} />`/`<ChevronRight size={14} />`로 교체
- [x] pnpm build / pnpm lint 검증

## 캘린더 헤더 "캘린더" 텍스트 제거

- [x] `CalendarHeader.tsx`: `h1` "캘린더" 텍스트 제거, `KanbanHeader.tsx`에서 "메인 칸반보드" 텍스트를 지웠을 때와 동일하게 `justify-between` → `justify-end`로 변경해 네비게이션 그룹이 오른쪽 정렬되도록 유지
- [x] pnpm build / pnpm lint 검증

## 가능 시간 블록에 팀원 이름(성 제외) 표시

`CalendarGrid.tsx`의 시간 블록이 색상만으로 팀원을 구분하고 있어서, 시간 앞에 이름에서 성을 뗀 부분("이수현" → "수현")을 붙여 누구의 가능 시간인지 바로 알 수 있게 한다.

- [x] `CalendarGrid.tsx`: 시간 블록에 `profile.name.slice(1)` (성 제외 이름) + 공백을 시간 앞에 표시
- [x] pnpm build / pnpm lint 검증

## 코드리뷰 반영 (타임존 버그, 접근성, 캐싱)

- [x] `holidays.ts`: `new Date()`/`format()`이 서버 실행 환경의 로컬 타임존에 의존해 배포 환경(예: Vercel 기본 UTC)에서 공휴일 날짜가 밀리던 문제 수정 — date-fns 대신 epoch에 KST 오프셋(+9h)을 직접 더해 `toISOString()`으로 날짜를 뽑는 `toKstDateKey`로 교체, 타임존 무관하게 동일한 결과 나오는 것 재현 확인(UTC/Asia·Seoul/America·New_York)
- [x] `holidays.ts`: 연도별 공휴일 계산 결과를 모듈 스코프 `Map`으로 캐싱 (`getHolidayNameMapForYear`) — 매 `/calendar` 요청마다 음력 공휴일을 재계산하던 것을 방지
- [x] `TimeWheelPicker.tsx`: `WheelColumn`에 `role="listbox"`/`role="option"`/`aria-label`/`aria-selected`/`tabIndex` 추가, `ArrowUp`/`ArrowDown` 키보드로 값 변경 가능하도록 `onKeyDown` 추가, 항목 클릭으로도 바로 선택 가능하도록 `onClick` 추가 (기존 `<select>` 대비 키보드/스크린리더 접근성 회귀 수정)
- [x] pnpm build / pnpm lint 검증

## Supabase availability 테이블 연동 (캘린더 가능 시간 실제 저장/조회/삭제)

`availability` 테이블/RLS/타입은 이미 `0001_init.sql`, `src/types/tables/availability.ts`에 갖춰져 있어 마이그레이션은 추가하지 않는다. `calendarMockData.ts`의 목업 데이터를 걷어내고 실제 Supabase CRUD로 교체한다. 기능설계서(3. 캘린더 페이지) 기준: 시작/종료 시간 선택 후 확인 시 저장, 중복 시간대 등록 시 경고, 본인이 등록한 블록 클릭 시 삭제 버튼 노출.

- [x] `calendar/_lib/time.ts` 신규 작성: `to24HourTime(period, hour12, minute)` (오전/오후+12시간제 → DB `time` 포맷 변환, 오전 12시=00시/오후 12시=12시 처리), `formatTimeRange(start, end)` (HH:MM~HH:MM 표시), `rangesOverlap(aStart, aEnd, bStart, bEnd)` (문자열 비교로 중복 시간대 판정)
- [x] `calendar/_lib/actions.ts` 신규 작성: `createAvailability`/`deleteAvailability` 서버 액션 (`_lib/actions.ts`의 `createTask`/`updateTask` 패턴 재사용)
- [ ] `calendar/page.tsx`: 목업 `mockAvailability` 호출 제거, 그리드 표시 범위(6주) 기준으로 `availability` 테이블 실 조회, 로그인 사용자의 `currentProfileId` 함께 조회해 전달
- [ ] `calendarMockData.ts` 삭제, `CalendarGrid.tsx`/`CalendarView.tsx`의 `MockAvailabilityBlock` 참조를 `@/types/tables`의 `AvailabilityRow`로 교체 (`date`/`profileId`/`startTime`/`endTime` → `available_date`/`user_id`/`start_time`/`end_time`)
- [ ] `CalendarView.tsx`: `availability`를 client state로 끌어올려(`useState`) 생성/삭제 시 로컬에서 upsert/제거 (KanbanBoard의 `onSaved` 패턴과 동일), `currentProfileId`를 `AvailabilityTimePicker`/`CalendarGrid`에 전달
- [ ] `AvailabilityTimePicker.tsx`: "확인" 버튼을 `createAvailability` 호출로 연결, 제출 전 같은 사용자의 해당 날짜 기존 블록과 `rangesOverlap`으로 중복 검사해 겹치면 인라인 경고 표시 후 제출 막음, 성공 시 `onCreated` 콜백으로 부모 상태 갱신
- [ ] `CalendarGrid.tsx`: 날짜 셀을 `<button>`에서 `role="button"` `div`(`KanbanCard.tsx` 패턴)로 변경해 블록 내부에 실제 `<button>` 삭제 버튼을 중첩 가능하게 함, 본인이 등록한 블록 클릭 시 삭제 확인 버튼 노출 → `deleteAvailability` 호출 후 `onDeleted` 콜백
- [ ] pnpm build / pnpm lint 검증
