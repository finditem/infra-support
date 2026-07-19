-- 팀 일정 관리 툴 초기 스키마
-- 별도 Supabase 프로젝트 전용 (모니터링 프로젝트와 완전히 분리된 DB)

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- 작업 상태는 6개 고정값이며 커스터마이징 UI를 두지 않는다 (color: DESIGN.md 팔레트 기준)
create table public.task_statuses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null,
  order_index int not null,
  created_at timestamptz not null default now()
);

insert into public.task_statuses (name, color, order_index) values
  ('할 일', '#8a8f98', 1),
  ('진행 중', '#5e6ad2', 2),
  ('검토 중', '#f2c94c', 3),
  ('완료', '#10b981', 4),
  ('지연됨', '#f2994a', 5),
  ('미완료', '#eb5757', 6);

create table public.weeks (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  week_number int not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  unique (year, week_number)
);

-- title/body는 기획서 v1의 description을 기능설계서 v2 표기(body)로 통합한 결과
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  status_id uuid not null references public.task_statuses (id),
  assignee_id uuid references public.profiles (id),
  reporter_id uuid references public.profiles (id),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  due_date date,
  parent_id uuid references public.tasks (id) on delete cascade,
  week_id uuid references public.weeks (id),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  available_date date not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);

create table public.status_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  status_id uuid not null references public.task_statuses (id),
  reason text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- RLS: 기획서의 "MVP 단계는 권한을 단순하게 가져간다" 방침에 따라
-- 로그인한 사용자는 전체 테이블에 대해 CRUD 가능하도록 단일 정책만 둔다.
alter table public.profiles enable row level security;
alter table public.task_statuses enable row level security;
alter table public.weeks enable row level security;
alter table public.tasks enable row level security;
alter table public.availability enable row level security;
alter table public.status_history enable row level security;

create policy "authenticated_full_access" on public.profiles for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.task_statuses for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.weeks for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.tasks for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.availability for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.status_history for all to authenticated using (true) with check (true);

-- tasks.updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

-- 관리자가 Supabase 대시보드에서 계정을 생성하면(auth.users insert) profiles 행을 자동 생성한다.
-- 기획서 방침대로 별도 회원가입 화면은 두지 않는다.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
