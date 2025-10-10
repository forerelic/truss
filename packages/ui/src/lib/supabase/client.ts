"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Get or create a singleton Supabase client for browser environments
 * This client is shared across all apps (web + native)
 *
 * @returns Supabase browser client instance
 */
export function getSupabaseClient() {
  if (client) return client;

  // Get environment variables - supports both Next.js and Vite
  // Next.js uses process.env.NEXT_PUBLIC_*
  // Vite uses import.meta.env.VITE_*
  // @ts-expect-error - import.meta.env is Vite-specific
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    // @ts-expect-error - import.meta.env is Vite-specific
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL);

  // @ts-expect-error - import.meta.env is Vite-specific
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    // @ts-expect-error - import.meta.env is Vite-specific
    (typeof import.meta !== "undefined" &&
      import.meta.env?.VITE_SUPABASE_ANON_KEY);

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Next.js: Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Vite: Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

  return client;
}

/**
 * Reset the singleton client (useful for testing or re-initialization)
 */
export function resetSupabaseClient() {
  client = undefined;
}
