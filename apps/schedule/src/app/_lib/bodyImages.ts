/**
 * 일정 본문(tasks.body)에 마크다운 이미지(![파일명](url))를 인라인으로 삽입/파싱하는 헬퍼.
 * `_lib/mentions.ts`의 "@슬러그" 언급 삽입/파싱 패턴을 그대로 본뜬 것이다 — 본문은 plain
 * <textarea>라 편집 중에는 실제 이미지가 아니라 마크다운 텍스트 그대로 보인다. 대신 일정 생성/수정
 * 모달에는 본문에 담긴 이미지를 실제로 보여주는 미리보기 갤러리가 별도로 있다(TaskCreateModal).
 * 칸반 카드 미리보기는 이미지 없이 텍스트만(이미지만 있는 본문이면 "이미지"라는 문구만) 보여준다.
 */

const BODY_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)\s]+)\)/g;

export type BodyImageSegment =
  | { type: "text"; text: string }
  | { type: "image"; alt: string; url: string; start: number; end: number };

/** 텍스트를 일반 텍스트와 이미지 조각으로 나눈다. 모달의 이미지 미리보기 갤러리를 그릴 때 쓴다. */
export const splitBodyImageSegments = (text: string): BodyImageSegment[] => {
  const segments: BodyImageSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(BODY_IMAGE_PATTERN)) {
    const index = match.index ?? 0;
    const end = index + match[0].length;

    if (index > lastIndex) segments.push({ type: "text", text: text.slice(lastIndex, index) });
    segments.push({ type: "image", alt: match[1], url: match[2], start: index, end });

    lastIndex = end;
  }

  if (lastIndex < text.length) segments.push({ type: "text", text: text.slice(lastIndex) });

  return segments;
};

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

/**
 * 선택 구간(start~end)을 이미지 마크다운으로 치환한 텍스트와 그 뒤에 놓을 커서 위치를 돌려준다.
 * insertMention과 동일한 모양이다.
 */
export const insertImageMarkdown = (
  text: string,
  start: number,
  end: number,
  altText: string,
  url: string
) => {
  const marker = `![${altText}](${url})`;

  return {
    text: `${text.slice(0, start)}${marker}${text.slice(end)}`,
    caretIndex: start + marker.length,
  };
};

/** 모달의 이미지 미리보기 갤러리에서 이미지 하나를 지울 때, 그 마커(start~end)만 본문에서 제거한다. */
export const removeBodyImage = (text: string, start: number, end: number): string =>
  `${text.slice(0, start)}${text.slice(end)}`;
