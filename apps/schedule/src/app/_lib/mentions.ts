import type { ProfileWithColor } from "../_types/kanban";
import type { TeamWithMembers } from "../_types/teams";

/** 언급 대상. 팀 전체를 부르는 경우와 개인을 부르는 경우를 한 타입으로 다룬다. */
export type MentionTarget =
  | { kind: "team"; team: TeamWithMembers }
  | { kind: "profile"; profile: ProfileWithColor };

/**
 * 언급에 쓰는 식별자로 바꾼다. 팀명/이름을 그대로 쓰되 공백만 제거한다.
 * teams.slug를 만드는 DB 트리거와 같은 규칙이라, 팀은 저장된 slug와 항상 같은 값이 나온다.
 */
export const toMentionSlug = (name: string) => name.replace(/\s+/g, "");

export const getMentionSlug = (target: MentionTarget) =>
  target.kind === "team" ? target.team.slug : toMentionSlug(target.profile.name);

export const getMentionLabel = (target: MentionTarget) =>
  target.kind === "team" ? target.team.name : target.profile.name;

/** 팀과 개인의 id가 겹칠 수 있으므로 종류를 붙여 목록 key와 중복 판정에 쓴다. */
export const getMentionKey = (target: MentionTarget) =>
  target.kind === "team" ? `team:${target.team.id}` : `profile:${target.profile.id}`;

/**
 * 언급 토큰의 앞뒤 경계로 인정되는 글자인지 본다. 문자열의 끝(빈 문자열)도 경계로 본다.
 * 글자나 숫자가 붙어 있으면 언급이 아니라 다른 단어의 일부로 본다.
 * 앞쪽은 이메일 주소(sjk@example.com), 뒤쪽은 "@민수님"처럼 슬러그에 조사가 붙은 경우를 걸러낸다.
 */
const isMentionBoundaryChar = (char: string) => !char || !/[\p{L}\p{N}]/u.test(char);

/**
 * 슬러그별로 그 슬러그를 쓰는 언급 대상을 모은다.
 * 동명이인이나 팀명과 이름이 같은 팀원처럼 한 슬러그를 여러 대상이 공유할 수 있다.
 */
const groupTargetsBySlug = (targets: MentionTarget[]) => {
  const targetsBySlug = new Map<string, MentionTarget[]>();

  targets.forEach((target) => {
    const slug = getMentionSlug(target);
    if (!slug) return;
    targetsBySlug.set(slug, [...(targetsBySlug.get(slug) ?? []), target]);
  });

  return targetsBySlug;
};

/**
 * 둘 이상의 대상이 공유해서 "@슬러그"만으로는 대상을 특정할 수 없는 슬러그를 돌려준다.
 * 언급 입력 UI에서 이런 슬러그를 안내하거나 걸러내는 데 쓴다.
 */
export const getAmbiguousMentionSlugs = (targets: MentionTarget[]): string[] =>
  [...groupTargetsBySlug(targets).entries()]
    .filter(([, sharing]) => sharing.length > 1)
    .map(([slug]) => slug);

/** 팀과 개인을 하나의 언급 후보 목록으로 합친다. 팀을 먼저 보여준다. */
export const buildMentionTargets = (
  teams: TeamWithMembers[],
  profiles: ProfileWithColor[]
): MentionTarget[] => [
  ...teams.map((team): MentionTarget => ({ kind: "team", team })),
  ...profiles.map((profile): MentionTarget => ({ kind: "profile", profile })),
];

/** 언급을 강조해 그리기 위해 본문을 일반 텍스트와 언급 조각으로 번갈아 나눈 결과. */
export type MentionSegment =
  | { type: "text"; text: string }
  | { type: "mention"; slug: string; target: MentionTarget };

/**
 * 텍스트를 일반 텍스트와 언급 조각으로 나눈다. 언급만 강조해서 그릴 때 쓴다.
 *
 * 다음 경우는 언급으로 보지 않는다.
 * - 이메일 주소처럼 "@" 앞에 글자나 숫자가 붙어 있는 경우
 * - "@민수님"처럼 슬러그 뒤에 글자나 숫자가 이어져 다른 단어인 경우
 * - 동명이인처럼 둘 이상의 대상이 같은 슬러그를 쓰는 경우. 텍스트만으로는 누구를 부른 것인지
 *   알 수 없어서, 엉뚱한 대상(특히 개인 대신 팀 전체)으로 해석하는 대신 매칭하지 않는다.
 *   어떤 슬러그가 이에 해당하는지는 getAmbiguousMentionSlugs로 확인할 수 있다.
 *
 * 슬러그가 긴 후보부터 검사해서 "@프론트엔드"가 "@프론트"로 잘못 잡히지 않게 한다.
 */
