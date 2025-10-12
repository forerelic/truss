/**
 * Environment Variable Validation
 *
 * This file provides runtime type-safety for environment variables using Zod.
 * Variables are validated at build time and runtime, catching configuration errors early.
 *
 * Usage:
 *   import { env } from "@/env";
 *   console.log(env.DATABASE_URL);
 *
 * @see https://env.t3.gg/docs/nextjs
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables
   * These are never sent to the client
   */
  server: {
    // Database
    DATABASE_URL: z.string().url().describe("PostgreSQL database connection URL"),
    SUPABASE_DB_URL: z.string().url().optional().describe("Alternative Supabase database URL"),

    // Authentication
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "BETTER_AUTH_SECRET must be at least 32 characters")
      .describe("Secret key for encrypting sessions and tokens"),

    // OAuth Providers (Optional)
    GITHUB_CLIENT_ID: z.string().optional().describe("GitHub OAuth client ID"),
    GITHUB_CLIENT_SECRET: z.string().optional().describe("GitHub OAuth client secret"),
    GOOGLE_CLIENT_ID: z.string().optional().describe("Google OAuth client ID"),
    GOOGLE_CLIENT_SECRET: z.string().optional().describe("Google OAuth client secret"),

    // Email (Optional)
    EMAIL_FROM: z.string().email().optional().describe("Email sender address"),
    RESEND_API_KEY: z.string().optional().describe("Resend API key for sending emails"),

    // Supabase Service Role (Optional - WARNING: Bypasses RLS)
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional().describe("Supabase service role key"),

    // Environment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },

  /**
   * Client-side environment variables
   * These are exposed to the browser and must be prefixed with NEXT_PUBLIC_
   */
  client: {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().describe("Supabase project URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z
      .string()
      .min(1)
      .describe("Supabase anonymous key (public, safe to expose)"),

    // Application
    NEXT_PUBLIC_APP_URL: z
      .string()
      .url()
      .describe("Full URL of the application (for OAuth callbacks)"),
  },

  /**
   * Shared environment variables
   * Available on both client and server but must be prefixed with NEXT_PUBLIC_
   */
  shared: {
    // Add shared variables here if needed
  },

  /**
   * Runtime environment variables
   * Map process.env to the schema
   */
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    EMAIL_FROM: process.env.EMAIL_FROM,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: process.env.NODE_ENV,

    // Client
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  /**
   * Skip validation during build for easier debugging
   * Set to false in production
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes it so that empty strings are treated as undefined
   * Useful when using environment variable files
   */
  emptyStringAsUndefined: true,
});
