#!/usr/bin/env bun

/**
 * Generate TypeScript types from Supabase database schema
 *
 * This script uses the Supabase CLI to generate types from your database.
 * It can work with either:
 * 1. Local Supabase instance (if Docker is running)
 * 2. Remote production database (via SUPABASE_DB_URL)
 *
 * Prerequisites:
 * - Set environment variables in .env.local (root)
 * - For local: Docker running + `bunx supabase start`
 * - For remote: SUPABASE_DB_URL set
 *
 * Usage:
 * bun run db:generate              # Use local if available, fallback to remote
 * bun run db:generate --remote     # Force remote
 * bun run db:generate --local      # Force local
 */

import { $ } from "bun";
import { existsSync } from "fs";
import { join } from "path";

const ROOT_DIR = join(import.meta.dir, "..");
const ENV_FILE = join(ROOT_DIR, ".env.local");
const OUTPUT_FILE = join(ROOT_DIR, "packages/database/src/types.ts");

// Parse CLI arguments
const args = process.argv.slice(2);
const forceRemote = args.includes("--remote");
const forceLocal = args.includes("--local");

console.log("🔄 Generating Supabase types...\n");

// Load environment variables
let dbUrl = "";
if (existsSync(ENV_FILE)) {
  const envContent = await Bun.file(ENV_FILE).text();
  const dbUrlMatch = envContent.match(/SUPABASE_DB_URL=(.+)/);
  if (dbUrlMatch && dbUrlMatch[1]) {
    dbUrl = dbUrlMatch[1].trim();
  }
}

// Check if local Supabase is running
const isLocalRunning = async () => {
  try {
    const result = await $`bunx supabase status`.quiet();
    return result.exitCode === 0;
  } catch {
    return false;
  }
};

try {
  let source = "";
  let command = "";

  if (forceLocal) {
    source = "local";
    command = `bunx supabase gen types typescript --local > ${OUTPUT_FILE}`;
  } else if (forceRemote) {
    if (!dbUrl) {
      console.error("❌ Error: SUPABASE_DB_URL not found in .env.local!");
      console.error("   Add SUPABASE_DB_URL to .env.local");
      process.exit(1);
    }
    source = "remote";
    command = `bunx supabase gen types typescript --db-url ${dbUrl} > ${OUTPUT_FILE}`;
  } else {
    // Auto-detect: prefer local if running, otherwise use remote
    const localRunning = await isLocalRunning();

    if (localRunning) {
      source = "local (auto-detected)";
      command = `bunx supabase gen types typescript --local > ${OUTPUT_FILE}`;
    } else if (dbUrl) {
      source = "remote (auto-detected, local not running)";
      command = `bunx supabase gen types typescript --db-url ${dbUrl} > ${OUTPUT_FILE}`;
    } else {
      console.error("❌ Error: No database source available!");
      console.error("   Either:");
      console.error("   1. Start local Supabase: bunx supabase start");
      console.error("   2. Set SUPABASE_DB_URL in .env.local");
      process.exit(1);
    }
  }

  console.log(`📡 Connecting to Supabase database (${source})...`);
  await $`sh -c ${command}`;

  console.log("✅ Types generated successfully!");
  console.log(`📝 Saved to: ${OUTPUT_FILE}`);
  console.log(`🌐 Source: ${source}`);
  console.log("\n🎉 Done! Your database types are now up to date.");
} catch (error) {
  console.error("\n❌ Error generating types:");
  console.error(error);
  console.error("\nTroubleshooting:");
  console.error("1. For local: Ensure Docker is running and `bunx supabase start` completed");
  console.error("2. For remote: Check that SUPABASE_DB_URL is correct in .env.local");
  console.error("3. Verify database connection and permissions");
  process.exit(1);
}
