/**
 * @truss/database
 *
 * Database package for Supabase PostgreSQL integration
 * Contains generated types and client utilities
 *
 * This package follows 2025 Turborepo best practices:
 * - Single purpose: Database types and client
 * - Generated types from Supabase CLI
 * - Shared across all apps
 *
 * @see https://philipp.steinroetter.com/posts/supabase-turborepo
 */

// Re-export types
export type { Database } from "./types.ts";

// Re-export client utilities
export { getSupabaseClient, resetSupabaseClient } from "./client";
