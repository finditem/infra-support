import { SignOutButton } from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";

const HomePage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
      <p className="text-text-default">{user?.email} 님, 안녕하세요.</p>
      <p className="text-text-muted">칸반보드는 다음 단계에서 구현됩니다.</p>
      <SignOutButton />
    </main>
  );
};

export default HomePage;
