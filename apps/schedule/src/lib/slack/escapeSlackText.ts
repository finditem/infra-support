/**
 * Slack이 제어 문자로 해석하는 세 글자를 이스케이프한다.
 * 일정 제목이나 댓글 본문에 그대로 들어올 수 있어 메시지를 만들기 전에 항상 통과시킨다.
 */
export const escapeSlackText = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
