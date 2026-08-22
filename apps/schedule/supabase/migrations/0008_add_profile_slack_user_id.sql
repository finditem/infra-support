-- Slack 알림 연동: 담당자/보고자에게 DM을 보내기 위한 Slack 사용자 ID 컬럼 추가.
-- 값은 Slack 워크스페이스의 멤버 ID(U로 시작)이며, 관리자가 대시보드에서 직접 채운다.
-- 값이 없는 팀원은 DM 대상에서 제외되고 채널 알림에만 이름으로 표기된다.

alter table public.profiles
  add column if not exists slack_user_id text;

comment on column public.profiles.slack_user_id is 'Slack 멤버 ID (예: U012ABCDEF). 없으면 DM을 보내지 않는다.';
