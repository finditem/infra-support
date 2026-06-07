import { NextResponse } from "next/server";
import { runMonitoring } from "../../../services/monitoring.service";

export const maxDuration = 60;

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await runMonitoring();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("[POST /api/monitor]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
