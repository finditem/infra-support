/**
 * 일정 본문(tasks.body)에 인라인으로 담기는 마크다운 이미지(![파일명](url)) 파싱/조립 헬퍼.
 *
 * 편집 중에는 사용자가 이 마크다운을 직접 보지 않는다 — TaskCreateModal이 프로즈 텍스트와
 * 이미지 목록을 따로 들고 있다가(첨부한 이미지는 별도 미리보기 갤러리로만 보여준다),
 * 저장 시점에만 `buildBodyWithImages`로 합쳐 하나의 body 문자열을 만든다. 별도 메타데이터
 * 테이블 없이 이미지 참조를 body 텍스트 자체에 담아두는 대신, 편집 화면에서 그 텍스트를
 * 사용자에게 노출하지 않는 쪽으로 타협한 것이다.
 *
 * 이미 저장된 본문을 다시 열 때(`extractBodyImages`)와, 칸반 카드 미리보기에서 이미지를 걷어낸
 * 텍스트만 보여줄 때(`stripBodyImages`/`countBodyImages`) 이 파일의 함수들로 파싱한다.
 */

const BODY_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)\s]+)\)/g;

/** 저장된 본문에서 이미지 마크다운만 추출한다(alt/url 쌍). 일정을 다시 열 때 미리보기 갤러리를 채운다. */
export const extractBodyImages = (text: string): { alt: string; url: string }[] =>
  [...text.matchAll(BODY_IMAGE_PATTERN)].map((match) => ({ alt: match[1], url: match[2] }));

/** 본문에 삽입된 이미지 개수. 칸반 카드 배지에 쓴다. */
export const countBodyImages = (text: string): number =>
  [...text.matchAll(BODY_IMAGE_PATTERN)].length;

/**
 * 이미지 마크다운을 걷어낸 순수 텍스트. 칸반 카드 미리보기는 이미지를 보여주지 않고
 * 이 텍스트만 표시한다(이미지 제거로 남는 여분의 공백/개행은 정리한다).
 */
export const stripBodyImages = (text: string): string =>
  text
    .replace(BODY_IMAGE_PATTERN, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/** 프로즈 텍스트와 이미지 목록을 저장용 본문 문자열 하나로 합친다. 저장할 내용이 없으면 null. */
export const buildBodyWithImages = (
  text: string,
  images: { alt: string; url: string }[]
): string | null => {
  const trimmedText = text.trim();
  const markerText = images.map((image) => `![${image.alt}](${image.url})`).join("\n");
  const combined = [trimmedText, markerText].filter(Boolean).join("\n\n");

  return combined || null;
};
