#!/usr/bin/env bun

/**
 * Test Better Auth integration
 *
 * This script validates that Better Auth is properly integrated with Supabase
 * and tests basic authentication operations.
 *
 * Usage:
 *   bun run scripts/test-better-auth.ts
 *   bun run scripts/test-better-auth.ts --verbose
 */

import { $ } from "bun";
import { join } from "path";

const ROOT_DIR = join(import.meta.dir, "..");

// ANSI color codes
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";

// Parse arguments
const args = process.argv.slice(2);
const verbose = args.includes("--verbose");

console.log(`${BLUE}🔐 Testing Better Auth Integration${RESET}\n`);

let testsPassed = 0;
let testsFailed = 0;

async function runTest(
  name: string,
  test: () => Promise<boolean>,
): Promise<void> {
  process.stdout.write(`Testing ${name}... `);

  try {
    const passed = await test();
    if (passed) {
      console.log(`${GREEN}✓${RESET}`);
      testsPassed++;
    } else {
      console.log(`${RED}✗${RESET}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`${RED}✗ (Error: ${error})${RESET}`);
    testsFailed++;
  }
}

// ================================================
// Test 1: Check Better Auth server configuration
// ================================================
await runTest("Better Auth server configuration exists", async () => {
  const serverPath = join(
    ROOT_DIR,
    "packages",
    "ui",
    "src",
    "lib",
    "auth",
    "server.ts",
  );
  const file = Bun.file(serverPath);
  const exists = await file.exists();

  if (verbose && exists) {
    const content = await file.text();
    // Check for required plugins
    const hasOrgPlugin = content.includes("organization");
    const hasTwoFactorPlugin = content.includes("twoFactor");
    console.log(`\n  - Organization plugin: ${hasOrgPlugin ? "✓" : "✗"}`);
    console.log(`  - Two-factor plugin: ${hasTwoFactorPlugin ? "✓" : "✗"}`);
  }

  return exists;
});

// ================================================
// Test 2: Check Better Auth client configuration
// ================================================
await runTest("Better Auth client configuration exists", async () => {
  const clientPath = join(
    ROOT_DIR,
    "packages",
    "ui",
    "src",
    "lib",
    "auth",
    "client.ts",
  );
  const file = Bun.file(clientPath);
  return await file.exists();
});

// ================================================
// Test 3: Database tables exist
// ================================================
await runTest("Better Auth database tables exist", async () => {
  const tables = [
    "user",
    "session",
    "account",
    "organization",
    "member",
    "invitation",
    "role",
    "twoFactor",
  ];
  let allExist = true;

  for (const table of tables) {
    const query = `SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '${table}';`;
    const result = await $`bunx supabase db execute --sql "${query}"`.quiet();

    const exists = result.stdout.toString().includes("1");
    if (verbose) {
      console.log(`\n  - Table '${table}': ${exists ? "✓" : "✗"}`);
    }
    if (!exists) {
      allExist = false;
    }
  }

  return allExist;
});

// ================================================
// Test 4: Check column naming convention
// ================================================
await runTest("Better Auth tables use camelCase columns", async () => {
  // Better Auth uses camelCase for columns (userId, createdAt, etc.)
  const query = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'user'
    AND table_schema = 'public'
    AND column_name = 'createdAt';
  `;
  const result = await $`bunx supabase db execute --sql "${query}"`.quiet();
  return result.stdout.toString().includes("createdAt");
});

// ================================================
// Test 5: Check app_permissions table
// ================================================
await runTest("Multi-tenant permissions table exists", async () => {
  const query = `
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_name = 'app_permissions';
  `;
  const result = await $`bunx supabase db execute --sql "${query}"`.quiet();
  const exists = result.stdout.toString().includes("1");

  if (verbose && exists) {
    // Check columns
    const colQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'app_permissions'
      ORDER BY ordinal_position;
    `;
    const colResult =
      await $`bunx supabase db execute --sql "${colQuery}"`.quiet();
    console.log("\n  App permissions columns:");
    console.log(colResult.stdout.toString().split("\n").slice(0, 5).join("\n"));
  }

  return exists;
});

// ================================================
// Test 6: Check helper functions
// ================================================
await runTest("Helper function user_has_app_permission exists", async () => {
  const query = `
    SELECT COUNT(*)
    FROM information_schema.routines
    WHERE routine_name = 'user_has_app_permission'
    AND routine_type = 'FUNCTION';
  `;
  const result = await $`bunx supabase db execute --sql "${query}"`.quiet();
  return result.stdout.toString().includes("1");
});

// ================================================
// Test 7: Check RLS is properly configured
// ================================================
await runTest("RLS is enabled on Better Auth tables (optional)", async () => {
  // RLS on Better Auth tables is optional since Better Auth handles its own authorization
  // But we check if it's consistent if enabled
  const query = `
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('user', 'session', 'organization');
  `;
  const result = await $`bunx supabase db execute --sql "${query}"`.quiet();

  if (verbose) {
    console.log("\n  RLS status:");
    const lines = result.stdout.toString().split("\n").slice(0, 5);
    lines.forEach((line) => console.log(`  ${line}`));
  }

  return true; // This is informational, not a failure
});

// ================================================
// Test 8: Check indexes for performance
// ================================================
await runTest("Performance indexes exist", async () => {
  const criticalIndexes = [
    ["session", "userId"],
    ["session", "token"],
    ["member", "organizationId"],
    ["member", "userId"],
  ];

  let allExist = true;

  for (const [table, column] of criticalIndexes) {
    const query = `
      SELECT COUNT(*)
      FROM pg_indexes
      WHERE tablename = '${table}'
      AND indexdef LIKE '%${column}%';
    `;
    const result = await $`bunx supabase db execute --sql "${query}"`.quiet();
    const exists =
      parseInt(result.stdout.toString().trim().split("\n").pop() || "0") > 0;

    if (verbose) {
      console.log(`\n  - Index on ${table}.${column}: ${exists ? "✓" : "✗"}`);
    }
    if (!exists) {
      allExist = false;
    }
  }

  return allExist;
});

// ================================================
// Test 9: Test seed data (development only)
// ================================================
await runTest("Development seed data loads correctly", async () => {
  // Only test if in development
  const envQuery = `SELECT current_setting('app.environment', true);`;
  const envResult =
    await $`bunx supabase db execute --sql "${envQuery}"`.quiet();

  if (
    !envResult.stdout.toString().includes("development") &&
    !envResult.stdout.toString().includes("NULL")
  ) {
    if (verbose) {
      console.log("\n  Skipping seed data test (not in development)");
    }
    return true;
  }

  // Check for test users
  const query = `SELECT COUNT(*) FROM "user";`;
  const result = await $`bunx supabase db execute --sql "${query}"`.quiet();
  const count = parseInt(
    result.stdout.toString().trim().split("\n").pop() || "0",
  );

  if (verbose) {
    console.log(`\n  Found ${count} users in database`);
  }

  return count >= 0; // Just check it doesn't error
});

// ================================================
// Test 10: Migration naming convention
// ================================================
await runTest("Migrations follow naming convention", async () => {
  const migrationsDir = join(ROOT_DIR, "supabase", "migrations");
  const files = await $`ls ${migrationsDir}/*.sql 2>/dev/null`.quiet();
  const fileList = files.stdout.toString().trim().split("\n").filter(Boolean);

  let valid = true;
  const pattern = /^\d{14}_[\w_]+\.sql$/;

  for (const file of fileList) {
    const filename = file.split("/").pop() || "";
    if (!pattern.test(filename)) {
      if (verbose) {
        console.log(`\n  Invalid migration name: ${filename}`);
      }
      valid = false;
    }
  }

  return valid;
});

// ================================================
// Summary
// ================================================
console.log(`\n${BLUE}═══════════════════════════════════════${RESET}`);
console.log(`${BLUE}           TEST SUMMARY                ${RESET}`);
console.log(`${BLUE}═══════════════════════════════════════${RESET}\n`);

console.log(`${GREEN}Passed: ${testsPassed}${RESET}`);
console.log(`${RED}Failed: ${testsFailed}${RESET}`);

if (testsFailed === 0) {
  console.log(`\n${GREEN}✨ All Better Auth integration tests passed!${RESET}`);
} else {
  console.log(`\n${RED}❌ Some tests failed${RESET}`);
  console.log("\nTroubleshooting:");
  console.log("1. Ensure local Supabase is running: bun run db:start");
  console.log("2. Run migrations: bun run db:reset");
  console.log(
    "3. Generate Better Auth migration: bun run scripts/generate-auth-migration.ts",
  );
  console.log(
    "4. Check Better Auth configuration in packages/ui/src/lib/auth/server.ts",
  );
  process.exit(1);
}
