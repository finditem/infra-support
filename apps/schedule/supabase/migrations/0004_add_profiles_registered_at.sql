-- 초대만 되고 비밀번호 설정(회원가입 완료)을 마치지 않은 사용자를
-- 이미 가입된 팀원처럼 목록에 노출하던 버그 수정.
-- handle_new_user 트리거는 이 컬럼을 채우지 않으므로, 초대 직후 생성된
-- profiles 행은 registered_at이 NULL(미가입)인 채로 남는다.
alter table public.profiles
  add column registered_at timestamptz;
