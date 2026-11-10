import { format } from "date-fns";
import { getDefaultDueDate } from "@/app/_lib/kanbanUtils";
import { createServiceClient } from "@/lib/supabase/service";
import { openSlackView } from "../openSlackView";
import { buildTaskCreateModalView } from "../views/taskCreateModalView";

/** 슬래시 커맨드(/일정추가)로 일정 등록 모달을 띄운다. trigger_id가 만료되기 전에 호출해야 한다. */
export const openTaskCreateModal = async (triggerId: string): Promise<void> => {
  const { data: profiles } = await createServiceClient()
    .from("profiles")
    .select("id, name")
    .order("name");

  const defaultDueDate = format(getDefaultDueDate(), "yyyy-MM-dd");
  const view = buildTaskCreateModalView(profiles ?? [], defaultDueDate);

  await openSlackView(triggerId, view);
};
