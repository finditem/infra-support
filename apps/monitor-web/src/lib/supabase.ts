import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const cookieStorage = {
  getItem: (key: string): string | null => {
    const match = document.cookie.split("; ").find((row) => row.startsWith(`${key}=`));
    return match ? decodeURIComponent(match.slice(key.length + 1)) : null;
  },
  setItem: (key: string, value: string): void => {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; SameSite=Lax; Secure`;
  },
  removeItem: (key: string): void => {
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: cookieStorage,
  },
});
