import { createHmac, timingSafeEqual } from "node:crypto";

const SLACK_SIGNATURE_VERSION = "v0";
/** 이보다 오래된 타임스탬프는 재전송 공격으로 간주해 거부한다. */
const MAX_REQUEST_AGE_SECONDS = 60 * 5;

interface VerifySlackRequestParams {
  rawBody: string;
  timestamp: string | null;
  signature: string | null;
}

/**
 * Slack이 보낸 요청(Events API, Interactivity)의 서명을 검증한다.
 * 반드시 JSON.parse 전의 raw body 문자열로 계산해야 한다 — 파싱 후 재직렬화하면 서명이 어긋난다.
 */
export const verifySlackRequest = ({
  rawBody,
  timestamp,
  signature,
}: VerifySlackRequestParams): boolean => {
  const secret = process.env.SLACK_SIGNING_SECRET;

  if (!secret || !timestamp || !signature) {
    return false;
  }

  const requestAge = Math.abs(Date.now() / 1000 - Number(timestamp));

  if (Number.isNaN(requestAge) || requestAge > MAX_REQUEST_AGE_SECONDS) {
    return false;
  }

  const base = `${SLACK_SIGNATURE_VERSION}:${timestamp}:${rawBody}`;
  const expected = `${SLACK_SIGNATURE_VERSION}=${createHmac("sha256", secret).update(base).digest("hex")}`;

  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(signature, "utf8");

  return (
    expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer)
  );
};
