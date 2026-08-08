-- apis 테이블에 API 상세 화면의 운영 설정 항목에 대응하는 컬럼을 추가한다.
-- 모니터링 프로젝트의 기존 스키마는 이 저장소 밖(Supabase 대시보드)에서 생성되었으므로,
-- 이 파일이 해당 프로젝트의 첫 마이그레이션이다.

alter table public.apis
  add column request_url text,
  add column http_method text not null default 'GET',
  add column check_interval_minutes integer not null default 180,
  add column is_notification_enabled boolean not null default true;

-- 지금까지는 source_url이 모니터링 호출 대상으로 쓰였다 (monitoring.processor의 callApi).
-- 컬럼을 분리한 뒤에도 기존 행의 모니터링이 끊기지 않도록 값을 그대로 옮긴다.
update public.apis
set request_url = source_url
where request_url is null;

alter table public.apis
  add constraint apis_http_method_check
    check (http_method in ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  add constraint apis_check_interval_minutes_check
    check (check_interval_minutes > 0);

comment on column public.apis.source_url is '출처 및 공식 문서 링크. 화면의 출처 표시에만 사용한다.';
comment on column public.apis.request_url is '모니터링 호출 대상 URL. monitor-server가 이 값을 호출한다.';
comment on column public.apis.http_method is '모니터링 호출에 사용할 HTTP Method.';
comment on column public.apis.check_interval_minutes is '체크 주기(분). 실제 실행 주기는 /api/monitor를 호출하는 외부 스케줄러가 결정하므로, 이 값과 어긋나지 않도록 함께 관리해야 한다.';
comment on column public.apis.is_notification_enabled is '장애 알림 발송 여부. 현재 저장소에는 알림 발송 구현이 없어 설정값으로만 보관한다.';
