import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@truss/database";

/**
 * Create a Supabase client for server-side operations in Next.js Server Components,
 * Server Actions, and API Route Handlers.
 *
 * @returns Supabase server client with cookie-based session management
 */
export async function getSupabaseServerClient(): Promise<
  ReturnType<typeof createServerClient<Database>>
> {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore errors from Server Components
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase client for API Route Handlers.
 *
 * @returns Supabase client for API routes
 */
export async function getSupabaseRouteHandlerClient(): Promise<
  ReturnType<typeof createServerClient<Database>>
> {
  return getSupabaseServerClient();
}

/**
 * Create a Supabase admin client with service role key.
 *
 * WARNING: This client bypasses Row Level Security (RLS).
 * Only use for admin operations. Never expose to client-side code.
 *
 * @returns Supabase admin client (bypasses RLS)
 */
export function getSupabaseAdminClient(): ReturnType<typeof createServerClient<Database>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase admin credentials. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-side only)."
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
}
