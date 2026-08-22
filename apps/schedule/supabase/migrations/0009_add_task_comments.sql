-- 일정별 댓글과 댓글 본문 안의 팀원 멘션을 저장한다.
-- 보고자가 검토 의견을 남길 수 있는 곳이 tasks.body 하나뿐이라 일정마다 대화가 쌓이지 않던 문제를 해결한다.
--
-- 멘션은 본문에 @[이름](profile_id) 마커로 함께 저장되지만, 마커만으로는 "누가 누구를 멘션했는가"를
-- SQL로 조회할 수 없다. 이후 Slack 알림(기능설계서 5단계)이 발송 대상을 판단할 수 있도록
-- task_comment_mentions 관계 테이블에 정규화해 따로 남긴다.

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_comment_mentions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.task_comments (id) on delete cascade,
  mentioned_profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- 한 댓글에서 같은 사람을 여러 번 멘션해도 알림 대상은 한 번만 잡히도록 한다.
  unique (comment_id, mentioned_profile_id)
);

-- 칸반보드는 한 주치 일정 전체의 댓글을 task_id in (...) 한 번으로 조회하고(N+1 회피),
-- 알림 트리거는 멘션된 사람 기준으로 조회하게 되므로 두 외래키에 인덱스를 둔다.
-- (Postgres는 외래키 컬럼에 인덱스를 자동으로 만들지 않는다.)
create index task_comments_task_id_idx on public.task_comments (task_id);
create index task_comment_mentions_mentioned_profile_id_idx on public.task_comment_mentions (mentioned_profile_id);

-- RLS: 0001_init.sql과 동일하게 로그인 사용자 전체 접근 단일 정책만 둔다.
-- 작성자 본인만 수정/삭제 가능하다는 제약은 서버 액션에서 author_id 조건으로 강제한다.
alter table public.task_comments enable row level security;
alter table public.task_comment_mentions enable row level security;

create policy "authenticated_full_access" on public.task_comments for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.task_comment_mentions for all to authenticated using (true) with check (true);

-- tasks와 동일하게 updated_at을 자동 갱신한다.
-- 0001_init.sql이 이미 같은 함수를 정의하지만, 원격 DB에 그 정의가 없는 상태가 실제로 확인되어
-- 여기서 create or replace로 다시 선언한다. 본문은 0001_init.sql과 동일하므로 여러 번 실행해도 안전하다.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger task_comments_set_updated_at
  before update on public.task_comments
  for each row
  execute function public.set_updated_at();
