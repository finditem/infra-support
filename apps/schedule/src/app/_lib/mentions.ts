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
 * "@" 바로 앞 글자가 언급의 시작으로 인정되는지 본다.
 * 앞이 글자나 숫자면 이메일 주소(sjk@example.com)처럼 언급이 아닌 것으로 본다.
 */
const isMentionBoundary = (charBeforeAt: string) =>
  !charBeforeAt || !/[\p{L}\p{N}]/u.test(charBeforeAt);

/** 팀과 개인을 하나의 언급 후보 목록으로 합친다. 팀을 먼저 보여준다. */
export const buildMentionTargets = (
  teams: TeamWithMembers[],
  profiles: ProfileWithColor[]
): MentionTarget[] => [
  ...teams.map((team): MentionTarget => ({ kind: "team", team })),
  ...profiles.map((profile): MentionTarget => ({ kind: "profile", profile })),
];

/**
 * 텍스트 안의 "@슬러그"를 찾아 매칭된 언급 대상을 순서대로 돌려준다.
 * 이메일 주소처럼 단어 중간에 있는 "@"는 건너뛴다.
 * 슬러그가 긴 후보부터 검사해서 "@프론트엔드"가 "@프론트"로 잘못 잡히지 않게 한다.
 * 같은 대상이 여러 번 언급되면 한 번만 담는다.
 */
export const parseMentions = (text: string, targets: MentionTarget[]): MentionTarget[] => {
  const bySlugLengthDesc = [...targets].sort(
    (a, b) => getMentionSlug(b).length - getMentionSlug(a).length
  );
  const matched: MentionTarget[] = [];
  const matchedKeys = new Set<string>();

  for (let index = text.indexOf("@"); index !== -1; index = text.indexOf("@", index + 1)) {
    if (!isMentionBoundary(index === 0 ? "" : text[index - 1])) continue;

    const rest = text.slice(index + 1);
    const target = bySlugLengthDesc.find((candidate) => {
      const slug = getMentionSlug(candidate);
      return slug.length > 0 && rest.startsWith(slug);
    });

    if (!target) continue;

    const key = getMentionKey(target);
    if (!matchedKeys.has(key)) {
      matchedKeys.add(key);
      matched.push(target);
    }

    index += getMentionSlug(target).length;
  }

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

  if (!isMentionBoundary(startIndex === 0 ? "" : beforeCaret[startIndex - 1])) return null;

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
