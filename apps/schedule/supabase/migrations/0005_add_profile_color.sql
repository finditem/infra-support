-- 팀원 색상을 렌더링 시점에 profile.id로 해시해 즉석 계산하던 방식을 걷어내고,
-- 가입(초대) 시점에 겹치지 않는 파스텔 색을 배정해 DB에 저장하도록 바꾼다.
-- 해시 방식은 hue 1차원만 랜덤이라 팀 규모가 작으면 특정 색상대(초록 계열)에
-- 몰리는 문제가 있었다.

alter table public.profiles add column color text;

create or replace function public.assign_profile_color()
returns text as $$
declare
  -- 30도 간격 파스텔 hue 12개, 순서를 셔플해 배정될 때 랜덤처럼 느껴지게 한다.
  palette int[] := array[210, 30, 330, 90, 270, 150, 0, 240, 60, 300, 120, 180];
  used_hues int[];
  candidate int;
begin
  -- 동시에 여러 초대가 처리될 때 같은 색을 동시에 읽어 중복 배정하는 것을 막기 위해
  -- 트랜잭션이 끝날 때까지 유지되는 advisory lock으로 아래 조회~반환을 직렬화한다.
  perform pg_advisory_xact_lock(hashtext('public.profiles.color'));

  select array_agg(distinct (substring(color from 'hsl\((\d+)'))::int)
    into used_hues
    from public.profiles
    where color is not null;

  foreach candidate in array palette loop
    if used_hues is null or not (candidate = any(used_hues)) then
      return format('hsl(%s 70%% 85%%)', candidate);
    end if;
  end loop;

  -- 팔레트 12개를 모두 소진하면(팀원 13명 이상) 랜덤 hue로 폴백한다(중복 허용).
  return format('hsl(%s 70%% 85%%)', floor(random() * 360)::int);
end;
$$ language plpgsql;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    public.assign_profile_color()
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

do $$
declare
  profile_record record;
begin
  for profile_record in
    select id from public.profiles where color is null order by created_at
  loop
    update public.profiles
      set color = public.assign_profile_color()
      where id = profile_record.id;
  end loop;
end $$;

alter table public.profiles alter column color set not null;
