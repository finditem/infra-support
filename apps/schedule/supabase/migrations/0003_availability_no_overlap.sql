-- 캘린더 가능 시간 등록 시 클라이언트의 rangesOverlap 검증만으로는 동시 등록 요청이
-- 겹치는 시간대를 함께 통과시킬 수 있어, DB 레벨 exclusion constraint로 최종 방어선을 둔다.

create extension if not exists btree_gist;

alter table public.availability
  add constraint availability_no_overlap
  exclude using gist (
    user_id with =,
    tsrange(available_date + start_time, available_date + end_time, '[)') with &&
  );
