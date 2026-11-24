import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

const DEFAULT_SUPABASE_URL = "https://lduljzvcukjttpheecsq.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdWxqenZjdWtqdHRwaGVlY3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MzQ5MzIsImV4cCI6MjExMTExMDkzMn0.yCGsHirPZKMPgE_rw0P3tGRyYXKc8-ehL4mNWPEPMPw";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Singleton instance for client-side component calls
export const supabase = createClient();
