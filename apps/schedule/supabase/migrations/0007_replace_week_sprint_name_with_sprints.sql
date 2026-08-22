-- 스프린트를 주차(weeks)에 종속시키지 않고, 자체 기간(시작일~종료일)을 갖는 독립 엔티티로 관리하기 위해
-- weeks.sprint_name(0006)을 sprints 테이블로 대체한다.
-- 0006을 건너뛰고 이 마이그레이션만 적용하는 것이 문서화된 경로이므로, 컬럼이 없어도 실패하지 않도록 if exists를 쓴다.
alter table public.weeks drop column if exists sprint_name;

create table public.sprints (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  constraint sprints_end_date_after_start_date check (end_date >= start_date)
);

alter table public.sprints enable row level security;
create policy "authenticated_full_access" on public.sprints for all to authenticated using (true) with check (true);
