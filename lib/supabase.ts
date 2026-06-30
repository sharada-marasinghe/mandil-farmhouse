import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use placeholder fallbacks to prevent Next.js build-time pre-rendering errors
export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseServiceKey || "placeholder-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