export const splitMentionSegments = (text: string, targets: MentionTarget[]): MentionSegment[] => {
  const targetsBySlug = groupTargetsBySlug(targets);
  const unambiguousSlugsByLengthDesc = [...targetsBySlug.entries()]
    .filter(([, sharing]) => sharing.length === 1)
    .map(([slug]) => slug)
    .sort((a, b) => b.length - a.length);

  const segments: MentionSegment[] = [];
  let lastIndex = 0;

  for (let index = text.indexOf("@"); index !== -1; index = text.indexOf("@", index + 1)) {
    if (!isMentionBoundaryChar(index === 0 ? "" : text[index - 1])) continue;

    const rest = text.slice(index + 1);
    const slug = unambiguousSlugsByLengthDesc.find(
      (candidate) =>
        rest.startsWith(candidate) &&
        isMentionBoundaryChar(rest.slice(candidate.length, candidate.length + 1))
    );
    const target = slug ? targetsBySlug.get(slug)?.[0] : undefined;

    if (!slug || !target) continue;

    if (index > lastIndex) segments.push({ type: "text", text: text.slice(lastIndex, index) });
    segments.push({ type: "mention", slug, target });

    index += slug.length;
    lastIndex = index + 1;
  }

  if (lastIndex < text.length) segments.push({ type: "text", text: text.slice(lastIndex) });

  return segments;
};

/**
 * 텍스트 안의 "@슬러그"를 찾아 매칭된 언급 대상을 순서대로 돌려준다.
 * 같은 대상이 여러 번 언급되면 한 번만 담는다. 매칭 규칙은 splitMentionSegments와 같다.
 */
export const parseMentions = (text: string, targets: MentionTarget[]): MentionTarget[] => {
  const matched: MentionTarget[] = [];
  const matchedKeys = new Set<string>();

  splitMentionSegments(text, targets).forEach((segment) => {
    if (segment.type !== "mention") return;

    const key = getMentionKey(segment.target);
    if (matchedKeys.has(key)) return;

    matchedKeys.add(key);
    matched.push(segment.target);
  });

  return matched;
};

/** 팀 언급은 소속 팀원으로 펼치고 개인 언급과 합쳐 중복을 제거한다. */
export const resolveMentionProfiles = (targets: MentionTarget[]): ProfileWithColor[] => {
  const profileById = new Map<string, ProfileWithColor>();

  targets.forEach((target) => {
    const profiles = target.kind === "team" ? target.team.members : [target.profile];
    profiles.forEach((profile) => {
      if (!profileById.has(profile.id)) profileById.set(profile.id, profile);
    });
  });

  return [...profileById.values()];
};

/** 언급 후보를 팀명/이름/슬러그로 걸러낸다. 검색어가 비어 있으면 전체를 돌려준다. */
export const filterMentionTargets = (targets: MentionTarget[], query: string): MentionTarget[] => {
  const keyword = query.trim();
  if (!keyword) return targets;

  return targets.filter(
    (target) =>
      getMentionLabel(target).includes(keyword) || getMentionSlug(target).includes(keyword)
  );
};

interface ActiveMention {
  /** "@" 바로 뒤부터 커서까지 입력된 검색어. */
  query: string;
  /** 텍스트에서 "@"가 있는 위치. */
  startIndex: number;
}

/**
 * 커서 바로 앞에 작성 중인 "@..." 토큰이 있으면 그 검색어와 시작 위치를 돌려준다.
 * 단어 중간의 "@"(이메일 등)와 공백이 섞인 토큰은 언급으로 보지 않는다.
 * 검색어가 비어 있어도(= "@"만 친 상태) 전체 후보를 보여주기 위해 결과를 돌려준다.
 */
export const getActiveMention = (text: string, caretIndex: number): ActiveMention | null => {
  const beforeCaret = text.slice(0, caretIndex);
  const startIndex = beforeCaret.lastIndexOf("@");
  if (startIndex === -1) return null;

  const query = beforeCaret.slice(startIndex + 1);
  if (/\s/.test(query)) return null;

  if (!isMentionBoundaryChar(startIndex === 0 ? "" : beforeCaret[startIndex - 1])) return null;

  return { query, startIndex };
};

/**
 * 작성 중이던 "@..." 토큰을 "@슬러그 "로 바꾼 텍스트와 그 뒤에 놓을 커서 위치를 돌려준다.
 * startIndex는 getActiveMention이 알려준 "@" 위치, caretIndex는 현재 커서 위치다.
 */
export const insertMention = (
  text: string,
  startIndex: number,
  caretIndex: number,
  slug: string
) => ({
  text: `${text.slice(0, startIndex)}@${slug} ${text.slice(caretIndex)}`,
  caretIndex: startIndex + slug.length + 2,
});
