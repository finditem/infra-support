import { escapeSlackText } from "./escapeSlackText";
import { formatSlackProfile } from "./formatSlackProfile";
import type { CommentMentionNotificationPayload } from "./types";

/** 댓글 본문이 길면 DM이 길어지므로 잘라 보여준다. 전문은 링크로 확인한다. */
const BODY_PREVIEW_LENGTH = 200;

const truncate = (value: string) =>
  value.length > BODY_PREVIEW_LENGTH ? `${value.slice(0, BODY_PREVIEW_LENGTH)}...` : value;

/** 본문을 Slack 인용 블록으로 만든다. 줄마다 ">"가 필요해 줄 단위로 붙인다. */
const toQuote = (body: string) =>
  truncate(body)
    .split("\n")
    .map((line) => `>${escapeSlackText(line)}`)
    .join("\n");

/**
 * 댓글 언급 DM 본문을 만든다. 받는 사람 본인에게만 가는 메시지라 대상 이름은 적지 않고,
 * 누가 어디에 남긴 댓글인지만 적는다. 언급된 사람이 여럿이어도 본문은 같으므로 한 번만 만들어 재사용한다.
 *
 * 작성자는 `<@...>` 형태로 적히지만 DM에 작성자가 참여하지 않으므로 작성자에게 알림이 가지는 않는다.
 */
export const buildCommentMentionMessage = (payload: CommentMentionNotificationPayload): string => {
  const heading = payload.author
    ? `${formatSlackProfile(payload.author)}님이 댓글에서 언급했습니다`
    : "댓글에서 언급되었습니다";

  const lines: string[] = [heading];

  const titleLine = payload.parentTitle
    ? `*${escapeSlackText(payload.taskTitle)}* (상위 일정: ${escapeSlackText(payload.parentTitle)})`
    : `*${escapeSlackText(payload.taskTitle)}*`;
  lines.push(titleLine);

  lines.push(toQuote(payload.body));

  if (payload.url) {
    lines.push(`<${payload.url}|바로 보기>`);
  }

  return lines.join("\n");
};
