-- 0014에서는 삭제 UI가 없어 storage.objects에 delete 정책을 의도적으로 비워뒀다.
-- 이제 이미지를 저장 버튼을 누른 시점에만 업로드하는 방식으로 바꾸면서, 저장하지 않고
-- 취소하거나 저장 직전 마커를 지운 경우/일정 삭제 시 실제로 정리가 필요해졌다.
drop policy if exists "task_attachments_authenticated_delete" on storage.objects;

create policy "task_attachments_authenticated_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'task-attachments');
