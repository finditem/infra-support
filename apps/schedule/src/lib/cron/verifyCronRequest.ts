/**
 * Vercel Cron이 호출하는 /api/cron/* 라우트를 CRON_SECRET으로 인증한다.
 * Vercel Cron은 요청에 `Authorization: Bearer ${CRON_SECRET}` 헤더를 자동으로 붙인다.
 */
export const verifyCronRequest = (request: Request): boolean => {
  const secret = process.env.CRON_SECRET;

  if (!secret) return false;

  return request.headers.get("authorization") === `Bearer ${secret}`;
};
