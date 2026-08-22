-- 스프린트를 주차(weeks)에 종속시키지 않고, 자체 기간(시작일~종료일)을 갖는 독립 엔티티로 관리하기 위해
-- weeks.sprint_name(0006)을 sprints 테이블로 대체한다.
alter table public.weeks drop column sprint_name;

create table public.sprints (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

alter table public.sprints enable row level security;
create policy "authenticated_full_access" on public.sprints for all to authenticated using (true) with check (true);
