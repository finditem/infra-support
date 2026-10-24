import { Loader2 } from "lucide-react";

const HomeLoading = () => (
  <main className="flex min-h-screen flex-col bg-surface">
    <div className="flex flex-1 items-center justify-center">
      <Loader2 className="size-6 animate-spin text-text-muted" />
    </div>
  </main>
);

export default HomeLoading;
