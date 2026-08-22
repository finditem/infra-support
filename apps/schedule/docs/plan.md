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
- [x] `calendar/page.tsx`: 목업 `mockAvailability` 호출 제거, 그리드 표시 범위(6주) 기준으로 `availability` 테이블 실 조회, 로그인 사용자의 `currentProfileId` 함께 조회해 전달
- [x] `calendarMockData.ts` 삭제, `CalendarGrid.tsx`/`CalendarView.tsx`의 `MockAvailabilityBlock` 참조를 `@/types/tables`의 `AvailabilityRow`로 교체 (`date`/`profileId`/`startTime`/`endTime` → `available_date`/`user_id`/`start_time`/`end_time`)
- [x] `CalendarView.tsx`: `availability`를 client state로 끌어올려(`useState`) 생성/삭제 시 로컬에서 upsert/제거 (KanbanBoard의 `onSaved` 패턴과 동일), `currentProfileId`를 `AvailabilityTimePicker`에 전달
- [x] `AvailabilityTimePicker.tsx`: "확인" 버튼을 `createAvailability` 호출로 연결, 제출 전 같은 사용자의 해당 날짜 기존 블록과 `rangesOverlap`으로 중복 검사해 겹치면 인라인 경고 표시 후 제출 막음, 성공 시 `onCreated` 콜백으로 부모 상태 갱신
- [x] pnpm build / pnpm lint 검증 (삭제 기능 제외한 등록/조회 단계)
- [x] `CalendarGrid.tsx`: 날짜 셀을 `<button>`에서 `role="button"` `div`(`KanbanCard.tsx` 패턴)로 변경해 블록 내부에 실제 `<button>` 삭제 버튼을 중첩 가능하게 함, 본인이 등록한 블록 클릭 시 삭제 확인 버튼 노출 → `deleteAvailability` 호출 후 `onDeleted` 콜백
- [x] pnpm build / pnpm lint 검증

## 초대 링크에서 비밀번호+이름 동시 설정

관리자가 Supabase 대시보드에서 "Invite user"로 팀원을 초대하면, 팀원이 메일 링크를 클릭했을 때 비밀번호와 이름을 한 화면에서 함께 설정하도록 한다. 커스텀 SMTP 연결 및 Invite 이메일 템플릿의 링크를 `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite`로 수정하는 작업은 사용자가 Supabase 대시보드에서 직접 진행 (Claude가 할 수 없는 대시보드 설정).

