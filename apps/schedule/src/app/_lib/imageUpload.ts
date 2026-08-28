import { createClient } from "@/lib/supabase/client";

// 0014_add_task_attachments.sql의 버킷 설정(file_size_limit/allowed_mime_types)과 값을 맞춘다.
export const ATTACHMENT_BUCKET = "task-attachments";
export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_MIME_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

/** 업로드 전 클라이언트에서 즉시 피드백을 주기 위한 1차 검증. 실제 경계는 Storage 버킷 설정이다. */
export const validateImageFile = (file: File): string | null => {
  if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.type)) {
    return "PNG, JPEG, GIF, WEBP 형식의 이미지만 첨부할 수 있습니다.";
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return "이미지 용량은 5MB를 넘을 수 없습니다.";
  }

  return null;
};

/**
 * 일정 본문에 인라인으로 삽입할 이미지를 Storage에 올린다. DB에 남길 메타데이터가 없으므로
 * (이미지 참조는 본문 텍스트 자체의 마크다운으로 저장된다) 서버 액션을 거치지 않고 브라우저에서
 * 바로 업로드한다. 아직 저장되지 않은 새 일정을 작성하는 중에도 바로 삽입할 수 있어야 해서,
 * 경로에 taskId를 쓰지 않는다.
 */
export const uploadBodyImage = async (
  file: File
): Promise<{ url: string; fileName: string } | null> => {
  const supabase = createClient();
  const storagePath = `${crypto.randomUUID()}-${file.name}`;

  const { error } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .upload(storagePath, file, { contentType: file.type });

  if (error) {
    console.error(error);
    return null;
  }

  const { data } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(storagePath);

  return { url: data.publicUrl, fileName: file.name };
};
