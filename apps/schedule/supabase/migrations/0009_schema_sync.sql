-- 원격 Supabase 프로젝트의 실제 스키마와 이 디렉토리의 마이그레이션 파일을 일치시킨다.
--
-- 0001_init.sql은 적용 기록이 아니라 사후에 손으로 작성한 문서라, 원격에는 처음부터
-- 파일과 다른 부분이 있었다. 그 결과 파일만 보고 새 Supabase 프로젝트를 세팅하면
-- 운영 중인 DB와 다른 스키마가 만들어지는 상태였다.
--
-- 다른 브랜치가 각자 마이그레이션 파일과 함께 이미 적용한 것들(profiles.slack_user_id,
-- teams/team_members 및 색상 배정 함수 일반화)은 해당 PR이 머지되면서 맞춰지므로 여기서 다루지 않는다.
--
-- 이 파일은 이미 적용된 원격에서도, 0001부터 새로 세팅하는 프로젝트에서도 같은 결과가 나오도록
-- 전부 멱등하게 작성했다.

-- 1. 되돌릴 수 없는 변경 전에 막힐 지점을 먼저 확인한다.
-- created_at 계열은 아래에서 now()로 백필하지만, status_id와 user_id는 값을 추측할 수 없다.
do $$
declare
  tasks_without_status int;
  availability_without_user int;
begin
  select count(*) into tasks_without_status from public.tasks where status_id is null;
  select count(*) into availability_without_user from public.availability where user_id is null;

  if tasks_without_status > 0 or availability_without_user > 0 then
    raise exception
      'NOT NULL 복원 전에 정리가 필요한 행이 있다. tasks.status_id 누락 %건, availability.user_id 누락 %건. 해당 행을 채우거나 지운 뒤 다시 실행할 것.',
      tasks_without_status, availability_without_user;
  end if;
end $$;

-- 2. status_history 폐기.
-- 0001에서 정의했으나 원격에 만들어진 적이 없고, 같은 역할(작업의 상태 변경 사유 기록)을
-- task_reasons가 대신하고 있다. 컬럼 구성도 task_id/status_id/reason/created_by/created_at으로 동일하다.
drop table if exists public.status_history;

-- 3. weeks.created_at 추가. 0001에는 있으나 원격에 없다.
alter table public.weeks
  add column if not exists created_at timestamptz not null default now();

-- 4. 0001이 선언했으나 원격에 반영되지 않은 NOT NULL 제약을 복원한다.
-- tasks.status_id가 null이면 그 일정은 어느 칸반 컬럼에도 나타나지 않으므로 특히 중요하다.
update public.profiles set created_at = now() where created_at is null;
update public.task_statuses set created_at = now() where created_at is null;
update public.availability set created_at = now() where created_at is null;
update public.tasks set created_at = now() where created_at is null;
update public.tasks set updated_at = now() where updated_at is null;

alter table public.profiles alter column created_at set not null;
alter table public.task_statuses alter column created_at set not null;
alter table public.availability alter column created_at set not null;
alter table public.availability alter column user_id set not null;
alter table public.tasks alter column created_at set not null;
alter table public.tasks alter column updated_at set not null;
alter table public.tasks alter column status_id set not null;

-- 5. tasks의 updated_at 갱신 트리거가 두 개로 늘어난 것을 정리한다.
-- 원격에는 원래 handle_updated_at()을 부르는 tasks_updated_at이 있었는데,
-- 0001이 선언한 tasks_set_updated_at을 나중에 따로 만들면서 같은 일을 하는 트리거가 겹쳤다.
-- 파일에 있는 이름(tasks_set_updated_at)을 남기고 나머지를 지운다.
drop trigger if exists tasks_updated_at on public.tasks;
drop function if exists public.handle_updated_at();

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

-- 6. 원격에만 있고 리포지토리에 정의가 없던 두 테이블을 파일로 남긴다.
-- 원격 정의를 그대로 옮긴 것이라 이미 적용된 프로젝트에서는 아무것도 바뀌지 않는다.

-- 스프린트(기간) 단위 묶음. 아직 애플리케이션 코드에서 사용하지 않는다.
create table if not exists public.sprints (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

-- 마감 초과 미완료 일정의 사유 기록(기능설계서 11-2). 아직 애플리케이션 코드에서 사용하지 않는다.
create table if not exists public.task_reasons (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks (id) on delete cascade,
  status_id uuid references public.task_statuses (id),
  reason text,
  created_by uuid references public.profiles (id),
  created_at timestamptz default now()
);

-- 7. RLS 정책 이름과 정의를 통일한다.
-- 0001이 만든 테이블들은 원격에서 "로그인한 사용자 전체 접근"(to public, auth.uid() is not null)으로,
-- 이후 추가된 테이블들은 "authenticated_full_access"(to authenticated, true)로 되어 있어 두 방식이 섞여 있었다.
-- 효과는 사실상 같으므로 파일이 쓰는 이름으로 맞춘다.
alter table public.profiles enable row level security;
alter table public.task_statuses enable row level security;
alter table public.weeks enable row level security;
alter table public.tasks enable row level security;
alter table public.availability enable row level security;
alter table public.sprints enable row level security;
alter table public.task_reasons enable row level security;

do $$
declare
  target text;
begin
  foreach target in array array[
    'profiles', 'task_statuses', 'weeks', 'tasks', 'availability', 'sprints', 'task_reasons'
  ] loop
    execute format('drop policy if exists "로그인한 사용자 전체 접근" on public.%I', target);
    execute format('drop policy if exists "authenticated_full_access" on public.%I', target);
    execute format(
      'create policy "authenticated_full_access" on public.%I for all to authenticated using (true) with check (true)',
      target
    );
  end loop;
end $$;
