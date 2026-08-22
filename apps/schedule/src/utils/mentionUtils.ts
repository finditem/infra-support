/**
 * 댓글 본문의 멘션 마커 형식과 그 직렬화/파싱을 한곳에 모은 유틸.
 *
 * 멘션은 본문에 `@[이름](profile_id)` 마커로 저장한다. 이름만 저장하면 동명이인을 구분할 수 없고
 * 팀원이 이름을 바꿨을 때 연결이 끊기므로, 표시용 이름과 식별자를 함께 담는다.
 * 저장 시점에는 `extractMentionedProfileIds`로 뽑은 식별자를 task_comment_mentions에도 함께 넣어,
 * 이후 알림이 본문 파싱 없이 SQL만으로 발송 대상을 찾을 수 있게 한다.
 */

/** `@[이름](uuid)` — 이름에는 줄바꿈과 `]`를 허용하지 않고, 식별자는 uuid 형태만 인정한다. */
const MENTION_MARKER_PATTERN = "@\\[([^\\]\\n]+)\\]\\(([0-9a-fA-F-]{36})\\)";

export interface MentionTarget {
  id: string;
  name: string;
}

export type MentionSegment =
  | { type: "text"; text: string }
  | { type: "mention"; profileId: string; name: string };

export interface ActiveMentionQuery {
  /** `@` 뒤에 입력된 검색어. `@`만 친 직후에는 빈 문자열이다. */
  query: string;
  /** 본문에서 `@`가 위치한 인덱스. 선택 확정 시 이 지점부터 커서까지를 마커로 교체한다. */
  startIndex: number;
}

/** 팀원 한 명을 본문에 삽입할 마커 문자열로 직렬화한다. */
export const buildMentionMarker = ({ id, name }: MentionTarget) => `@[${name}](${id})`;

/**
 * 본문을 일반 텍스트와 멘션이 번갈아 나오는 조각으로 나눈다. 렌더링 시 멘션 조각만 강조하면 된다.
 */
export const parseMentionSegments = (body: string): MentionSegment[] => {
  const pattern = new RegExp(MENTION_MARKER_PATTERN, "g");
  const segments: MentionSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", text: body.slice(lastIndex, match.index) });
    }

    segments.push({ type: "mention", name: match[1], profileId: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < body.length) {
    segments.push({ type: "text", text: body.slice(lastIndex) });
  }

  return segments;
};

/** 본문에 실제로 남아 있는 멘션 대상만 중복 없이 뽑는다. 저장 시 관계 테이블과 동기화하는 기준값이다. */
export const extractMentionedProfileIds = (body: string) => {
  const ids = parseMentionSegments(body).flatMap((segment) =>
    segment.type === "mention" ? [segment.profileId] : []
  );

  return Array.from(new Set(ids));
};

/**
 * 커서 바로 앞이 자동완성을 띄워야 하는 `@` 입력인지 판정한다.
 * 단어 중간의 `@`(이메일 등)와 이미 삽입이 끝난 마커는 후보에서 제외한다.
 */
export const findActiveMentionQuery = (
  value: string,
  caretIndex: number
): ActiveMentionQuery | null => {
  const before = value.slice(0, caretIndex);
  const triggerIndex = before.lastIndexOf("@");

  if (triggerIndex === -1) return null;

  const charBeforeTrigger = triggerIndex === 0 ? "" : before[triggerIndex - 1];
  if (charBeforeTrigger && !/\s/.test(charBeforeTrigger)) return null;

  const query = before.slice(triggerIndex + 1);
  // 공백이 들어갔다면 멘션 입력이 이미 끝난 것이고, `[`로 시작하면 완성된 마커 안이다.
  if (/\s/.test(query) || query.startsWith("[")) return null;

  return { query, startIndex: triggerIndex };
};

/**
 * 입력 중이던 `@검색어`를 확정된 텍스트로 교체한다.
 * 뒤에 공백을 붙여 다음 입력이 달라붙지 않게 하고, 그 뒤로 커서를 옮긴다.
 */
export const replaceMentionQuery = (
  value: string,
  { startIndex }: ActiveMentionQuery,
  caretIndex: number,
  insertText: string
) => {
  const rest = value.slice(caretIndex);
  // 뒤에 이미 공백이 있으면 덧붙이지 않는다. 커서는 어느 쪽이든 공백 하나를 건너뛴 자리에 둔다.
  const separator = /^\s/.test(rest) ? "" : " ";

  return {
    value: `${value.slice(0, startIndex)}${insertText}${separator}${rest}`,
    caretIndex: startIndex + insertText.length + 1,
  };
};

/**
 * 저장된 본문의 마커를 사람이 읽는 `@이름` 형태로 바꾼다.
 * 식별자가 그대로 보이면 읽고 고치기가 어려우므로, 입력창에는 이 형태만 노출한다.
 */
export const toMentionDisplayText = (body: string) =>
  parseMentionSegments(body)
    .map((segment) => (segment.type === "mention" ? `@${segment.name}` : segment.text))
    .join("");

/**
 * 입력창의 `@이름`을 저장용 마커로 되돌린다.
 *
 * 후보(등록된 팀원)의 이름과 일치하는 `@이름`이면 자동완성으로 골랐든 직접 쳤든 붙여넣었든
 * 똑같이 멘션이 된다. 입력 방법에 따라 결과가 달라지면 사용자가 이유를 알 수 없기 때문이다.
 * 후보에 없는 `@문자열`은 그대로 일반 텍스트로 남는다.
 *
 * 이미 만들어진 마커는 `@[이름]` 꼴이라 `@이름` 검색에 다시 걸리지 않으므로 중복 치환이 생기지 않는다.
 */
export const toMentionStoredBody = (displayText: string, candidates: MentionTarget[]) => {
  const usedNames = new Set<string>();
  // 이름이 긴 쪽을 먼저 치환해야 "김민"이 "김민호"의 앞부분만 잘라먹는 일이 없다.
  const ordered = [...candidates].sort((a, b) => b.name.length - a.name.length);

  return ordered.reduce((text, candidate) => {
    if (usedNames.has(candidate.name)) return text;
    usedNames.add(candidate.name);

    return text.split(`@${candidate.name}`).join(buildMentionMarker(candidate));
  }, displayText);
};
