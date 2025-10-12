#!/usr/bin/env bun

/**
 * Generate Better Auth migration file for Supabase
 *
 * This script generates a new Supabase migration file containing the Better Auth schema.
 * It should be run whenever you modify Better Auth configuration (add/remove plugins, change fields).
 *
 * Usage:
 *   bun run scripts/generate-auth-migration.ts
 *   bun run scripts/generate-auth-migration.ts --name custom_name
 */

import { $ } from "bun";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT_DIR = join(import.meta.dir, "..");
const MIGRATIONS_DIR = join(ROOT_DIR, "supabase", "migrations");

console.log("🔄 Generating Better Auth migration for Supabase...\n");

// Parse arguments
const args = process.argv.slice(2);
const customName = args.find((arg) => arg.startsWith("--name="))?.split("=")[1];
const migrationName = customName || "update_better_auth_schema";

// Generate timestamp for migration file
const timestamp = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .replace("T", "")
  .replace(/\.\d{3}Z$/, "");

const migrationFile = join(MIGRATIONS_DIR, `${timestamp}_${migrationName}.sql`);

try {
  // Ensure migrations directory exists
  if (!existsSync(MIGRATIONS_DIR)) {
    console.error("❌ Error: supabase/migrations directory not found!");
    console.error('   Run "supabase init" first to set up your project');
    process.exit(1);
  }

  console.log("📡 Generating Better Auth schema...");

  // Use local database URL for schema generation
  const dbUrl = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

  // Generate Better Auth schema to stdout
  const result = await $`DATABASE_URL=${dbUrl} bunx @better-auth/cli generate --output -`.quiet();

  if (result.exitCode !== 0) {
    throw new Error(`Better Auth CLI failed: ${result.stderr}`);
  }

  let schema = result.stdout.toString();

  // Add migration header and comments
  const migrationContent = `-- ================================================
-- Better Auth Schema Migration
-- Generated: ${new Date().toISOString()}
-- ================================================
-- This migration updates the Better Auth schema based on the current
-- configuration in packages/ui/src/lib/auth/server.ts
--
-- IMPORTANT: This migration is idempotent - it uses CREATE TABLE IF NOT EXISTS
-- and CREATE INDEX IF NOT EXISTS to ensure it can be run multiple times safely.
-- ================================================

-- Drop existing Better Auth tables (if updating schema)
-- Uncomment these lines if you need to completely recreate the schema
-- WARNING: This will delete all auth data!
/*
DROP TABLE IF EXISTS "twoFactor" CASCADE;
DROP TABLE IF EXISTS "member" CASCADE;
DROP TABLE IF EXISTS "invitation" CASCADE;
DROP TABLE IF EXISTS "organization" CASCADE;
DROP TABLE IF EXISTS "verification" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "role" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
*/

${schema}

-- ================================================
-- Additional setup for Better Auth integration
-- ================================================

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Add helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_session_userId ON "session"("userId");
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);
CREATE INDEX IF NOT EXISTS idx_account_userId ON "account"("userId");
CREATE INDEX IF NOT EXISTS idx_member_organizationId ON "member"("organizationId");
CREATE INDEX IF NOT EXISTS idx_member_userId ON "member"("userId");

-- Add updated_at triggers for Better Auth tables
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to Better Auth tables that have updatedAt
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY['user', 'session', 'account', 'organization', 'member', 'invitation'])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
    ', t, t, t, t);
  END LOOP;
END $$;

-- ================================================
-- RLS Policies for Better Auth tables
-- ================================================
-- Note: Better Auth handles its own authorization, but we can add
-- RLS policies for additional security if needed

-- Enable RLS on Better Auth tables (optional - disabled by default)
-- ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "organization" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "member" ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (uncomment if you enable RLS)
/*
-- Users can only read their own data
CREATE POLICY "Users can view own profile" ON "user"
  FOR SELECT USING (id = (select auth.uid()::text));

-- Sessions are managed by Better Auth
CREATE POLICY "Sessions managed by service" ON "session"
  FOR ALL USING (true);
*/

-- ================================================
-- Migration completed successfully
-- ================================================`;

  // Write migration file
  writeFileSync(migrationFile, migrationContent);

  console.log(`\n✅ Migration generated successfully!`);
  console.log(`📄 File: ${migrationFile}`);

  console.log("\n📋 Next steps:");
  console.log("   1. Review the migration file");
  console.log("   2. Test locally: bun run db:reset");
  console.log("   3. Push to staging: bun run db:push");
  console.log("   4. Commit the migration file to Git");
} catch (error) {
  console.error("\n❌ Error generating migration:");
  console.error(error);
  console.error("\nTroubleshooting:");
  console.error("1. Ensure local Supabase is running: bun run db:start");
  console.error("2. Check that Better Auth is properly configured");
  console.error("3. Verify packages/ui/src/lib/auth/server.ts exists");
  process.exit(1);
}
