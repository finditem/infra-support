"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

type CompleteInviteSetupResult = { success: true } | { success: false; message: string };

export const completeInviteSetup = async (
  name: string,
  password: string
): Promise<CompleteInviteSetupResult> => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { success: false, message: "이름을 입력해주세요." };
  }

  if (password.length < 6) {
    return { success: false, message: "비밀번호는 6자 이상 입력해주세요." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, message: "초대 인증이 만료되었습니다. 다시 로그인해주세요." };
  }

  const serviceClient = createServiceClient();
  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .select("registered_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, message: "사용자 정보를 확인할 수 없습니다." };
  }

  if (profile.registered_at) {
    return { success: false, message: "이미 계정 설정이 완료되었습니다." };
  }

  const { error: updateUserError } = await supabase.auth.updateUser({
    password,
    data: { name: trimmedName },
  });

  if (updateUserError) {
    return { success: false, message: "비밀번호 설정에 실패했습니다. 다시 시도해주세요." };
  }

  // 비밀번호 변경이 성공한 요청에서만 service role로 가입 완료 상태를 기록한다.
  // 클라이언트에는 service role 키나 registered_at 수정 권한을 노출하지 않는다.
  const { error: completeProfileError } = await serviceClient
    .from("profiles")
    .update({ name: trimmedName, registered_at: new Date().toISOString() })
    .eq("id", user.id)
    .is("registered_at", null);

  if (completeProfileError) {
    return {
      success: false,
      message: "계정 설정 완료 처리에 실패했습니다. 다시 시도해주세요.",
    };
  }

  return { success: true };
};
