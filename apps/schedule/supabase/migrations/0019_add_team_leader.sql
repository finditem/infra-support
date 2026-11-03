-- 팀장(리더) 지정. 슬랙 /일정추가 폼에서 보고자를 "담당자가 속한 팀의 팀장"으로 자동 지정하는 데 쓴다.
-- 리더는 설정 UI에서 팀원 중 한 명으로 지정하지만, DB 제약으로 "반드시 팀원"을 강제하지는 않는다
-- (팀원이 바뀌는 흐름과의 순서 의존을 피하려는 것으로, 애플리케이션이 팀원 중에서만 고르게 보장한다).
-- 리더로 지정된 profiles 행이 삭제되면 리더만 비운다(on delete set null).
alter table public.teams
  add column leader_id uuid references public.profiles (id) on delete set null;
