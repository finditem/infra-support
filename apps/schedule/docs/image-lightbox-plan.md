# 일정 작성 폼 첨부 이미지 — 클릭 시 고해상도 원본 보기 (라이트박스) 구현 계획

## 배경

일정 작성/수정 모달(`TaskCreateModal.tsx`)에 이미지를 첨부하면 4등분 그리드에 정사각형 썸네일로 미리보기가 뜬다. 이 썸네일은 `object-cover`로 화면에 꽉 차게 잘려 보이는 데다, 실제로 Storage에 저장되는 파일 자체도 업로드 전에 긴 변 1600px로 리사이즈된 버전뿐이다. 클릭 시 리사이즈 전 고해상도 원본을 크롭 없이 볼 수 있는 라이트박스를 추가한다.

## 핵심 설계 변경: 원본 파일도 함께 업로드한다

기존에는 `resizeImageFile`이 만든 리사이즈본만 Storage에 올라가고, 사용자가 고른 원본 파일은 브라우저 메모리에서만 잠깐 존재하다 버려졌다. 고해상도 보기를 지원하려면 원본 파일도 Storage에 함께 올려야 한다.

- 이미지 메타데이터 테이블이 없고(이미지 참조는 `tasks.body`의 마크다운 텍스트 하나로만 저장됨, `_lib/bodyImages.ts`), 이번에 새로 만들지도 않는다. 대신 **파일명 규칙으로 두 URL을 짝짓는다**: 리사이즈본이 `{uuid}.{ext}`로 저장되면, 원본은 같은 uuid에 `-original`을 붙인 `{uuid}-original.{ext}`로 같은 버킷에 저장한다. body에는 지금처럼 리사이즈본 URL 하나만 남기고, 원본 URL은 그 URL 문자열에서 `-original`을 끼워 넣어 그 자리에서 유도한다. 마크다운 포맷도, DB 마이그레이션도 필요 없다.
- 원본 파일이 실제로 존재하지 않을 수 있는 경우(이미 1600px 이하라 리사이즈가 생략됨, GIF, 원본 업로드 자체가 실패함)를 위해 라이트박스는 `<img onError>`로 유도된 원본 URL이 404면 즉시 리사이즈본 URL로 폴백한다. 그래서 이 기능 배포 이전에 저장된 기존 이미지(원본이 아예 없음)도 깨지지 않고 리사이즈본으로 자연스럽게 보인다.
- 용량/업로드 시간 트레이드오프: 리사이즈가 실제로 일어나는 이미지(1600px 초과)에 대해서는 업로드 용량과 시간이 거의 두 배가 된다. 다만 원본 파일 크기는 지금도 `validateImageFile`이 선택 시점에 5MB로 막고 있어, 버킷 설정(`0014_add_task_attachments.sql`의 `file_size_limit`)을 바꿀 필요는 없다(기존에 허용하던 최대치를 그대로 두 번 쓰는 것뿐).

## 변경 파일

### 1. `apps/schedule/src/app/_lib/imageUpload.ts`

**원본/리사이즈본 경로를 짝짓는 헬퍼 추가** (export, 파일 하단 유틸 근처):

```ts
/** 리사이즈본의 Storage 경로나 공개 URL로부터, 같은 이미지의 고해상도 원본 경로/URL을 유도한다
 * ("{uuid}.ext" -> "{uuid}-original.ext"). 원본이 실제로 업로드되지 않았을 수도 있지만(리사이즈가
 * 생략된 경우, GIF, 업로드 실패, 이 기능 이전에 저장된 이미지), 존재하지 않는 경로를 참조/삭제하는
 * 것은 무해하므로 호출 쪽에서 존재 여부를 미리 따지지 않고 항상 이 함수로 유도해 쓴다. */
export const deriveOriginalImagePath = (pathOrUrl: string): string => {
  const lastDot = pathOrUrl.lastIndexOf(".");
  if (lastDot === -1) return `${pathOrUrl}-original`;
  return `${pathOrUrl.slice(0, lastDot)}-original${pathOrUrl.slice(lastDot)}`;
};
```

**`uploadImageFile`이 원본 파일을 추가로 받아 함께 업로드하도록 수정**:

```ts
export const uploadImageFile = async (
  file: File,
  originalFile?: File | null
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

  if (originalFile) {
    const { error: originalError } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .upload(deriveOriginalImagePath(storagePath), originalFile, {
        contentType: originalFile.type,
      });

    // 원본 업로드 실패는 저장 자체를 막지 않는다. 라이트박스는 이 경로가 없으면
    // onError로 리사이즈본으로 자동 폴백한다.
    if (originalError) console.error(originalError);
  }

  const { data } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(storagePath);

  return { url: data.publicUrl, fileName: file.name };
};
```

**`getStoragePathsFromBody`가 원본 경로도 함께 반환하도록 수정** (삭제 정리용 — 이 함수를 쓰는 `deleteTask`와 `TaskCreateModal`의 "제거된 이미지 정리" 양쪽에 자동으로 전파된다):

