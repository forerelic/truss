#!/usr/bin/env bun

/**
 * Check for TypeScript type drift
 *
 * This script generates types from the current database schema and compares
 * them with the committed types.ts file. If they differ, it means the schema
 * has changed but types haven't been regenerated.
 *
 * This is used in CI to ensure types stay in sync with migrations.
 *
 * Usage:
 * bun run scripts/db-check-type-drift.ts
 * bun run db:types:check
 */

import { $ } from "bun";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const ROOT_DIR = join(import.meta.dir, "..");
const TYPES_FILE = join(ROOT_DIR, "packages/database/src/types.ts");
const TEMP_DIR = join(ROOT_DIR, ".temp");
const TEMP_TYPES_FILE = join(TEMP_DIR, "types-generated.ts");

console.log("🔍 Checking for TypeScript type drift...\n");

// Ensure temp directory exists
if (!existsSync(TEMP_DIR)) {
  mkdirSync(TEMP_DIR, { recursive: true });
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
  const localRunning = await isLocalRunning();

  if (!localRunning) {
    console.error("❌ Error: Local Supabase is not running!");
    console.error("   Start it with: bunx supabase start");
    process.exit(1);
  }

  console.log("📡 Generating types from current schema...");

  // Generate types from local database
  await $`bunx supabase gen types typescript --local > ${TEMP_TYPES_FILE}`;

  console.log("🔄 Comparing with committed types...\n");

  // Compare files
  try {
    const result = await $`diff -u ${TYPES_FILE} ${TEMP_TYPES_FILE}`.quiet();

    // If diff exits with 0, files are identical
    if (result.exitCode === 0) {
      console.log("✅ No type drift detected!");
      console.log("   Committed types match current schema.\n");

      // Clean up temp file
      await $`rm ${TEMP_TYPES_FILE}`;
      process.exit(0);
    }
  } catch (error) {
    // diff exits with 1 if files differ
    console.log("❌ TYPE DRIFT DETECTED!\n");
    console.log("The committed types.ts file does not match the current database schema.");
    console.log("This usually means:");
    console.log("  1. You created a migration but forgot to regenerate types");
    console.log("  2. You modified the schema manually without updating types\n");

    // Show the diff
    console.log("📋 Differences found:\n");
    try {
      await $`diff -u ${TYPES_FILE} ${TEMP_TYPES_FILE}`;
    } catch {
      // diff command will exit with 1 when showing differences, that's expected
    }

    console.log("\n🔧 To fix this:");
    console.log("   1. Regenerate types: bun run db:generate");
    console.log("   2. Review the changes");
    console.log("   3. Commit the updated types.ts file\n");

    // Clean up temp file
    await $`rm ${TEMP_TYPES_FILE}`;
    process.exit(1);
  }
} catch (error) {
  console.error("\n❌ Error checking type drift:");
  console.error(error);

  // Clean up temp file if it exists
  if (existsSync(TEMP_TYPES_FILE)) {
    await $`rm ${TEMP_TYPES_FILE}`;
  }

  process.exit(1);
}
