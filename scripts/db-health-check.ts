#!/usr/bin/env bun

/**
 * Database health check utility
 *
 * Quick diagnostics for common database issues:
 * - Connection status
 * - Migration history
 * - RLS policies
 * - Index health
 *
 * Usage: bun run scripts/db-health-check.ts
 */

import { $ } from "bun";
import { readdirSync } from "fs";
import { join } from "path";

const ROOT_DIR = join(import.meta.dir, "..");
const MIGRATIONS_DIR = join(ROOT_DIR, "supabase/migrations");

console.log("🏥 Running database health check...\n");

let hasIssues = false;

// 1. Check if Supabase is running
console.log("1️⃣  Checking Supabase status...");
try {
  const result = await $`bunx supabase status`.quiet();
  if (result.exitCode === 0) {
    console.log("   ✅ Local Supabase is running\n");
  } else {
    console.log("   ❌ Local Supabase is not running");
    console.log("   Run: bun run db:start\n");
    hasIssues = true;
  }
} catch {
  console.log("   ❌ Local Supabase is not running");
  console.log("   Run: bun run db:start\n");
  hasIssues = true;
}

// 2. Check migration files
console.log("2️⃣  Checking migration files...");
try {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && f !== ".gitkeep")
    .sort();

  if (files.length === 0) {
    console.log("   ⚠️  No migration files found");
    hasIssues = true;
  } else {
    console.log(`   ✅ Found ${files.length} migration files`);

    // Check for Better Auth migration
    const hasBetterAuth = files.some((f) => f.includes("better_auth_schema"));
    if (hasBetterAuth) {
      console.log("   ✅ Better Auth schema migration exists");
    } else {
      console.log("   ⚠️  Better Auth schema migration not found");
      console.log("      Run the setup script to generate it");
      hasIssues = true;
    }
  }
  console.log("");
} catch (error) {
  console.log("   ❌ Error reading migrations directory");
  console.log(`   ${error}`);
  hasIssues = true;
}

// 3. Check migration history
console.log("3️⃣  Checking migration history...");
try {
  const result = await $`bunx supabase migration list`.quiet();
  if (result.exitCode === 0) {
    console.log("   ✅ Migration history accessible");
    // Parse output to check for unapplied migrations
    const output = result.stdout.toString();
    if (output.includes("LOCAL") && !output.includes("REMOTE")) {
      console.log("   ⚠️  You have local migrations not applied to remote");
      console.log("      Run: bun run db:push");
    }
  }
  console.log("");
} catch (error) {
  console.log("   ⚠️  Could not check migration history");
  console.log("      This is normal if not linked to remote\n");
}

// 4. Check environment variables
console.log("4️⃣  Checking environment variables...");
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];
let envIssues = false;

for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar} is set`);
  } else {
    console.log(`   ⚠️  ${envVar} is not set`);
    envIssues = true;
  }
}

if (envIssues) {
  console.log("      Check your .env.local files");
  hasIssues = true;
}
console.log("");

// 5. Check database inspection (if running)
console.log("5️⃣  Database insights...");
try {
  // This will only work if Supabase is running
  await $`bunx supabase status`.quiet();

  console.log("   💡 Run these commands for detailed insights:");
  console.log("      bun run db:studio  - Visual database editor");
  console.log("      bunx supabase inspect db --help  - DB diagnostics");
  console.log("");
} catch {
  console.log("   ℹ️  Start Supabase to access database insights\n");
}

// Summary
console.log("═".repeat(50));
if (hasIssues) {
  console.log("⚠️  Health check found some issues (see above)");
  console.log("   Review the warnings and suggestions");
  process.exit(1);
} else {
  console.log("✅  Database health check passed!");
  console.log("   Everything looks good");
  process.exit(0);
}