```ts
export const getStoragePathsFromBody = (body: string | null): string[] =>
  body
    ? extractBodyImages(body).flatMap((image) => {
        const path = extractStoragePathFromUrl(image.url);
        return path ? [path, deriveOriginalImagePath(path)] : [];
      })
    : [];
```

### 2. `apps/schedule/src/app/_components/TaskCreateModal/TaskCreateModal.tsx`

**`ImageMarker`의 `pending` 분기에 `originalFile` 추가** (37~39번째 줄). 리사이즈가 실제로 일어나지 않았으면(`resizedFile === file`) `file` 자체가 이미 원본이므로 `null`로 둬 중복 업로드를 막는다.

```tsx
type ImageMarker =
  | { id: string; kind: "existing"; alt: string; url: string }
  | {
      id: string;
      kind: "pending";
      alt: string;
      file: File;
      previewUrl: string;
      /** 리사이즈로 실제로 축소된 경우에만 채워진다. null이면 file 자체가 원본과 같다(추가 업로드 불필요). */
      originalFile: File | null;
    };
```

**`handleImageFileSelected`** (133~157번째 줄)에서 `originalFile` 채우기:

```tsx
setImageMarkers((prev) => [
  ...prev,
  {
    id: crypto.randomUUID(),
    kind: "pending",
    alt: file.name,
    file: resizedFile,
    previewUrl: URL.createObjectURL(resizedFile),
    originalFile: resizedFile === file ? null : file,
  },
]);
```

**`handleSubmit`** (173~282번째 줄) 세 지점 수정:

1. 업로드 호출에 `originalFile` 전달 (184~186번째 줄):

```tsx
const uploadResults = await Promise.all(
  pendingImages.map((image) => uploadImageFile(image.file, image.originalFile))
);
```

2. 업로드 실패 롤백용 `uploadedPaths`가 원본 경로도 함께 지우도록 (188~190번째 줄):

```tsx
const uploadedPaths = uploadResults.flatMap((result) => {
  if (!result) return [];
  const path = extractStoragePathFromUrl(result.url);
  return path ? [path, deriveOriginalImagePath(path)] : [];
});
```

3. 수정 모드에서 "남겨진 이미지"의 원본까지 `finalPaths`에 포함해야 한다 — 그렇지 않으면 `getStoragePathsFromBody`가 이제 원본 경로도 반환하므로, 계속 쓰이는 이미지의 원본이 `removedPaths`로 오인되어 삭제돼 버린다 (241~245번째 줄):

```tsx
const finalPaths = new Set(
  finalImages.flatMap((image) => {
    const path = extractStoragePathFromUrl(image.url);
    return path ? [path, deriveOriginalImagePath(path)] : [];
  })
);
```

`deriveOriginalImagePath`를 7~16번째 줄 import 목록(`./imageUpload`)에 추가한다.

**썸네일 클릭 → 라이트박스 오픈** (409~432번째 줄): 이전 계획과 동일하게 `<img>`를 `<button>`으로 감싸고 `previewImage` state를 둔다. (상세 diff는 기존 계획과 동일하므로 아래 "공통 UI 변경" 절 참고.)

### 3. 신규 파일: `apps/schedule/src/app/_components/TaskCreateModal/ImageLightbox.tsx`

고해상도 원본 URL을 먼저 시도하고, 로드 실패(원본이 없는 경우) 시 리사이즈본으로 자동 폴백한다.

```tsx
"use client";

import { useState } from "react";
import { ModalOverlay } from "@/components/ModalOverlay";
import { deriveOriginalImagePath } from "../../_lib/imageUpload";

interface ImageLightboxProps {
  alt: string;
  url: string;
  onClose: () => void;
}

export const ImageLightbox = ({ alt, url, onClose }: ImageLightboxProps) => {
  const [highResFailed, setHighResFailed] = useState(false);
  const src = highResFailed ? url : deriveOriginalImagePath(url);

  return (
    <ModalOverlay className="z-[300] p-5" onClose={onClose}>
      <div className="relative">
        <img
          alt={alt}
          className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          src={src}
          onError={() => setHighResFailed(true)}
        />
        <button
          aria-label="닫기"
          className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-md bg-black/50 text-white hover:bg-black/70"
          type="button"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </ModalOverlay>
  );
};
```

- 바깥 클릭/ESC는 `ModalOverlay`가 처리한다. 이미지 자체 클릭으로는 닫히지 않는다(다른 모달과 동일한 컨벤션).
- 닫기 버튼은 이미지가 어떤 배경이든 보이도록 반투명 어두운 배경(`bg-black/50`)을 쓴다. `TaskCreateModal`의 닫기 버튼 스타일(`bg-fill-neutural-subtle-default`)은 밝은 surface 배경 전제라 여기선 재사용하지 않는다.

## 공통 UI 변경: 썸네일을 클릭 가능하게

**import 추가** (`TaskCreateModal.tsx`, 27번째 줄 아래):

```tsx
import { ImageLightbox } from "./ImageLightbox";
```

**state 추가** (102번째 줄 `isProcessingImage` 근처):

```tsx
const [previewImage, setPreviewImage] = useState<{ alt: string; url: string } | null>(null);
```

**썸네일 렌더링** (409~432번째 줄):

