"use client";

import { Lock, User } from "lucide-react";
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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(54,222,141,0.35),_transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle,_rgba(54,222,141,0.18),_transparent_70%)]"
      />
      <form
        className="relative z-10 flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-border bg-surface-elevated p-10 shadow-[0_24px_48px_rgba(0,0,0,0.16)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <img
            alt="찾길 팀 일정"
            className="size-14 rounded-[14px] shadow-[0_8px_20px_rgba(27,197,135,0.35)]"
            height={56}
            src="/logo.svg"
            width={56}
          />
          <div>
            <h1 className="text-lg font-semibold text-text-default">계정 설정</h1>
            <p className="mt-1 text-sm text-text-muted">이름과 비밀번호를 설정하고 시작하세요</p>
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-text-muted">
          이름
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              aria-label="이름"
              className="w-full rounded-xl border border-border bg-surface-elevated py-2 pl-9 pr-3 text-text-default outline-none transition focus:border-primary"
              required
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-text-muted">
          비밀번호
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              aria-label="비밀번호"
              className="w-full rounded-xl border border-border bg-surface-elevated py-2 pl-9 pr-3 text-text-default outline-none transition focus:border-primary"
              minLength={6}
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-text-muted">
          비밀번호 확인
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              aria-label="비밀번호 확인"
              className="w-full rounded-xl border border-border bg-surface-elevated py-2 pl-9 pr-3 text-text-default outline-none transition focus:border-primary"
              minLength={6}
              required
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
            />
          </div>
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
