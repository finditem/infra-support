-- 팀의 네 가지 업무 영역을 일정에 연결한다.
alter table public.tasks
  add column project_key text not null default 'operations'
  check (project_key in ('operations', 'mobile', 'admin', 'monitoring'));

create index tasks_project_key_idx on public.tasks (project_key);
