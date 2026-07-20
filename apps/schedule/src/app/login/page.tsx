"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

const LoginPage = () => {
  const router = useRouter();
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface">
      <form
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-surface-elevated p-8"
        onSubmit={handleSubmit}
      >
        <h1 className="text-lg font-medium text-text-default">팀 일정 관리</h1>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          이메일
          <input
            aria-label="이메일"
            className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-text-default outline-none focus:border-primary"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          비밀번호
          <input
            aria-label="비밀번호"
            className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-text-default outline-none focus:border-primary"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
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
    </main>
  );
};

export default LoginPage;
