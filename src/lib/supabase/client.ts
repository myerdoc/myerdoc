import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Backward compatibility - keep this for any existing code using it
export const supabase = createClient();