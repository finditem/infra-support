-- 일정 본문에 이미지를 인라인으로 삽입할 수 있게 한다.
--
-- 이미지 참조는 별도 테이블이 아니라 tasks.body 안에 마크다운(![파일명](url))으로 직접 저장된다.
-- body는 이미 authenticated_full_access 권한으로 누구나 수정할 수 있어(0001_init.sql), 이미지
-- 삽입도 그 권한을 그대로 탄다. 그래서 여기서는 이미지 파일을 담을 Storage 버킷만 새로 만든다.
--
-- 인증된 팀원만 도달 가능한 사내 툴이고 객체 경로에 uuid가 섞여 추측 불가능하므로 public으로 둔다
-- (getPublicUrl()이 네트워크 호출 없이 즉시 URL을 만들어, 카드 미리보기에서 바로 <img>로 쓸 수 있다).
-- file_size_limit/allowed_mime_types를 버킷 레벨에 걸어 anon key로 Storage API를 직접 찔러도
-- 우회할 수 없는 실질적 경계로 삼는다.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'task-attachments',
  'task-attachments',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 버킷이 public이어도 업로드는 여전히 storage.objects의 RLS를 탄다
-- (public 플래그는 공개 다운로드 엔드포인트에만 적용된다). 이번 범위에는 삭제 UI가 없어
-- delete 정책은 두지 않는다.
drop policy if exists "task_attachments_authenticated_read" on storage.objects;
drop policy if exists "task_attachments_authenticated_insert" on storage.objects;

create policy "task_attachments_authenticated_read" on storage.objects
  for select to authenticated using (bucket_id = 'task-attachments');

create policy "task_attachments_authenticated_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'task-attachments');
