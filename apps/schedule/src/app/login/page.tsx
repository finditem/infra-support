"use client";

import { Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";

import { createClient } from "@/lib/supabase/client";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInviteExpired = searchParams.get("error") === "invite_expired";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
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
          <h1 className="text-lg font-semibold text-text-default">찾길 팀 일정</h1>
          <p className="mt-1 text-sm text-text-muted">이메일과 비밀번호로 로그인하세요</p>
        </div>
      </div>

      {isInviteExpired && (
        <p className="rounded-lg border border-[rgba(229,34,34,0.24)] bg-[rgba(229,34,34,0.08)] px-3 py-2 text-sm text-fg-state-error dark:bg-[rgba(248,113,113,0.12)]">
          초대 링크가 만료되었거나 유효하지 않습니다. 관리자에게 재초대를 요청해주세요.
        </p>
      )}

      <label className="flex flex-col gap-1.5 text-sm text-text-muted">
        이메일
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input
            aria-label="이메일"
            className="w-full rounded-xl border border-border bg-surface-elevated py-2 pl-9 pr-3 text-text-default outline-none transition focus:border-primary"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
      </label>

      {errorMessage && <p className="text-sm text-fg-state-error">{errorMessage}</p>}

      <button
        className="rounded-full bg-primary px-4 py-2 font-medium text-text-inverse transition hover:bg-primary-hover disabled:opacity-50"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
};

const LoginPage = () => (
  <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface px-4">
    <div
      aria-hidden
      className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(54,222,141,0.35),_transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle,_rgba(54,222,141,0.18),_transparent_70%)]"
    />
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  </main>
);

export default LoginPage;
