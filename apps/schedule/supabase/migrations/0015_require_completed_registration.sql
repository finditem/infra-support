-- 초대 링크 확인으로 세션을 얻었더라도 이름·비밀번호 설정을 마치기 전에는
-- 업무 데이터에 접근할 수 없게 한다.

create or replace function public.is_registered_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and registered_at is not null
  );
$$;

revoke all on function public.is_registered_user() from public;
grant execute on function public.is_registered_user() to authenticated;

-- 비밀번호는 public 스키마에 저장하지 않는다. Supabase Auth가 auth.users에 만든
-- 비밀번호 해시가 있을 때만 프로필을 가입 완료 상태로 전환한다.
create or replace function public.complete_invite_profile(display_name text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if nullif(btrim(display_name), '') is null then
    raise exception 'Display name is required' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from auth.users
    where id = auth.uid()
      and encrypted_password is not null
      and encrypted_password != ''
  ) then
    raise exception 'Password setup is incomplete' using errcode = '42501';
  end if;

  update public.profiles
  set name = btrim(display_name),
      registered_at = coalesce(registered_at, now())
  where id = auth.uid();

  if not found then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.complete_invite_profile(text) from public;
grant execute on function public.complete_invite_profile(text) to authenticated;

-- 미가입 사용자는 자신의 가입 상태만 읽을 수 있다. 가입 완료 표시는 위의
-- complete_invite_profile 함수로만 기록하며 profiles 직접 수정으로 우회할 수 없다.
drop policy if exists "authenticated_full_access" on public.profiles;
drop policy if exists "registration_profile_read" on public.profiles;
drop policy if exists "registered_profile_update" on public.profiles;

create policy "registration_profile_read" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_registered_user());

create policy "registered_profile_update" on public.profiles
  for update to authenticated
  using (id = auth.uid() and public.is_registered_user())
  with check (id = auth.uid() and public.is_registered_user());

-- 기존 세부 정책을 유지하면서 가입 완료 조건을 AND로 추가한다. 서비스 역할을 쓰는
-- Slack·cron 라우트는 RLS를 우회하므로 기존 서버 간 연동에는 영향을 주지 않는다.
do $$
declare
  target text;
begin
  foreach target in array array[
    'task_statuses',
    'weeks',
    'tasks',
    'availability',
    'status_history',
    'task_reasons',
    'sprints',
    'teams',
    'team_members',
    'task_comments',
    'task_comment_mentions'
  ] loop
    if to_regclass(format('public.%I', target)) is not null then
      execute format('drop policy if exists "registration_required" on public.%I', target);
      execute format(
        'create policy "registration_required" on public.%I as restrictive for all to authenticated using (public.is_registered_user()) with check (public.is_registered_user())',
        target
      );
    end if;
  end loop;
end;
$$;
