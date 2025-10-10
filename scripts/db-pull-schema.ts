#!/usr/bin/env bun

/**
 * Pull schema from production database
 *
 * This script pulls the current schema from your production Supabase database
 * and creates a new migration file. Useful for:
 * - Syncing changes made in Supabase Studio
 * - Starting with an existing database
 * - Capturing manual schema changes
 *
 * Prerequisites:
 * - SUPABASE_DB_URL in .env.local
 * - Supabase project linked: bunx supabase link
 *
 * Usage:
 * bun run db:pull
 */

import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";

const ROOT_DIR = join(import.meta.dir, "..");
const ENV_FILE = join(ROOT_DIR, ".env.local");

console.log("🔄 Pulling schema from production database...\n");

if (!existsSync(ENV_FILE)) {
  console.error("❌ Error: .env.local not found!");
  console.error("   Create .env.local with SUPABASE_DB_URL");
  process.exit(1);
}

console.log(
  "⚠️  This will create a new migration with ALL current schema changes.",
);
console.log("   Review the migration file before committing!");
console.log("\n   Press Ctrl+C within 5 seconds to cancel...\n");
await Bun.sleep(5000);

try {
  await $`bunx supabase db pull`;

  console.log("\n✅ Schema pulled successfully!");
  console.log("\n📋 Next steps:");
  console.log("   1. Review the new migration in supabase/migrations/");
  console.log("   2. Test locally: bun run db:migrate");
  console.log("   3. Generate types: bun run db:generate");
  console.log("   4. Commit the migration to git");
} catch (error) {
  console.error("\n❌ Error pulling schema:");
  console.error(error);
  console.error("\nTroubleshooting:");
  console.error("1. Check SUPABASE_DB_URL in .env.local");
  console.error("2. Verify project is linked: bunx supabase link");
  console.error("3. Ensure Docker is running (required for schema diffing)");
  process.exit(1);
}
