-- 초대만 되고 비밀번호 설정(회원가입 완료)을 마치지 않은 사용자를
-- 이미 가입된 팀원처럼 목록에 노출하던 버그 수정.
-- handle_new_user 트리거는 이 컬럼을 채우지 않으므로, 초대 직후 생성된
-- profiles 행은 registered_at이 NULL(미가입)인 채로 남는다.
alter table public.profiles
  add column registered_at timestamptz;

-- 이미 초대 수락 후 비밀번호 설정(회원가입)을 마친 기존 사용자는 registered_at을 채워
-- 이번 필터 추가로 목록에서 사라지지 않도록 한다. 아직 설정 전인 사용자는
-- auth.users.encrypted_password가 비어 있으므로 백필 대상에서 제외된다.
update public.profiles p
set registered_at = p.created_at
from auth.users u
where u.id = p.id
  and u.encrypted_password is not null
  and u.encrypted_password != '';
