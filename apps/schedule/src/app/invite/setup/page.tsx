"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { ProfilesUpdate } from "@/types/tables";

const InviteSetupPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error: updateUserError } = await supabase.auth.updateUser({
      password,
      data: { name },
    });

    if (updateUserError || !data.user) {
      setIsSubmitting(false);
      setErrorMessage("설정에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    const profileUpdate: ProfilesUpdate = { name };
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", data.user.id);

    setIsSubmitting(false);

    if (updateProfileError) {
      setErrorMessage("이름 저장에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface">
      <form
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-surface-elevated p-8"
        onSubmit={handleSubmit}
      >
        <h1 className="text-lg font-medium text-text-default">계정 설정</h1>
        <p className="text-sm text-text-muted">이름과 비밀번호를 설정하고 시작하세요.</p>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          이름
          <input
            aria-label="이름"
            className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-text-default outline-none focus:border-primary"
            required
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          비밀번호
          <input
            aria-label="비밀번호"
            className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-text-default outline-none focus:border-primary"
            minLength={6}
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          비밀번호 확인
          <input
            aria-label="비밀번호 확인"
            className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-text-default outline-none focus:border-primary"
            minLength={6}
            required
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
          />
        </label>

        {errorMessage && <p className="text-sm text-fg-state-error">{errorMessage}</p>}

        <button
          className="rounded-full bg-primary px-4 py-2 font-medium text-text-inverse transition hover:bg-primary-hover disabled:opacity-50"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "설정 중..." : "설정 완료"}
        </button>
      </form>
    </main>
  );
};

export default InviteSetupPage;
