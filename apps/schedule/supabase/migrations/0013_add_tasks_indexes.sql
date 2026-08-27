-- tasks.week_id/parent_id는 외래키지만 Postgres는 외래키 컬럼에 인덱스를 자동으로 만들지 않는다.
-- 칸반보드가 주차를 이동할 때마다 week_id로 필터링하고(getTasksForWeek의 root task 조회),
-- 하위 일정을 parent_id로 조회하므로(같은 함수의 child task 조회) 인덱스가 없으면
-- tasks가 늘어날수록 두 조회 모두 전체 스캔 비용이 커진다.
create index tasks_week_id_idx on public.tasks (week_id);
create index tasks_parent_id_idx on public.tasks (parent_id);
