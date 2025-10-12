/**
 * @truss/database
 *
 * Database package for Supabase PostgreSQL integration with generated types and client utilities.
 */

export type { Database } from "./types.ts";
export { getSupabaseClient, resetSupabaseClient } from "./client";
