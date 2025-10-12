"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Get or create a singleton Supabase client for browser environments.
 *
 * @returns Supabase browser client instance
 */
export function getSupabaseClient() {
  if (client) return client;

  const meta =
    typeof import.meta !== "undefined"
      ? (import.meta as { env?: Record<string, string> })
      : undefined;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || meta?.env?.VITE_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || meta?.env?.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Next.js: Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Vite: Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

  return client;
}

/**
 * Reset the singleton client.
 */
export function resetSupabaseClient() {
  client = undefined;
}
