import { Loader2 } from "lucide-react";
import { NavBar } from "@/components/NavBar";

const CalendarLoading = () => (
  <main className="flex min-h-screen flex-col bg-surface">
    <NavBar />
    <div className="flex flex-1 items-center justify-center">
      <Loader2 className="size-6 animate-spin text-text-muted" />
    </div>
  </main>
);

export default CalendarLoading;
