-- 초대 인증 직후 생성되는 임시 비밀번호 해시를 실제 비밀번호 설정 완료로
-- 오인할 수 있는 공개 RPC를 제거한다. 가입 완료 상태는 비밀번호 변경 성공 후
-- 서버의 service role 클라이언트만 기록한다.

revoke all
on function public.complete_invite_profile(text)
from public, anon, authenticated;

drop function if exists public.complete_invite_profile(text);
