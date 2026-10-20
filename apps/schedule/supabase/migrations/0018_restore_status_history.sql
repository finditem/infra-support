-- 0011에서 폐기했던 status_history를 복구한다.
-- 일정 상태 변경 이력은 팀원별 마감일 준수율과 평균 완료 소요 시간 리포트의 집계 원천이다.
-- 상태를 바꾸는 경로가 웹 서버 액션과 Slack 명령/버튼으로 여러 곳에 흩어져 있어, 각 경로에서 직접
-- 기록하면 한 곳이라도 빠지면 리포트가 비게 된다. 그래서 tasks의 status_id 변경을 트리거로 한곳에서
-- 기록하도록 중앙화한다.

create table if not exists public.status_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  status_id uuid not null references public.task_statuses (id),
  reason text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.status_history enable row level security;

-- RLS: 0001과 동일하게 로그인 사용자 전체 접근 단일 정책만 둔다.
drop policy if exists "authenticated_full_access" on public.status_history;
create policy "authenticated_full_access" on public.status_history for all to authenticated using (true) with check (true);

-- 리포트는 status_id("완료")와 created_at 기간으로 조회한 뒤 task_id로 tasks를 조인한다.
create index if not exists status_history_status_created_idx on public.status_history (status_id, created_at);
create index if not exists status_history_task_id_idx on public.status_history (task_id);

-- tasks.status_id가 실제로 바뀔 때만 이력을 남긴다. 변경 주체(created_by)는 로그인 세션이 있을 때만
-- auth.uid()로 채우고(= profiles.id), service role로 호출하는 Slack 경로에서는 null로 둔다.
-- 리포트는 created_by가 아니라 tasks.assignee_id로 담당자를 가리므로 null이어도 집계에 지장이 없다.
-- auth.uid()가 profiles에 없는 값일 때 외래키 위반으로 본 UPDATE가 막히지 않도록, 존재할 때만 채운다.
create or replace function public.record_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status_id is distinct from old.status_id then
    insert into public.status_history (task_id, status_id, created_by)
    values (new.id, new.status_id, (select id from public.profiles where id = auth.uid()));
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_record_status_change on public.tasks;
create trigger tasks_record_status_change
  after update of status_id on public.tasks
  for each row
  execute function public.record_status_change();
