#!/usr/bin/env bun

/**
 * Safe database push with validation
 *
 * This script validates migrations before pushing to production:
 * 1. Runs SQL validation
 * 2. Shows dry-run preview
 * 3. Requires confirmation
 * 4. Pushes to remote
 *
 * Usage: bun run scripts/db-push-safe.ts
 */

import { $ } from "bun";

console.log("🚀 Safe database push to production\n");
console.log("This will:");
console.log("  1. Validate all SQL migrations");
console.log("  2. Show you what will change (dry-run)");
console.log("  3. Ask for confirmation");
console.log("  4. Push to remote database\n");

// Step 1: Validate migrations
console.log("1️⃣  Validating migrations...");
try {
  await $`bun run scripts/db-validate-migrations.ts`;
  console.log("   ✅ Validation passed\n");
} catch (error) {
  console.error("   ❌ Validation failed");
  console.error("   Fix the issues above before pushing to production");
  process.exit(1);
}

// Step 2: Dry run
console.log("2️⃣  Running dry-run (preview changes)...\n");
try {
  const result = await $`bunx supabase db push --dry-run`;
  console.log(result.stdout.toString());

  if (result.stdout.toString().includes("No new migrations")) {
    console.log("✅ No new migrations to apply");
    process.exit(0);
  }
} catch (error) {
  console.error("❌ Dry-run failed:");
  console.error(error);
  console.error("\nTroubleshooting:");
  console.error("1. Check that you are linked to remote: bunx supabase link");
  console.error("2. Verify DATABASE_URL in .env.local");
  console.error("3. Ensure you have network access to your Supabase project");
  process.exit(1);
}

// Step 3: Confirmation
console.log("\n3️⃣  Confirmation required");
console.log("⚠️  This will modify your PRODUCTION database");
console.log("   Make sure you have:");
console.log("   - Reviewed the changes above");
console.log("   - Tested migrations locally");
console.log("   - Created a database backup\n");

const readline = await import("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const answer = await new Promise<string>((resolve) => {
  rl.question('Type "yes" to continue: ', resolve);
});

rl.close();

if (answer.trim().toLowerCase() !== "yes") {
  console.log("\n❌ Push cancelled");
  process.exit(0);
}

// Step 4: Push
console.log("\n4️⃣  Pushing migrations to production...");
try {
  await $`bunx supabase db push`;

  console.log("\n✅ Migrations pushed successfully!");
  console.log("\n💡 Next steps:");
  console.log("   1. Regenerate types: bun run db:generate:remote");
  console.log("   2. Test your application");
  console.log("   3. Monitor for errors");
} catch (error) {
  console.error("\n❌ Push failed:");
  console.error(error);
  console.error("\nThe remote database was not modified.");
  console.error("Review the error and try again.");
  process.exit(1);
}
