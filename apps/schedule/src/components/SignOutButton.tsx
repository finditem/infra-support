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
      className="rounded-md border border-border px-3 py-2 text-sm font-medium text-text-default transition hover:bg-fill-neutural-subtle-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      type="button"
      onClick={handleClick}
    >
      로그아웃
    </button>
  );
};
