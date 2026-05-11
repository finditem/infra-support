type ApiRow = {
  id: string;
  name: string;
  source_url: string | null;
  is_active: boolean | null;
};

import { supabase } from "../utils/supabase";

const getActiveApis = async (): Promise<ApiRow[]> => {
  const { data, error } = await supabase
    .from("apis")
    .select("id, name, source_url, is_active")
    .eq("is_active", true)
    .not("source_url", "is", null);

  if (error) throw new Error(`apis 조회 실패: ${error.message}`);
  return (data ?? []) as ApiRow[];
};

export default getActiveApis;
