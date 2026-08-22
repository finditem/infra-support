/**
 * 알림 링크. 하위 일정은 전용 페이지가 없으므로 상위 일정 페이지로 보낸다.
 * SITE_URL이 없으면(로컬 등) 링크를 생략한다.
 */
export const buildTaskUrl = (task: { id: string; parent_id: string | null }) => {
  const siteUrl = process.env.SITE_URL;

  if (!siteUrl) return null;

  return `${siteUrl.replace(/\/$/, "")}/task/${task.parent_id ?? task.id}`;
};
