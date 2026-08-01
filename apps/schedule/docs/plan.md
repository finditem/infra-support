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
