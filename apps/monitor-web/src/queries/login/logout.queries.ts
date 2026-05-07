import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks";
import useAppMutation from "../base/useAppMutation";
import { useQueryClient } from "@tanstack/react-query";
import { authQueryKeys } from "../queryKeys";

const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { error: errorToast } = useToast();

  return useAppMutation(logoutUser, {
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authQueryKeys.all });
      navigate("/login");
    },
    onError: () => {
      errorToast("로그아웃에 실패했습니다.", "잠시 후 다시 시도해 주세요.");
    },
  });
};
