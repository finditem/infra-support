-- 캘린더 가능 시간의 반복 등록을 지원한다.
-- 매주 같은 시간에 열리는 회의처럼 되풀이되는 일정을 한 번에 등록하면 날짜별로 availability 행이
-- 그만큼 만들어진다. 각 행은 지금까지처럼 독립적으로 조회/삭제되지만, 어느 등록에서 함께 만들어진
-- 행인지 알 수 있어야 "이후 반복 전체 삭제"를 제공할 수 있어 묶음 식별자를 둔다.
--
-- 반복 규칙(주기, 종료일) 자체는 저장하지 않는다. 등록 시점에 날짜를 모두 펼쳐 행으로 남기므로
-- 조회 쿼리(월 범위 조회)가 지금 형태 그대로 유지되고, 규칙을 나중에 해석할 필요가 없기 때문이다.
-- 대신 이미 만들어진 반복의 주기를 바꾸는 수정 기능은 제공하지 않는다(지우고 다시 등록한다).
--
-- 반복 없이 등록한 행은 null이다. 묶음으로 조회하는 경우만 인덱스가 필요하므로 부분 인덱스로 둔다.
alter table public.availability
  add column if not exists recurrence_group_id uuid;

create index if not exists availability_recurrence_group_id_idx
  on public.availability (recurrence_group_id)
  where recurrence_group_id is not null;
