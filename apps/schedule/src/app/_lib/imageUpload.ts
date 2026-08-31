import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { extractBodyImages } from "./bodyImages";

// 0014_add_task_attachments.sql의 버킷 설정(file_size_limit/allowed_mime_types)과 값을 맞춘다.
export const ATTACHMENT_BUCKET = "task-attachments";
export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_MIME_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

/** Storage 오브젝트 키에 그대로 쓸 수 있는 확장자로 매핑한다. 원본 파일명(한글/공백 등 포함 가능)을
 * 경로에 직접 쓰지 않기 위해서다 — Supabase Storage 키는 그런 문자를 거부한다("Invalid key"). */
const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

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

const MAX_IMAGE_DIMENSION = 1600;

/**
 * 업로드 전에 브라우저에서 이미지를 적당한 크기로 줄인다. 실제 쓰이는 곳은 모달의 작은 미리보기
 * 썸네일뿐이라, 원본 해상도를 그대로 올리면 업로드 시간과 Storage 용량만 낭비된다.
 * GIF는 canvas로 다시 그리면 애니메이션이 첫 프레임 정지 이미지로 깨지므로 건드리지 않는다.
 * 리사이즈 중 무엇이든 실패하면(브라우저 호환성 등) 원본 파일을 그대로 돌려줘 업로드 자체는 막지 않는다.
 */
export const resizeImageFile = async (file: File): Promise<File> => {
  if (file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const longestSide = Math.max(bitmap.width, bitmap.height);

    if (longestSide <= MAX_IMAGE_DIMENSION) {
      bitmap.close();
      return file;
    }

    const scale = MAX_IMAGE_DIMENSION / longestSide;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    // 포맷은 원본 그대로 유지한다(품질 값은 JPEG/WEBP에만 적용되고 PNG는 무시된다) —
    // 투명 배경이 있는 PNG(스크린샷 등)를 JPEG로 바꾸면 배경이 깨지기 때문이다.
    const resizedBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, file.type, 0.85)
    );

    return resizedBlob ? new File([resizedBlob], file.name, { type: file.type }) : file;
  } catch (error) {
    console.error(error);
    return file;
  }
};

/**
 * 이미 리사이즈된 이미지를 Storage에 올린다. 저장 버튼을 누른 시점에만 호출된다 — 그 전까지는
 * 선택된 파일을 로컬 blob URL로만 미리보기하고 실제 업로드는 하지 않아, 저장하지 않고 취소하거나
 * 마커를 지운 이미지가 Storage에 고아로 남지 않는다. DB에 남길 메타데이터가 없으므로(이미지
 * 참조는 본문 텍스트 자체의 마크다운으로 저장된다) 서버 액션을 거치지 않고 브라우저에서
 * 바로 업로드한다. 아직 저장되지 않은 새 일정을 작성하는 중에도 바로 삽입할 수 있어야 해서,
 * 경로에 taskId를 쓰지 않는다.
 */
export const uploadImageFile = async (
  file: File
): Promise<{ url: string; fileName: string } | null> => {
  const supabase = createClient();
  const extension = EXTENSION_BY_MIME_TYPE[file.type] ?? "bin";
  const storagePath = `${crypto.randomUUID()}.${extension}`;

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

/** getPublicUrl()이 만드는 공개 URL에서 Storage 오브젝트 경로만 뽑아낸다. 다른 버킷을
 * 가리키거나 형식이 맞지 않으면 null. */
export const extractStoragePathFromUrl = (url: string): string | null => {
  const marker = `/storage/v1/object/public/${ATTACHMENT_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;

  const path = url.slice(index + marker.length);
  return path ? decodeURIComponent(path) : null;
};

/** 본문 텍스트에 남아있는 이미지 마크다운에서 Storage 경로만 뽑는다. 일정/하위 일정 삭제,
 * 저장 시 제거된 기존 이미지 정리에 쓴다. */
export const getStoragePathsFromBody = (body: string | null): string[] =>
  body
    ? extractBodyImages(body)
        .map((image) => extractStoragePathFromUrl(image.url))
        .filter((path): path is string => path !== null)
    : [];

/** 더 이상 어떤 일정 본문에서도 참조되지 않는 이미지를 Storage에서 지운다. 정리 실패는
 * 저장/삭제 자체를 막을 이유가 아니므로 로그만 남기고 흐름을 이어간다. */
export const deleteStorageImages = async (
  supabase: SupabaseClient,
  paths: string[]
): Promise<void> => {
  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(ATTACHMENT_BUCKET).remove(paths);

  if (error) {
    console.error(error);
  }
};