- [x] `src/app/auth/confirm/route.ts` 신규 작성: `token_hash`/`type` 쿼리 파라미터를 받아 `supabase.auth.verifyOtp`로 세션 생성 후 `/invite/setup`으로 리다이렉트, 실패 시 `/login?error=invite_expired`로 리다이렉트
- [x] `src/app/invite/setup/page.tsx` 신규 작성: 이름/비밀번호/비밀번호 확인 입력 폼(`login/page.tsx` 스타일 재사용), 제출 시 `supabase.auth.updateUser({ password, data: { name } })` 호출 후 `profiles` 테이블의 `name`도 직접 update, 완료 시 `/`로 이동
- [x] `src/app/login/page.tsx`: `?error=invite_expired` 쿼리 파라미터가 있으면 안내 메시지 표시 (`useSearchParams` 사용으로 `LoginForm`을 분리하고 `Suspense`로 감쌈)
- [x] `middleware.ts`: `PUBLIC_PATHS`에 `/auth/confirm` 추가
- [x] pnpm build / pnpm lint 검증
- [x] (PR #145 Codex 리뷰 반영) `middleware.ts`: 로그인된 사용자가 초대 메일 링크를 열면 `verifyOtp` 실행 전에 `/`로 리다이렉트되던 버그 수정 — `PUBLIC_PATHS`를 `NO_AUTH_REQUIRED_PATHS`(`/login`, `/auth/confirm`)와 `GUEST_ONLY_PATHS`(`/login`만)로 분리

## 파비콘 추가 + 탭 타이틀 변경 + 로그인 화면 디자인 개선

- [x] `src/app/icon.svg` 신규 작성 (사용자 제공 로고 SVG) — Next.js App Router 파일 기반 메타데이터 컨벤션으로 자동 favicon 연결
- [x] `middleware.ts`: matcher에 `icon.svg`, `logo.svg` 제외 추가 — 비로그인 상태에서 `/icon.svg`, `/logo.svg` 요청이 `/login`으로 리다이렉트되어 파비콘/로고 이미지가 안 뜨던 버그 수정
- [x] `layout.tsx`: 탭 타이틀 "팀 일정 관리" → "찾길 팀 일정"
- [x] `public/logo.svg` 신규 작성 (icon.svg와 동일 내용) — 로그인 화면에서 `<img>`로 재사용
- [x] `login/page.tsx` 디자인 개선: 로고 이미지 + 앱명/부제 헤더 추가, 카드 스타일을 `TaskCreateModal.tsx` 패턴(`rounded-2xl`, 그림자)로 통일, 배경에 로고 색상 기반 은은한 radial gradient 블롭 추가, 이메일/비밀번호 입력에 `lucide-react` Mail/Lock 아이콘 추가, 초대 만료 안내 문구를 박스 스타일로 개선
- [ ] pnpm build / pnpm lint 검증

## 초대 계정 설정 화면(/invite/setup) 디자인을 로그인 화면과 통일

- [x] `invite/setup/page.tsx`: `login/page.tsx`와 동일한 배경 radial gradient 블롭, 카드 스타일(`rounded-2xl`, 그림자), 로고+타이틀 헤더 적용
- [x] `invite/setup/page.tsx`: 이름/비밀번호/비밀번호 확인 입력에 `lucide-react` 아이콘(User/Lock) 추가, `rounded-xl` 입력 스타일로 통일
- [ ] pnpm build / pnpm lint 검증

## 팀원 색상 랜덤 파스텔 배정으로 변경

`buildProfileColorMap`(`_lib/kanbanUtils.ts`)이 `profile.id`를 해시해 렌더링 시점마다 `hsl(hue 65% 45%)`를 즉석 계산하던 방식은, 가입 시점에 색을 "배정"하는 로직이 아예 없었고 hue 1차원만 랜덤이라 팀 규모가 작으면 특정 색상대(초록 계열)에 몰리는 문제가 있었다. 색상을 가입(초대) 시점에 DB에 저장하고, 겹치지 않는 파스텔 hue를 우선 배정하도록 바꾼다.

- [x] `supabase/migrations/0005_add_profile_color.sql` 신규 작성: `profiles.color text` 컬럼 추가, `assign_profile_color()` 함수(12개 파스텔 hue 후보 중 미사용 hue 우선 배정, 소진 시 랜덤 폴백), `handle_new_user()` 트리거가 가입 시 색을 함께 insert하도록 수정, 기존 행 backfill 후 `not null` 제약 추가
- [x] `src/types/tables/profiles.ts`: `ProfilesWritable`/`ProfilesInsert`에 `color` 필드 추가
- [x] `src/app/_types/kanban.ts`: `ProfileWithColor`를 `ProfilesRow`와 동일하게 단순화
- [x] `_lib/kanbanUtils.ts`: `hashToHue` 삭제, `buildProfileColorMap`을 DB에 저장된 `color`를 그대로 매핑하도록 단순화
- [x] `KanbanCard.tsx`, `KanbanProgress.tsx`, `ProfilePickerPopover.tsx`, `CalendarGrid.tsx`의 아바타 `text-white`를 어두운 고정 텍스트 색으로 교체 (파스텔 배경 대비 확보)
- [x] `CalendarGrid.tsx`의 삭제 확인 오버레이(`bg-white/20` 등)를 어두운 오버레이로 교체
- [x] pnpm build / pnpm lint 검증
- [ ] 마이그레이션 SQL을 사용자가 Supabase SQL 에디터에서 직접 적용 (Claude가 대신 실행 불가)

## 주차 헤더에 스프린트/주제 라벨 표시

메인 칸반보드 상단 `KanbanHeader`가 "2026년 8월 3주차" 텍스트만 보여주던 것에, 그 주가 속한 작업의 큰 주제(예: "1차 스프린트")를 함께 표시한다. 별도 sprints 테이블 대신 `weeks.sprint_name` 텍스트 컬럼을 추가하는 경량 방식으로 가고, 입력은 헤더 인라인 편집이 아니라 이미 계획만 되어 있던 `/settings` 라우트를 재활용한 관리 화면에서 한다. 캘린더 화면은 주 단위 개념이 없어 범위 밖.

- [x] `supabase/migrations/0006_add_week_sprint_name.sql` 신규 작성 (`weeks.sprint_name text` 컬럼 추가, RLS 정책 추가 불필요)
- [x] `src/types/tables/weeks.ts`: `WeeksWritable`에 `sprint_name: string | null` 추가, `WeeksInsert`에서 `created_at`과 동일하게 옵셔널 처리
- [x] `src/app/settings/_lib/actions.ts` 신규 작성: `updateWeekSprintName(weekId, sprintName)` 서버 액션 (`calendar/_lib/actions.ts` 패턴 재사용)
- [x] `src/app/settings/page.tsx` 신규 작성: `weeks` 전체를 `start_date` 내림차순 조회, `NavBar` 렌더링, `SprintSettingsTable`로 전달
- [x] `src/app/settings/_components/SprintSettingsTable.tsx` 신규 작성: 주차별 라벨(`getWeekLabel` 재사용)/기간/`sprint_name` 인라인 입력, blur 시 저장 후 `router.refresh()`
- [x] `src/components/NavBar.tsx`: `NAV_ITEMS`에 `{ href: "/settings", label: "설정" }` 추가
- [x] `src/app/_components/KanbanHeader.tsx`: `sprintName: string | null` prop 추가, 있을 때만 weekLabel 위에 배지로 표시
- [x] `src/app/page.tsx`: `KanbanHeader`에 `sprintName={weekRow.sprint_name}` 전달
- [x] pnpm build / pnpm lint 검증
- [ ] 마이그레이션 SQL을 사용자가 Supabase SQL 에디터에서 직접 적용 (Claude가 대신 실행 불가) — 아래 재설계로 0006 대신 0007을 적용할 것

## 스프린트를 주차 종속에서 기간 기반 독립 엔티티로 재설계

위 방식은 주차(`weeks`)마다 스프린트 이름을 매번 입력해야 해서 번거롭다는 피드백을 받았다. `weeks.sprint_name` 텍스트 컬럼 대신, 자체 기간(시작일~종료일)을 갖는 `sprints` 테이블을 새로 둔다. 설정 화면은 주차 목록을 순회하며 입력받는 표 대신, "+" 버튼으로 이름과 기간을 입력하면 새 스프린트가 목록 아래로 쌓이는 UI로 바꾼다. 칸반 헤더는 현재 주의 시작일이 어느 스프린트의 기간에 속하는지 조회해서 표시하며, 헤더 UI 자체(배지 위치/스타일)는 이전 작업에서 이미 확정된 것을 그대로 쓴다.

- [x] `supabase/migrations/0007_replace_week_sprint_name_with_sprints.sql` 신규 작성: `weeks.sprint_name` 컬럼 제거, `sprints(id, name, start_date, end_date, created_at)` 테이블 생성 및 `authenticated_full_access` RLS 정책 추가 (0006은 적용하지 않고 이 마이그레이션으로 대체)
- [x] `src/types/tables/weeks.ts`에서 `sprint_name` 제거(원복), `src/types/tables/sprints.ts` 신규 작성, `src/types/tables/index.ts`에 re-export 추가
- [x] `src/app/_lib/kanban.ts`: `getSprintForWeek(supabase, weekStart)` 추가 — 주어진 주 시작일이 `start_date`~`end_date` 범위에 포함되는 스프린트를 조회
- [x] `src/app/page.tsx`: `weekRow.sprint_name` 대신 `getSprintForWeek` 조회 결과를 `KanbanHeader`의 `sprintName`으로 전달
- [x] `src/app/settings/_lib/actions.ts`: `updateWeekSprintName`을 `createSprint({ name, startDate, endDate })`로 교체
- [x] `src/app/settings/page.tsx`: `weeks` 대신 `sprints` 전체를 `created_at` 오름차순 조회
- [x] `src/app/settings/_components/SprintSettingsTable.tsx` 삭제, `SprintList.tsx` 신규 작성: "+" 버튼 + 이름/기간(시작일~종료일) 입력 폼, 저장 시 입력값 초기화 후 목록 맨 아래에 추가
- [x] pnpm build / pnpm lint 검증
- [ ] 마이그레이션 SQL(0007)을 사용자가 Supabase SQL 에디터에서 직접 적용 (Claude가 대신 실행 불가)

## 스프린트 등록 폼 날짜 입력을 커스텀 캘린더 피커로 교체

`SprintList.tsx`의 시작일/종료일이 네이티브 `<input type="date">`라 UI가 볼품없다는 피드백을 받았다. 새 컴포넌트를 만드는 대신 이미 존재하는 `TaskCreateModal/DatePickerPopover.tsx`(할 일 마감일 선택에 쓰이는 월별 그리드 팝오버, `PropertyPopover` 셸 기반)를 재사용한다. `/calendar`의 `CalendarGrid.tsx`가 이미 쓰고 있는 관례(일요일 `text-fg-state-error`, 토요일 `text-primary`)를 `DatePickerPopover`에도 적용해, 할 일 생성 모달의 마감일 선택에도 함께 개선 효과가 생기도록 했다.

- [x] `DatePickerPopover.tsx`: `getDayClassName`/`getWeekdayHeaderClassName` 헬퍼(if-체인)를 추가해 그리드 내 일/토요일 텍스트와 요일 헤더에 각각 `text-fg-state-error`/`text-primary` 적용
- [x] `SprintList.tsx`: `<input type="date">` 2개를 `DatePickerPopover`(라벨 "시작일"/"종료일") 2개로 교체, `startDate`/`endDate` 초기값을 오늘 날짜로 변경, `canSubmit`에서 날짜 빈 값 체크 제거
- [x] pnpm build / pnpm lint 검증

## 스프린트 수정/삭제 기능 추가

목록에 추가만 가능하고 수정/삭제가 없어서 잘못 입력한 스프린트를 고칠 방법이 없었다. `CalendarGrid.tsx`의 가능 시간 삭제 확인 패턴("삭제할까요?" + 삭제/취소 인라인 전환)을 그대로 재사용해 삭제 시 확인 단계를 거치도록 하고, 수정은 행을 이름+기간 입력 폼으로 바꿔치기하는 인라인 편집 방식으로 구현한다.

- [x] `settings/_lib/actions.ts`: `updateSprint({ id, name, startDate, endDate })`, `deleteSprint(id)` 서버 액션 추가
- [x] `SprintList.tsx`: 각 행에 수정(연필 아이콘)/삭제(✕) 버튼 추가. 수정 클릭 시 해당 행이 이름 입력 + `DatePickerPopover` 2개 + 저장/취소 버튼으로 전환. 삭제 클릭 시 "삭제할까요?" 확인 상태로 전환 후 삭제/취소
- [x] pnpm build / pnpm lint 검증

## PR #156 자동 코드 리뷰 반영

- [x] `0007_replace_week_sprint_name_with_sprints.sql`: `weeks.sprint_name` 삭제를 `drop column if exists`로 변경(0006 미적용 상태에서도 0007만으로 실행 가능하도록), `sprints` 테이블에 `end_date >= start_date` 체크 제약 추가
- [x] `SprintList.tsx`: `canSubmit`/`canSaveEdit`에 `startDate <= endDate` 검증 추가
- [x] `SprintList.tsx`: `createSprint`/`updateSprint`/`deleteSprint` 실패 시 입력값을 초기화하거나 새로고침하지 않고 에러 메시지를 표시하며 상태 유지
- [x] `SprintList.tsx`: 추가 폼/수정 행에 `flex-wrap` 적용해 좁은 화면에서 줄바꿈되도록 수정
- [x] pnpm build / pnpm lint 검증

## Slack 알림 연동 (일정 생성/수정/삭제)

- [x] `profiles.slack_user_id` 컬럼 추가 마이그레이션 — `supabase/migrations/0008_add_profile_slack_user_id.sql`
- [x] `src/types/tables/profiles.ts`에 `slack_user_id` 반영
- [x] Slack 전송 모듈 (`chat.postMessage` 호출, 토큰 없으면 조용히 건너뜀) — `src/lib/slack/postSlackMessage.ts`
- [x] 이벤트별 메시지 본문 생성 (생성/수정/삭제, 멘션과 mrkdwn 이스케이프) — `src/lib/slack/buildTaskEventMessage.ts`
- [x] 채널 + 담당자/보고자 DM 전송 (행위자 본인과 Slack 계정 미연결 팀원 제외) — `src/lib/slack/notifyTaskEvent.ts`
- [x] DB 조회로 알림 payload 조립 (상태명, 담당자/보고자/행위자, 상위 일정 제목, 링크) — `src/app/_lib/taskNotification.ts`
- [x] `createTask`에 생성 알림 연결
- [x] `updateTask`에 수정 전 행 조회 + 변경 필드 diff 알림 연결
- [x] `deleteTask` 서버 액션 추가 (삭제 전 하위 일정 조회 후 물리 삭제, 삭제 알림 전송)
- [x] 일정 수정 모달에 삭제 버튼 + 확인 다이얼로그 추가
- [x] KanbanBoard에서 삭제된 일정(하위 포함) 목록에서 제거
- [x] `.env.example`에 `SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID`, `SITE_URL` 추가
- [x] 마이그레이션 `0008`(develop 병합 시 0006에서 번호 변경) SQL을 사용자가 Supabase SQL 에디터에서 직접 적용
- [x] Flow Bot 앱 확인: `chat:write`가 이미 부여되어 있어 스코프 추가와 재설치 불필요. 토큰/채널 ID/`SITE_URL`을 `.env`에 등록 완료
- [x] `profiles.slack_user_id`에 팀원 7명의 Slack 멤버 ID 입력
- [x] pnpm build / pnpm lint 검증

## Slack 알림을 DM 없이 채널 멘션으로 변경

- [x] `notifyTaskEvent`에서 DM 전송 제거, 팀 채널 한 곳으로만 전송
- [x] 담당자/보고자 멘션 줄을 생성/수정/삭제 모든 이벤트에 표시 (수정 알림에도 멘션이 들어가야 당사자에게 알림이 간다)
- [ ] 담당자/보고자가 알림 채널에 참여해 있는지 확인 (채널 밖 사용자를 멘션하면 Slack이 초대 안내를 띄운다)

## Slack 알림 동작 확인 (남은 작업)

- [ ] 워크트리 브랜치로 dev 서버를 띄워 일정 생성/수정/삭제 시 채널 메시지가 올라오는지 확인 (메인 워킹 디렉토리의 dev 서버는 develop 브랜치라 이 코드가 없다)
- [ ] `select name, slack_user_id from public.profiles order by name;`으로 `slack_user_id`가 null인 팀원이 없는지 확인
- [ ] Vercel 환경 변수에 `SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID`, `SITE_URL` 등록 (배포 시점)

## PR #154 리뷰 반영 (Slack 전송과 저장 응답 분리)

- [x] `postSlackMessage`의 `fetch`에 `AbortSignal.timeout` 5초 상한 추가 (Slack이 응답하지 않을 때 서버리스 함수가 매달리지 않도록)
- [x] `createTask`/`updateTask`/`deleteTask`에서 알림 호출을 `next/server`의 `after()`로 감싸 저장 성공 응답을 지연시키지 않도록 변경

## 팀(그룹) 관리 기능 추가

팀원을 프론트엔드/백엔드/기획처럼 그룹으로 묶어 관리한다. 한 사람이 여러 팀에 속할 수 있다. 이후 캘린더/칸반에서 "@프론트엔드"처럼 팀 단위로 언급해 일정을 추가하는 기능의 기반이 되며, 이번 작업에서는 설정 페이지까지만 만들고 언급 연동은 다음 단계로 미룬다.

- [x] `supabase/migrations/0009_teams.sql` 신규 작성: `teams`(name unique, 언급용 slug unique, color, created_by, created_at/updated_at), `team_members`(team_id/profile_id 복합 기본키, 팀 삭제 시 cascade), 두 테이블 모두 기존과 동일한 `authenticated_full_access` RLS 정책
- [x] `0005_add_profile_color.sql`의 `assign_profile_color()`를 대상 테이블만 파라미터로 받는 `assign_pastel_color(regclass)`로 일반화하고, `assign_profile_color()`/`assign_team_color()`는 그 함수를 호출하는 얇은 래퍼로 둠 (`handle_new_user()`가 부르는 이름과 시그니처가 그대로라 기존 profiles 동작은 변하지 않는다)
- [x] `prepare_team()` 트리거 함수: insert/update 전에 팀명을 trim하고, 공백을 제거한 언급 슬러그를 만들고, insert 시 색상을 배정한다. `set_updated_at` 트리거도 함께 연결
- [x] 마이그레이션 안에서 `set_updated_at()`을 `create or replace`로 함께 정의: `0001_init.sql`에는 있지만 실제 Supabase 프로젝트에는 없고 같은 본문의 `handle_updated_at()`이 대신 쓰이고 있어, 트리거 생성이 `42883`으로 실패했다
- [x] 마이그레이션 번호를 `0006`에서 `0009`까지 두 차례 변경: `0006`/`0007`은 스프린트 재설계, `0008`은 `feat/slack-notification`이 develop에 먼저 병합되며 가져갔다
- [x] `src/types/tables/teams.ts`, `src/types/tables/team_members.ts` 신규 작성 및 `src/types/tables/index.ts`에 re-export 추가 (team_members는 복합 기본키라 Row에 id가 없다)
- [x] `src/app/_types/teams.ts` 신규 작성: `TeamWithMembers = TeamsRow & { members: ProfileWithColor[] }`
- [x] `src/app/_lib/profiles.ts` 신규 작성: `getRegisteredProfiles(supabase)` — 칸반/캘린더/팀 관리 세 페이지에 같은 조회가 중복돼 있어서 분리하고 기존 두 페이지도 이 함수를 쓰도록 교체
- [x] `src/app/_lib/teams.ts` 신규 작성: `getTeamsWithMembers(supabase, profiles?)` — 팀 목록에 멤버를 붙여 반환. 이후 캘린더/칸반에서도 그대로 쓴다
- [x] `src/app/settings/teams/_lib/actions.ts` 신규 작성: `createTeam`/`updateTeam`/`deleteTeam`/`addTeamMember`/`removeTeamMember`. 팀명 중복은 unique 위반(`23505`)을 받아 호출부에 알리고, 변경 후 `revalidatePath("/settings/teams")` 호출
- [x] `src/app/settings/teams/page.tsx` 신규 작성 (Server Component에서 팀/멤버/팀원 조회), `src/app/settings/page.tsx`는 `/settings/teams`로 redirect
- [x] `src/app/settings/teams/_components/TeamsManager.tsx`: 팀 추가 폼과 팀 목록. 중복 팀명은 "이미 있는 팀명입니다"로 안내
- [x] `src/app/settings/teams/_components/TeamCard.tsx`: 팀 색상 점, 팀명 인라인 수정, 언급 슬러그 표시, 멤버 아바타와 제거 버튼, 멤버 추가 팝오버, 인라인 삭제 확인(`confirm()` 미사용)
- [x] `src/components/NavBar.tsx`에 "설정" 링크 추가. 하위 경로에서도 활성으로 보이도록 접두어 판정 함수 분리, 조건부 className을 `cn()`으로 교체
- [x] `src/app/_components/ProfileAvatar.tsx` 신규 작성: 이니셜 아바타 마크업이 네 군데에 복사돼 있어서 크기 prop을 가진 공용 컴포넌트로 분리하고 `KanbanCard`/`KanbanProgress`/`ProfilePickerPopover`를 교체
- [x] `src/hooks/usePopoverPosition.ts`, `src/hooks/useOutsideClose.ts` 신규 작성: `PropertyPopover`의 위치 계산과 바깥 클릭 닫힘 로직을 훅으로 분리해 `MentionPicker`와 함께 쓰도록 함
- [x] `ProfilePickerPopover`를 `TaskCreateModal/`에서 `src/app/_components/`로 올리고 `label` 옵셔널, `allowClear`, `triggerClassName` prop 추가 (기본값은 기존 동작과 동일)

### 다음 단계에서 연결 (이번에는 사용처 없음)

아래 두 파일은 캘린더/칸반의 언급 기반 일정 추가에서 쓸 부품이라 이번 작업에서는 어디에서도 import하지 않는다.

- [x] `src/app/_lib/mentions.ts`: `MentionTarget`, `buildMentionTargets`, `parseMentions`(슬러그가 긴 후보부터 매칭), `resolveMentionProfiles`, 그리고 입력 필드 연결에 필요한 `getActiveMention`/`insertMention`/`filterMentionTargets`
- [x] `src/app/_components/MentionPicker.tsx`: "@" 입력 시 뜨는 언급 대상 팝오버. 팀은 색상 점과 멤버 수, 개인은 아바타로 구분하고 위/아래/Enter/Esc로 선택 가능
- [ ] 캘린더의 개인 일정 추가와 칸반의 일정 추가 입력에 `MentionPicker`를 연결하고, 저장 시 `parseMentions` + `resolveMentionProfiles`로 대상 팀원을 확정하는 작업
- [x] `supabase/migrations/0009_teams.sql`을 사용자가 Supabase SQL 에디터에서 직접 적용 (적용 후 teams_prepare/teams_set_updated_at 트리거 동작 확인 완료)

## develop 병합 충돌 해결 (PR #155)

- [x] `src/components/NavBar.tsx`: "설정" 링크를 `/settings/teams`가 아니라 develop이 만든 `/settings`로 되돌린다. 하위 경로 접두어 판정은 그대로 두어 팀 관리에서도 "설정"이 활성으로 남는다
- [x] `src/app/settings/_components/SettingsTabs.tsx` 신규 작성: 스프린트(`/settings`)와 팀 관리(`/settings/teams`)를 오가는 탭. 두 페이지에서 함께 쓰므로 별도 파일로 둔다
- [x] `src/app/settings/page.tsx`: `/settings/teams`로 보내던 redirect를 없애고 develop의 스프린트 목록 페이지를 그대로 쓰되 상단에 탭을 붙인다
- [x] `src/app/settings/teams/page.tsx`: 같은 탭을 상단에 붙인다
- [x] `src/app/page.tsx`: develop의 `getSprintForWeek`와 이 브랜치의 `getRegisteredProfiles` import를 모두 남긴다
- [x] `supabase/migrations/0008_teams.sql`을 `0009_teams.sql`로 변경: develop이 `0008_add_profile_slack_user_id.sql`을 먼저 가져갔다. SQL 본문은 그대로라 이미 적용한 Supabase 프로젝트에 다시 적용할 필요는 없다
- [x] pnpm build / pnpm lint 검증

## 다크모드 "새 작업" 모달 input/textarea 배경색 수정

`TaskCreateModal.tsx`의 제목 input, 설명 textarea(상위+하위 일정 모두)에 배경색 클래스가 아예 없어 브라우저 기본 폼 컨트롤 배경이 노출되고, 다크모드에서 모달 배경(`bg-surface-elevated`)과 어우러지지 않는 문제 수정.

- [x] `TaskCreateModal.tsx`: 제목 input, 설명 textarea, 하위 일정 제목 input, 하위 일정 설명 textarea className에 `bg-transparent` 추가
- [x] pnpm build / pnpm lint 검증

## 일정 등록 모달 제목 변경 + 12/24시간 표시 전환

모달 제목을 "가능 시간 등록"에서 "일정 등록"으로 바꾸고, 기존 오전/오후 휠은 그대로 두되 우상단 "24시간" 버튼으로 시 열을 00~23으로 바꿔 볼 수 있게 한다. 겸사겸사 ESC로 모달을 닫는 것도 함께 넣는다.

- [x] `calendar/_hooks/useEscapeKey.ts` 신규 작성: document에 keydown을 붙여 ESC 입력 시 콜백 호출, `enabled`로 구독 여부 제어. `AvailabilityTimePicker`와 `CalendarGrid` 두 곳에서 쓰므로 페이지 전용 `_hooks/`로 분리하고 배럴(`_hooks/index.ts`)로 내보냄
- [x] `_lib/time.ts`: 모달과 휠이 주고받는 값을 항상 24시간제(`TimeValue`)로 통일. `to24HourTime(period, hour12, minute)` → `toDbTime(time)`으로 교체하고, 12시간제 표시용 변환 `toPeriodHour`/`to24Hour` 추가 (12/24 전환 시 고른 시각이 유지되도록)
- [x] `TimeWheelPicker.tsx`: `is24Hour` prop 추가 — false면 기존과 동일한 오전/오후 + 시(01~12) + 분, true면 오전/오후 열이 빠지고 시(00~23) + 분. 값은 `TimeValue` 하나로 받고 내부에서 표시 형식만 변환
- [x] `TimeWheelPicker.tsx`: 초기 스크롤 위치만 맞추던 `useEffect`의 의존성을 `[value, values]`로 수정 — 12/24 전환으로 값과 후보 목록이 바뀌어도 휠이 따라 움직이도록 함(이미 그 위치면 스크롤하지 않아 사용자 조작을 방해하지 않음)
- [x] `AvailabilityTimePicker.tsx`: 제목 "가능 시간 등록" → "일정 등록", 제목 우측에 "24시간" 토글 버튼 추가(`aria-pressed`로 상태 표시)
- [x] `AvailabilityTimePicker.tsx`: 토글 상태를 `localStorage`(`schedule:availability-time-format`)에 저장해 다음 등록 때도 유지. 접근이 막힌 환경에서는 기본값 12시간제로 동작
- [x] `AvailabilityTimePicker.tsx`: ESC로 모달 닫기
- [x] `CalendarGrid.tsx`: 날짜 셀 버튼의 `aria-label`을 "가능 시간 추가"에서 "일정 등록"으로 통일
- [x] `CalendarGrid.tsx`: 삭제 확인을 ESC로 취소, 확인이 떠 있는 동안 전체 화면 클릭 흡수 레이어를 깔아 바깥 클릭으로도 취소(뒤 날짜 셀의 등록 모달이 같이 열리지 않도록 클릭을 막음)
- [x] pnpm build / pnpm lint 검증
- [x] (PR #157 Codex 리뷰 반영) `CalendarGrid.tsx`: 클릭 흡수 레이어를 `z-30`에서 `z-[5]`로 낮춰 삭제 확인의 삭제/취소 버튼이 눌리지 않던 문제 수정 — 시간 블록 목록(`relative z-10`)이 스택 컨텍스트라 그 안의 확인 버튼이 레이어 위로 올라올 수 없었다

## 설정 페이지 레이아웃 통일 (스프린트 기준)

스프린트와 팀 관리는 탭으로 오가는 같은 화면인데 각각 다른 브랜치에서 만들어져 본문 너비, 여백, 모서리 반경, 폼과 목록 행의 형태가 서로 달랐다. 탭을 옮길 때마다 화면이 흔들려 보여서 팀 관리를 스프린트 형식에 맞춘다.

- [x] `src/app/settings/_lib/styles.ts` 신규 작성: 두 페이지가 함께 쓰는 입력, 추가 버튼, 목록 행, 아이콘 버튼, 글자 버튼 클래스 상수를 분리 (기준값은 스프린트 쪽 그대로)
- [x] `src/app/settings/_components/SprintList.tsx`: 파일 안에 있던 `inputClassName`과 인라인 클래스를 `_lib/styles.ts`의 상수로 교체 (겉모습은 그대로)
- [x] `src/app/settings/teams/page.tsx`: `max-w-3xl` 가운데 정렬과 설명 문구를 걷어내고 스프린트 페이지와 같은 `flex-1 px-8 py-6` 본문에 같은 형태의 제목만 둔다
- [x] `src/app/settings/teams/_components/TeamsManager.tsx`: 채워진 "팀 추가" 버튼과 `rounded-xl` 입력을 스프린트와 같은 정사각형 `+` 버튼과 입력으로 교체하고, 팀명이 비면 버튼을 비활성으로 둔다. 빈 목록 안내도 점선 상자에서 한 줄 문구로 바꾼다
- [x] `src/app/settings/teams/_components/TeamCard.tsx`: 카드(`rounded-2xl`, `p-5`)를 스프린트 행(`rounded-lg`, `px-4 py-2.5`)으로 맞추고, 팀명 클릭 대신 오른쪽 연필/✕ 아이콘 버튼으로 수정·삭제를 시작하도록 바꾼다. 수정 중에는 행 테두리를 강조하고 삭제 확인은 행 전체를 "삭제할까요?"로 바꾸는 스프린트 방식을 따른다

## 팀 관리 폼 순서와 목록 행 두 줄 구성

- [x] `src/app/settings/_lib/styles.ts`: 정사각형 추가 버튼 전용이던 `settingsAddButtonClassName`을 크기를 뺀 `settingsFormButtonClassName`으로 일반화해 스프린트의 아이콘 버튼과 팀 관리의 글자 버튼이 같은 테두리와 배경을 쓰도록 한다
- [x] `src/app/settings/teams/_components/TeamsManager.tsx`: `[+] 인풋` 순서를 `인풋 [생성]`으로 바꾼다. 스프린트 폼은 `[+]`가 앞에 오는 지금 순서를 그대로 둔다 (사용자 확인)
- [x] `src/app/settings/teams/_components/TeamsManager.tsx`: 팀 목록을 한 열에서 넓은 화면(xl 이상) 두 열 그리드로 바꾼다. 태블릿과 모바일에서는 카드 안의 멤버 칩이 금방 줄바꿈되므로 한 열을 유지한다
- [x] `src/app/settings/teams/_components/TeamCard.tsx`: 카드 안 내용을 두 줄로 나눴다가 원래의 한 줄 구성(색상 점, 팀명, 슬러그, 멤버 수, 수정/삭제 아이콘)으로 되돌린다. 목록을 두 열로 나누는 것이 요청이었고 카드 자체는 그대로여야 한다

## 다크/라이트 모드 전환 애니메이션

- [x] `src/app/globals.css`: `html.theme-transition` 아래에서만 배경, 테두리, 글자, 아이콘, 그림자, 투명도, 변형의 전환을 켜는 규칙 추가. 전환을 항상 켜두면 hover 등 다른 전환 시간이 함께 늘어나므로 테마를 바꾸는 순간에만 적용한다. `prefers-reduced-motion: reduce`에서는 전환을 끈다
- [x] `src/components/ThemeToggle.tsx`: `setTheme` 직전에 `theme-transition` 클래스를 붙이고 전환 시간이 지나면 떼어낸다. 언마운트 시 타이머를 정리한다
- [x] `src/components/ThemeToggle.tsx`: 해와 달 아이콘을 조건부 렌더링에서 겹쳐 두는 방식으로 바꿔 회전하며 교차 페이드되도록 한다

## 테마 전환을 원형 확산으로 교체

- [x] `src/components/ThemeToggle.tsx`: `document.startViewTransition`으로 클릭한 버튼 중심에서 원이 퍼지며 새 테마가 드러나도록 한다. 원의 반지름은 클릭 지점에서 화면의 가장 먼 모서리까지의 거리로 계산한다
- [x] `src/app/globals.css`: `::view-transition-old/new(root)`의 기본 교차 페이드를 끄고, 토글 버튼에 `view-transition-name`을 주어 원이 퍼지는 동안 버튼이 그 위에 남도록 한다
- [x] View Transitions를 지원하지 않는 브라우저와 `prefers-reduced-motion: reduce`에서는 기존 `.theme-transition` 색상 페이드로 대체한다
- [x] 토글 버튼에 hover 확대와 클릭 축소를 더하고, 해와 달 아이콘 교차 페이드 시간을 원이 퍼지는 시간에 맞춘다

## 일정별 댓글과 멘션 (feat/task-comments)

보고자가 검토 의견을 남길 곳이 일정 본문(`tasks.body`) 하나뿐이라 일정마다 대화가 쌓이지 않던 문제를 해결한다. `docs/기능설계서.md`에는 댓글 기능이 아예 없어(6. 공통 컴포넌트 표에도 댓글 관련 항목이 없다) 이번 작업으로 새로 정의한다. 멘션은 이후 Slack 알림(기능설계서 9. 개발 일정의 5단계)이 발송 대상을 판단하는 근거로 쓰이므로, 이번 범위에서 알림 발송은 만들지 않되 누가 누구를 멘션했는지는 DB에 관계로 남긴다.

- [x] `supabase/migrations/0010_add_task_comments.sql` 신규 작성: `task_comments`(task_id/author_id/body/created_at/updated_at), `task_comment_mentions`(comment_id/mentioned_profile_id, `(comment_id, mentioned_profile_id)` 유니크), 두 테이블 RLS 활성화 + 기존과 동일한 `authenticated_full_access` 단일 정책, 외래키 인덱스 2개, `task_comments`에 기존 `set_updated_at` 트리거 연결
- [x] `src/types/tables/task_comments.ts`, `src/types/tables/task_comment_mentions.ts` 신규 작성 후 `src/types/tables/index.ts`에 re-export
- [x] (폐기) 자체 멘션 유틸 `src/utils/mentionUtils.ts`를 만들었다가, develop이 팀 관리와 함께 도입한 언급 기반 코드로 갈아끼우면서 제거했다. 아래 통합 항목 참고
- [x] (폐기) 입력창에 마커 원문이 보이던 문제를 표시 형식과 저장 형식 분리로 고쳤으나, 저장 형식이 평문 `@슬러그`로 바뀌면서 이 구분 자체가 필요 없어졌다
- [x] 멘션 판정 기준을 "자동완성으로 고른 팀원"에서 "후보 목록과 일치하는 `@슬러그`"로 변경. 붙여넣거나 직접 친 것이 멘션으로 잡히지 않아 입력 방법에 따라 결과가 갈리던 문제를 고친 것이고, develop의 `parseMentions`도 같은 방식이라 통합 후에도 유지된다
- [x] 1분이 안 된 댓글의 시각 표기를 date-fns 기본값 "1분 미만 전" 대신 "1분 전"으로 통일 (`CommentItem`의 `formatCommentTime`)
- [x] `src/app/_lib/commentActions.ts` 신규 작성: `createComment`/`updateComment`/`deleteComment`. RLS가 로그인 사용자 전체 접근이라 작성자 본인 제약은 쿼리의 `author_id` 조건으로 강제한다. 멘션은 `syncCommentMentions`가 삭제 후 재삽입으로 동기화하고, 실패해도 댓글 저장은 성공 처리하고 로그만 남긴다
- [x] `src/app/_lib/kanban.ts`에 `getCommentsForTasks` 추가: 화면에 필요한 일정 전체의 댓글을 `in(task_id, ...)` 한 번으로 조회해 카드별 개수 조회가 N+1이 되는 것을 막는다
- [x] `src/app/_components/ProfileAvatar.tsx` 신규 작성: 팀원 색상 배경 + 이니셜 원형 아바타 (댓글 목록과 멘션 자동완성 두 곳에서 쓰므로 분리)
- [x] `src/app/_components/TaskComments/` 신규 작성: `TaskComments`(목록 + 입력창 조립, 댓글 배열은 상위가 소유), `CommentItem`(아바타/이름/상대 시간/멘션 강조, 본인 댓글 수정·삭제), `CommentEditor`(textarea + 커맨드+엔터 등록, 새 댓글과 수정에 공용), `MentionAutocomplete`(입력창 아래 흐름에 펼쳐지는 후보 목록, 키보드 위아래·엔터 선택)
- [x] `TaskCreateModal.tsx`: 편집 모드에서만 스크롤되는 본문 하단에 댓글 섹션 렌더링. 생성 모드에는 표시하지 않는다
- [x] `KanbanBoard.tsx`: 댓글 배열을 상태로 소유하고 `commentCountByTask`를 계산해 컬럼으로 내려보냄. 편집 중인 일정의 댓글만 잘라 모달에 전달하고 변경분을 되돌려받는다
- [x] `KanbanColumn.tsx`, `KanbanCard.tsx`: 카드 하단에 댓글 개수 배지 표시 (하위 일정 개수와 같은 줄)
- [x] `src/app/page.tsx`, `src/app/task/[id]/page.tsx`: 서버 컴포넌트에서 댓글을 한 번에 조회해 전달
- [x] `src/app/task/[id]/_components/TaskCommentsPanel.tsx` 신규 작성: 상세 페이지에서 상위 일정의 댓글 카드
- [x] 마이그레이션 SQL을 사용자가 Supabase SQL 에디터에서 직접 적용. 적용 과정에서 원격 DB에 `0001_init.sql`의 `set_updated_at()` 함수가 없다는 것이 드러나 마이그레이션이 그 함수를 `create or replace`로 직접 선언하도록 수정했다. `tasks` 테이블에는 이름이 다른 `tasks_updated_at` 트리거가 이미 걸려 있어 `updated_at` 갱신 자체는 동작하고 있다. 원격 스키마가 마이그레이션 파일과 여러 곳에서 어긋나 있으므로(파일에 없는 `task_reasons` 테이블도 존재) 언젠가 전체 대조가 필요하다
- [x] 마이그레이션 번호를 `0010`으로 조정했다. develop이 스프린트 작업(`0006`, `0007`), Slack 알림(`0008`), 팀 관리(`0009`)로 앞 번호를 모두 가져가서 develop을 머지할 때마다 내렸다
- [x] develop이 도입한 `ProfileAvatar`(size 변형과 `profile` 객체를 받는 상위 호환)로 교체. 댓글 목록과 멘션 자동완성에서 쓰던 자체 아바타를 걷어내고, 작성자 프로필을 찾지 못한 경우만 회색 폴백을 남겼다
- [x] 멘션 구현을 develop의 언급 기반 코드로 통합. `feat/teams`가 `_lib/mentions.ts`, `_components/MentionPicker.tsx`, `usePopoverPosition`/`useOutsideClose` 훅을 만들어 뒀으나 아직 쓰이는 곳이 없었고, 제 자체 구현과 역할이 정확히 겹쳐 한 앱에 멘션 처리가 두 벌 있는 상태였다. 자체 `mentionUtils.ts`와 `MentionAutocomplete.tsx`를 제거하고 develop 것으로 갈아끼웠다
- [x] 저장 형식을 `@[이름](profile_id)` 마커에서 `@슬러그` 평문으로 변경. 이에 따라 댓글에서도 팀 언급(`@프론트엔드`)이 되고, 팀을 언급하면 `resolveMentionProfiles`가 소속 팀원까지 펼쳐 `task_comment_mentions`에 남긴다. 반대로 팀원이 개명하면 기존 댓글의 언급 강조가 끊기고 동명이인은 아예 언급으로 잡히지 않는데, 이는 develop이 택한 규칙을 그대로 따른 결과다. 알림 대상 기록은 저장 시점에 관계 테이블로 남으므로 영향받지 않는다
- [x] 본문 강조용 `splitMentionSegments`를 `_lib/mentions.ts`에 추가하고 기존 `parseMentions`를 그 위에 다시 얹었다. 언급 판정 규칙(경계 문자, 긴 슬러그 우선, 동명이인 제외)이 두 벌로 갈라지지 않도록 한 것이다
- [x] 언급 후보를 만들기 위해 `page.tsx`와 `task/[id]/page.tsx`에서 `getTeamsWithMembers`로 팀을 함께 조회하고 `buildMentionTargets`로 합쳐 내려보낸다. 이미 조회한 profiles를 넘겨 중복 조회를 피한다
- [x] `MentionPicker`는 Escape를 window에서 가로채 스스로 닫지만 전파까지 막지는 않아, 그대로 두면 자동완성을 닫으려던 Escape가 모달까지 올라가 모달이 함께 닫힌다. `CommentEditor`에서 언급 입력 중일 때만 전파를 막아 해결했다
- [x] (PR #160 Codex 리뷰 반영, P2) 언급 자동완성이 열린 상태에서 커맨드+엔터를 누르면 잘린 본문이 저장되던 버그 수정. 팝오버가 window 캡처 단계에서 Enter를 먼저 받아 언급을 삽입하지만 전파는 막지 않아, 삽입이 반영되기 전의 `@검색어` 상태로 저장되고 입력창까지 비워지고 있었다. 언급 입력 중에는 제출을 건너뛴다
- [x] (PR #160 Codex 리뷰 반영, P1) `task_comments`와 `task_comment_mentions`의 RLS를 작성자 소유권 기준으로 나눔. 이 앱은 별도 백엔드 없이 클라이언트가 anon key로 PostgREST에 직접 접근해서, 정책이 `using (true)`이면 서버 액션의 `author_id` 조건만으로는 작성자 제한이 강제되지 않고 로그인한 팀원이 남의 댓글을 고치거나 지울 수 있었다. 읽기는 팀 전체에 열고 쓰기만 본인으로 제한했다. 다른 테이블의 `authenticated_full_access` 단일 정책 방침에서 벗어나는 부분이라 마이그레이션 주석에 이유를 남겼다
- [ ] 바뀐 RLS 정책을 원격에 적용 (마이그레이션의 정책 블록만 재실행하면 되도록 `drop policy if exists`를 앞에 뒀다)
- [x] pnpm build / pnpm lint 검증 (검증 중 발견한 `perfectionist/sort-jsx-props` 경고 2건 수정). dev 서버와 `next build`가 같은 `.next` 디렉토리를 공유하므로, 검증 전에 dev 서버를 내리고 `.next`를 지운 뒤 빌드한다
- [x] 실제 화면에서 댓글 생성/수정/삭제, 멘션 자동완성과 강조, 라이트/다크 모드 확인
- [x] 멘션 자동완성 목록을 키보드로 이동할 때 활성 항목이 목록 밖으로 밀려나도 스크롤되지 않던 버그 수정 (`MentionAutocomplete`에서 활성 항목을 `scrollIntoView({ block: "nearest" })`로 끌어온다)
- [x] 모바일 폭에서 모달 안 댓글 섹션까지 스크롤되는지 확인
