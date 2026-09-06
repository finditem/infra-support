import { NextResponse } from "next/server";
import { carryOverIncompleteTasks } from "@/app/_lib/carryOverTasks";
import { verifyCronRequest } from "@/lib/cron/verifyCronRequest";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * 지난주에 완료하지 못한 일정을 이번 주 보드로 이월한다.
 * 매주 월요일 09:00 KST(vercel.json의 cron 스케줄)에 호출된다.
 */
export const GET = async (request: Request) => {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await carryOverIncompleteTasks(createServiceClient());

  if (!result) {
    return NextResponse.json({ error: "미완료 일정을 이월하지 못했어요." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...result });
};
