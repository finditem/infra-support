-- 팀(그룹) 관리 기능 스키마.
-- 팀원을 프론트엔드/백엔드/기획처럼 그룹으로 묶고, 이후 캘린더/칸반에서
-- "@프론트엔드"처럼 팀 단위로 일정 대상을 언급할 수 있게 하는 기반이다.
-- 한 사람이 여러 팀에 속할 수 있으므로 team_members는 다대다 조인 테이블이다.

-- 0005에서 profiles 전용으로 만든 색상 배정 로직을, 대상 테이블만 파라미터로 받는
-- 일반 함수로 승격한다. 팔레트와 advisory lock 전략은 그대로이고 대상 테이블만 달라진다.
-- 대상 테이블은 color text 컬럼을 가지고 있어야 한다.
create or replace function public.assign_pastel_color(target_table regclass)
returns text as $$
declare
  -- 30도 간격 파스텔 hue 12개, 순서를 셔플해 배정될 때 랜덤처럼 느껴지게 한다.
  palette int[] := array[210, 30, 330, 90, 270, 150, 0, 240, 60, 300, 120, 180];
  used_hues int[];
  candidate int;
begin
  -- 동시에 여러 행이 삽입될 때 같은 색을 동시에 읽어 중복 배정하는 것을 막기 위해
  -- 트랜잭션이 끝날 때까지 유지되는 advisory lock으로 아래 조회~반환을 직렬화한다.
  -- 락 키는 search_path에 따라 표기가 달라지지 않도록 테이블 이름이 아니라 oid로 만든다.
  perform pg_advisory_xact_lock(hashtext(target_table::oid::text || '.color'));

  execute format(
    'select array_agg(distinct (substring(color from ''hsl\((\d+)''))::int) from %s where color is not null',
    target_table
  ) into used_hues;

  foreach candidate in array palette loop
    if used_hues is null or not (candidate = any(used_hues)) then
      return format('hsl(%s 70%% 85%%)', candidate);
    end if;
  end loop;

  -- 팔레트 12개를 모두 소진하면 랜덤 hue로 폴백한다(중복 허용).
  return format('hsl(%s 70%% 85%%)', floor(random() * 360)::int);
end;
$$ language plpgsql;

-- handle_new_user()가 이 이름으로 호출하고 있으므로 시그니처를 그대로 두고 본문만 위임한다.
-- 기존 profiles 색상 배정 동작은 달라지지 않는다.
create or replace function public.assign_profile_color()
returns text as $$
begin
  return public.assign_pastel_color('public.profiles'::regclass);
end;
$$ language plpgsql;

create or replace function public.assign_team_color()
returns text as $$
begin
  return public.assign_pastel_color('public.teams'::regclass);
end;
$$ language plpgsql;

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  -- 앞뒤 공백은 트리거에서 제거한 뒤 저장하므로, unique 제약이 곧 "trim 후 유일"이 된다.
  name text not null unique,
  -- 언급에 쓰는 식별자. 한글 팀명을 그대로 "@프론트엔드"처럼 쓰되 공백은 허용하지 않으므로
  -- name에서 공백을 모두 제거한 값을 트리거가 채운다.
  slug text not null unique,
  -- profiles.color와 같은 'hsl(h 70% 85%)' 형식. 트리거가 insert 시점에 채운다.
  color text not null,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teams_name_not_blank check (btrim(name) <> ''),
  constraint teams_slug_not_blank check (slug <> '')
);

-- 한 사람이 여러 팀에 속할 수 있고 같은 팀에 두 번 속할 수는 없으므로
-- (team_id, profile_id)를 복합 기본키로 둔다.
create table public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (team_id, profile_id)
);

-- 특정 팀원이 속한 팀을 역방향으로 조회할 때 쓴다(복합 기본키는 team_id 선행이라 커버하지 못한다).
create index team_members_profile_id_idx on public.team_members (profile_id);

-- 팀명 정규화(trim), 언급 슬러그 생성, 색상 배정을 한 트리거에서 처리한다.
create or replace function public.prepare_team()
returns trigger as $$
begin
  new.name := btrim(new.name);
  new.slug := regexp_replace(new.name, '\s+', '', 'g');

  if new.color is null then
    new.color := public.assign_team_color();
  end if;

  return new;
end;
$$ language plpgsql;

create trigger teams_prepare
  before insert or update on public.teams
  for each row
  execute function public.prepare_team();

-- 0001_init.sql이 만든다고 적어 둔 set_updated_at()이 실제 프로젝트에는 없고,
-- 같은 본문의 handle_updated_at()이 tasks_updated_at 트리거에 연결되어 있다.
-- 이 마이그레이션이 어느 쪽 DB에서도 그대로 돌아가도록 create or replace로 함께 정의한다.
-- 이미 있는 DB에서는 같은 본문으로 덮어쓰는 것이라 동작이 달라지지 않는다.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger teams_set_updated_at
  before update on public.teams
  for each row
  execute function public.set_updated_at();

-- RLS: 기존 테이블과 동일하게 로그인한 사용자면 전체 CRUD를 허용한다.
-- 현재 앱에 관리자/일반 사용자 권한 구분이 없으므로 별도 역할 정책은 두지 않는다.
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

create policy "authenticated_full_access" on public.teams for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.team_members for all to authenticated using (true) with check (true);
