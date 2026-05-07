import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks";
import useAppMutation from "../base/useAppMutation";
import type { LoginFormValues } from "@/pages/Login/types";

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
  const { error: errorToast } = useToast();

  return useAppMutation(loginWithEmail, {
    onSuccess: () => {
      navigate("/");
    },

    onError: (error: Error) => {
      if (error.message === "Invalid login credentials") {
        errorToast("로그인에 실패했습니다.", "아이디 또는 비밀번호가 올바르지 않습니다");
        return;
      }
      errorToast("로그인에 실패했습니다.", "잠시 후 다시 시도해 주세요.");
    },
  });
};
