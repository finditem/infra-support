import { supabase } from "../utils/supabase";
import { ApisRow } from "@infra-support/shared";

type ActiveApiRow = Pick<ApisRow, "id" | "name" | "source_url" | "is_active">;

const getActiveApis = async (): Promise<ActiveApiRow[]> => {
  const { data, error } = await supabase
    .from("apis")
    .select("id, name, source_url, is_active")
    .eq("is_active", true)
    .not("source_url", "is", null);

  if (error) throw new Error(`apis 조회 실패: ${error.message}`);
  return (data ?? []) as ActiveApiRow[];
};

export default getActiveApis;
