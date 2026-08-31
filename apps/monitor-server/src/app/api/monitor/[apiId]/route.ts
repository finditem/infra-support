import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { resolveCorsHeaders } from "@/lib/cors";
import { runManualCheck, type ManualCheckFailureReason } from "@/services/monitoring.service";

export const maxDuration = 60;

const FAILURE_STATUS: Record<ManualCheckFailureReason, number> = {
  not_found: 404,
  inactive: 409,
  no_request_url: 409,
  save_failed: 500,
};

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: resolveCorsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ apiId: string }> }) {
  const corsHeaders = resolveCorsHeaders(request.headers.get("origin"));
  const { apiId } = await params;

  const isAuthorized = await verifyAccessToken(request.headers.get("authorization"));

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  try {
    const outcome = await runManualCheck(apiId);

    if (!outcome.ok) {
      return NextResponse.json(
        { ok: false, reason: outcome.reason },
        { status: FAILURE_STATUS[outcome.reason], headers: corsHeaders }
      );
    }

    return NextResponse.json({ ok: true, result: outcome.result }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("[POST /api/monitor/" + apiId + "]", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
