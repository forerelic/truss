import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@truss/database";

/**
 * Create a Supabase client for server-side operations in Next.js
 *
 * This client is specifically for:
 * - Server Components (reading data)
 * - Server Actions (mutations with revalidation)
 * - API Route Handlers
 *
 * IMPORTANT: Next.js 15 requires `await cookies()` (async API)
 *
 * Usage in Server Component:
 * ```tsx
 * import { getSupabaseServerClient } from '@/lib/supabase/server'
 *
 * export default async function Page() {
 *   const supabase = await getSupabaseServerClient()
 *   const { data } = await supabase.from('projects').select('*')
 *   return <div>{JSON.stringify(data)}</div>
 * }
 * ```
 *
 * Usage in Server Action:
 * ```tsx
 * 'use server'
 *
 * import { getSupabaseServerClient } from '@/lib/supabase/server'
 * import { revalidatePath } from 'next/cache'
 *
 * export async function createProject(formData: FormData) {
 *   const supabase = await getSupabaseServerClient()
 *   const { error } = await supabase.from('projects').insert({...})
 *   if (!error) revalidatePath('/projects')
 * }
 * ```
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase client for API Route Handlers
 *
 * Use this in app/api/* routes when you need to interact with Supabase.
 *
 * Usage:
 * ```tsx
 * import { getSupabaseRouteHandlerClient } from '@/lib/supabase/server'
 *
 * export async function GET(request: Request) {
 *   const supabase = await getSupabaseRouteHandlerClient()
 *   const { data } = await supabase.from('projects').select('*')
 *   return Response.json(data)
 * }
 * ```
 *
 * @returns Supabase client for API routes
 */
export async function getSupabaseRouteHandlerClient(): Promise<
  ReturnType<typeof createServerClient<Database>>
> {
  // Same implementation as server client - Next.js 15 uses cookies() everywhere
  return getSupabaseServerClient();
}

/**
 * Create a Supabase admin client with service role key
 *
 * ⚠️ WARNING: This client bypasses Row Level Security (RLS).
 * Only use for admin operations where you need full database access.
 *
 * NEVER expose this to the client-side!
 *
 * Usage:
 * ```tsx
 * import { getSupabaseAdminClient } from '@/lib/supabase/server'
 *
 * export async function adminDeleteUser(userId: string) {
 *   const supabase = getSupabaseAdminClient()
 *   await supabase.from('users').delete().eq('id', userId)
 * }
 * ```
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
      setAll() {
        // No-op for admin client
      },
    },
  });
}
