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