```tsx
{
  imageMarkers.length > 0 && (
    <div className="mt-2 grid grid-cols-4 gap-2">
      {imageMarkers.map((image) => {
        const url = image.kind === "existing" ? image.url : image.previewUrl;
        return (
          <div
            key={image.id}
            className="group relative aspect-square overflow-hidden rounded-[10px] border border-border"
          >
            <button
              aria-label="이미지 확대보기"
              className="block size-full cursor-zoom-in"
              type="button"
              onClick={() => setPreviewImage({ alt: image.alt, url })}
            >
              <img alt={image.alt} className="size-full object-cover" src={url} />
            </button>
            <button
              aria-label="이미지 삭제"
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-md border border-border bg-surface-elevated text-[11px] text-text-muted opacity-0 hover:bg-fill-neutural-subtle-hover group-hover:opacity-100"
              type="button"
              onClick={() => removeImageMarker(image.id)}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

삭제 버튼은 썸네일 버튼과 형제 관계로 겹쳐 그려지므로 `stopPropagation`이 필요 없다(DOM상 나중에 오는 엘리먼트가 위에 그려져 클릭을 가로챈다).

주의: `previewImage`에 담는 `url`은 **리사이즈본 URL**(기존 `pending`이면 blob 미리보기, `existing`이면 Storage public URL)이다. `ImageLightbox`가 내부적으로 `deriveOriginalImagePath`로 고해상도 쪽을 유도해서 먼저 시도한다 — `pending`(blob URL)의 경우 아직 업로드 전이라 유도된 "-original" 경로는 당연히 존재하지 않는 blob URL이 되어 즉시 `onError`로 리사이즈본(실제로는 이미 리사이즈된 미리보기)으로 폴백한다. 즉 **저장 전(blob 미리보기 단계)에는 고해상도 보기가 아직 불가능하고, 저장 후 다시 열었을 때만 고해상도가 보인다** — 저장 전 원본 파일이 아직 Storage에 없기 때문이다. 이 제약은 구조상 피할 수 없으므로 명시해 둔다.

**라이트박스 렌더링**: 최상위 리턴을 Fragment로 감싸고 `ModalOverlay` 형제로 조건부 렌더링한다 (314번째 줄 `return (` 과 536번째 줄 `</ModalOverlay>` 사이).

```tsx
return (
  <>
    <ModalOverlay className="z-[200] p-5" onClose={onClose}>
      {/* ...기존 내용... */}
    </ModalOverlay>
    {previewImage && (
      <ImageLightbox
        alt={previewImage.alt}
        url={previewImage.url}
        onClose={() => setPreviewImage(null)}
      />
    )}
  </>
);
```

## 접근성

- 썸네일을 `<button>`으로 감싸 Tab 포커스, Enter/Space로 라이트박스를 여는 동작이 브라우저 기본 동작으로 따라온다.
- 썸네일 버튼엔 `aria-label="이미지 확대보기"`, 라이트박스 닫기 버튼엔 `aria-label="닫기"`를 지정한다.

## 범위 밖

- 여러 장을 첨부했을 때 라이트박스 안에서 좌우로 넘겨보는 캐러셀은 요청에 없으므로 포함하지 않는다.
- `TaskComments`(댓글)에는 이미지 첨부 기능 자체가 없어 영향 없음.
- 저장 전(blob 미리보기 단계)에 고해상도를 보여주는 것은 구조상 불가능(원본이 아직 Storage에 없음) — 위 "주의" 참고.

## 검증 계획

- `pnpm build` / `pnpm lint` (`apps/schedule` 디렉토리, 사용자 승인 후 실행).
- 수동 확인(이미 떠 있는 dev 서버 기준):
  - 1600px를 넘는 큰 이미지 첨부 → 저장 → 다시 열어 썸네일 클릭 시 고해상도 원본이 뜨는지 (Storage 버킷에 `{uuid}.ext`와 `{uuid}-original.ext` 두 파일이 모두 생겼는지 Supabase 대시보드에서 확인).
  - 1600px 이하 작은 이미지나 GIF 첨부 → 저장 → 썸네일 클릭 시 끊김 없이 리사이즈본(=원본)이 뜨는지 (원본 업로드 자체가 없었던 경로).
  - 이 기능 배포 전에 저장된 기존 일정(원본 파일이 전혀 없음)을 열어 썸네일 클릭 시 404 폴백으로 정상적으로 리사이즈본이 보이는지.
  - 저장 전(blob 미리보기) 단계에서 썸네일 클릭 시에도 에러 없이 미리보기가 뜨는지(고해상도 폴백 동작 확인).
  - 일정 수정 시 기존 이미지를 일부만 삭제하고 저장 → Storage에서 삭제된 이미지의 리사이즈본/원본 둘 다 지워지고, 남은 이미지의 원본은 그대로 남아있는지.
  - 일정 전체 삭제(`deleteTask`) 시 상위/하위 일정 본문에 있던 이미지의 리사이즈본/원본이 모두 Storage에서 지워지는지.
  - 호버 중 삭제 버튼(✕) 클릭 시 라이트박스가 열리지 않고 삭제만 되는지.
