import type { SupabaseClient } from "@supabase/supabase-js";

/** 하위 일정 알림에 상위 일정 제목을 함께 적기 위해 읽는다. 최상위 일정이면 조회하지 않는다. */
export const loadParentTitle = async (supabase: SupabaseClient, parentId: string | null) => {
  if (!parentId) return null;

  const { data } = await supabase.from("tasks").select("title").eq("id", parentId).maybeSingle();

  return data?.title ?? null;
};
