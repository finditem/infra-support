/**
 * 일정 본문(tasks.body)에 마크다운 이미지(![파일명](url))를 인라인으로 삽입/렌더링하는 헬퍼.
 * `_lib/mentions.ts`의 "@슬러그" 언급 삽입/파싱 패턴을 그대로 본뜬 것이다 — 본문은 plain
 * <textarea>라 편집 중에는 실제 이미지가 아니라 마크다운 텍스트 그대로 보이고, 읽기 전용으로
 * 보여주는 곳(칸반 카드 미리보기)에서만 파싱해 실제 <img>로 그린다.
 */

const BODY_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)\s]+)\)/g;

export type BodyImageSegment =
  | { type: "text"; text: string }
  | { type: "image"; alt: string; url: string };

/** 텍스트를 일반 텍스트와 이미지 조각으로 나눈다. 이미지만 실제 <img>로 그릴 때 쓴다. */
export const splitBodyImageSegments = (text: string): BodyImageSegment[] => {
  const segments: BodyImageSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(BODY_IMAGE_PATTERN)) {
    const index = match.index ?? 0;

    if (index > lastIndex) segments.push({ type: "text", text: text.slice(lastIndex, index) });
    segments.push({ type: "image", alt: match[1], url: match[2] });

    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) segments.push({ type: "text", text: text.slice(lastIndex) });

  return segments;
};

/** 본문에 삽입된 이미지 개수. 칸반 카드 배지에 쓴다. */
export const countBodyImages = (text: string): number =>
  [...text.matchAll(BODY_IMAGE_PATTERN)].length;

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
