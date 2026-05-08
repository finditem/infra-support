import { supabase } from "@/lib/supabase";
import useAppQuery from "../base/useAppQuery";
import { authQueryKeys } from "../queryKeys";

const getUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const useUserQuery = () => {
  return useAppQuery(authQueryKeys.user(), getUser);
};
