"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export const SignOutButton = () => {
  const router = useRouter();

  const handleClick = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      className="rounded-full border border-border px-4 py-2 font-medium text-text-default transition hover:bg-fill-neutural-subtle-hover"
      type="button"
      onClick={handleClick}
    >
      로그아웃
    </button>
  );
};
