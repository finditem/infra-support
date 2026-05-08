import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks";
import useAppMutation from "../base/useAppMutation";
import { LoginFormValues } from "@/pages/Login/types";
import { useQueryClient } from "@tanstack/react-query";
import { authQueryKeys } from "../queryKeys";

const loginWithEmail = async ({ username, password }: LoginFormValues) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: username,
    password,
  });
  if (error) throw error;
  return data;
};

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { error: errorToast } = useToast();

  const from = location.state?.from || "/";

  return useAppMutation(loginWithEmail, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user() });
      navigate(from, { replace: true });
    },

    onError: (error: Error) => {
      if ("code" in error && error.code === "invalid_credentials") {
        errorToast("로그인에 실패했습니다.", "아이디 또는 비밀번호가 올바르지 않습니다");
        return;
      }
      errorToast("로그인에 실패했습니다.", "잠시 후 다시 시도해 주세요.");
    },
  });
};
