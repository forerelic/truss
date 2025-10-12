#!/usr/bin/env bun

/**
 * Validate environment configuration and setup
 *
 * This script checks that all required environment variables are set
 * and validates the connection to Supabase and Better Auth.
 *
 * Usage:
 *   bun run scripts/validate-environment.ts
 *   bun run scripts/validate-environment.ts --env staging
 *   bun run scripts/validate-environment.ts --env production
 */

import { $ } from "bun";
import { existsSync } from "fs";
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
const envFlag = args.find((arg) => arg.startsWith("--env="))?.split("=")[1];
const environment = envFlag || "local";

console.log(`${BLUE}🔍 Validating ${environment} environment...${RESET}\n`);

// Environment-specific configuration
const requiredEnvVars = {
  local: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "DATABASE_URL"],
  staging: ["STAGING_PROJECT_ID", "STAGING_DB_PASSWORD", "SUPABASE_ACCESS_TOKEN"],
  production: ["PRODUCTION_PROJECT_ID", "PRODUCTION_DB_PASSWORD", "SUPABASE_ACCESS_TOKEN"],
};

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function checkMark(passed: boolean): string {
  return passed ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
}

function warning(message: string): void {
  console.log(`${YELLOW}⚠️  ${message}${RESET}`);
  checks.warnings++;
}

function success(message: string): void {
  console.log(`${GREEN}✅ ${message}${RESET}`);
  checks.passed++;
}

function error(message: string): void {
  console.log(`${RED}❌ ${message}${RESET}`);
  checks.failed++;
}

// ================================================
// 1. Check environment files
// ================================================
console.log(`${BLUE}1. Checking environment files...${RESET}`);

const envFile = join(ROOT_DIR, ".env.local");
if (existsSync(envFile)) {
  success(".env.local file exists");
} else {
  error(".env.local file not found - copy .env.example to .env.local");
}

// ================================================
// 2. Check required environment variables
// ================================================
console.log(`\n${BLUE}2. Checking environment variables...${RESET}`);

// Load environment variables
if (existsSync(envFile)) {
  const envContent = await Bun.file(envFile).text();
  const envLines = envContent.split("\n");

  for (const line of envLines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        process.env[key] = valueParts.join("=").trim();
      }
    }
  }
}

const vars = requiredEnvVars[environment as keyof typeof requiredEnvVars] || requiredEnvVars.local;

for (const varName of vars) {
  if (process.env[varName]) {
    success(`${varName} is set`);
  } else {
    error(`${varName} is not set`);
  }
}

// Check for sensitive variables that shouldn't have default values
if (environment !== "local") {
  if (process.env.DATABASE_URL?.includes("postgres:postgres")) {
    warning("DATABASE_URL contains default password - update for production");
  }
  if (process.env.BETTER_AUTH_SECRET === "your-secret-key-here") {
    error("BETTER_AUTH_SECRET has default value - generate a secure key");
  }
}

// ================================================
// 3. Check Supabase CLI
// ================================================
console.log(`\n${BLUE}3. Checking Supabase CLI...${RESET}`);

try {
  const result = await $`bunx supabase --version`.quiet();
  const version = result.stdout.toString().trim();
  success(`Supabase CLI installed: ${version}`);
} catch {
  error("Supabase CLI not installed or not accessible");
}

// ================================================
// 4. Check database connection
// ================================================
console.log(`\n${BLUE}4. Checking database connection...${RESET}`);

if (environment === "local") {
  // Check local Supabase
  try {
    const statusResult = await $`bunx supabase status`.quiet();
    if (statusResult.exitCode === 0) {
      success("Local Supabase is running");

      // Test database connection
      const dbUrl = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
      const testQuery = `SELECT version();`;

      try {
        await $`bunx supabase db execute --sql "${testQuery}"`.quiet();
        success("Local database connection successful");
      } catch {
        error("Failed to connect to local database");
      }
    } else {
      warning('Local Supabase not running - run "bun run db:start"');
    }
  } catch {
    warning('Local Supabase not running - run "bun run db:start"');
  }
} else {
  // Check remote connection
  const projectId = process.env[`${environment.toUpperCase()}_PROJECT_ID`];
  if (projectId) {
    try {
      await $`bunx supabase link --project-ref ${projectId}`.quiet();
      success(`Linked to ${environment} project: ${projectId}`);
    } catch {
      error(`Failed to link to ${environment} project`);
    }
  } else {
    error(`${environment.toUpperCase()}_PROJECT_ID not set`);
  }
}

// ================================================
// 5. Check Better Auth tables
// ================================================
console.log(`\n${BLUE}5. Checking Better Auth tables...${RESET}`);

if (environment === "local") {
  try {
    const tables = ["user", "session", "account", "organization", "member"];
    for (const table of tables) {
      const query = `SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '${table}';`;
      const result = await $`bunx supabase db execute --sql "${query}"`.quiet();

      if (result.stdout.toString().includes("1")) {
        success(`Table '${table}' exists`);
      } else {
        error(`Table '${table}' not found - run migrations`);
      }
    }
  } catch {
    warning("Could not verify Better Auth tables");
  }
}

// ================================================
// 6. Check migrations
// ================================================
console.log(`\n${BLUE}6. Checking migrations...${RESET}`);

const migrationsDir = join(ROOT_DIR, "supabase", "migrations");
if (existsSync(migrationsDir)) {
  const files = await $`ls ${migrationsDir}/*.sql 2>/dev/null | wc -l`.quiet();
  const count = parseInt(files.stdout.toString().trim());

  if (count > 0) {
    success(`Found ${count} migration files`);

    // Check for Better Auth migration
    const authMigration = await $`ls ${migrationsDir}/*better_auth*.sql 2>/dev/null`.quiet();
    if (authMigration.stdout.toString().trim()) {
      success("Better Auth migration exists");
    } else {
      warning('No Better Auth migration found - run "bun run scripts/generate-auth-migration.ts"');
    }
  } else {
    error("No migration files found");
  }
} else {
  error("Migrations directory not found");
}

// ================================================
// 7. Check seed data configuration
// ================================================
console.log(`\n${BLUE}7. Checking seed data...${RESET}`);

const seedFile = join(ROOT_DIR, "supabase", "seed.sql");
const seedsDir = join(ROOT_DIR, "supabase", "seeds");

if (existsSync(seedFile)) {
  success("Main seed.sql file exists");
} else {
  error("seed.sql file not found");
}

if (existsSync(seedsDir)) {
  const seedFiles = await $`ls ${seedsDir}/*.sql 2>/dev/null | wc -l`.quiet();
  const seedCount = parseInt(seedFiles.stdout.toString().trim());

  if (seedCount > 0) {
    success(`Found ${seedCount} seed files in seeds directory`);
  } else {
    warning("No seed files in seeds directory");
  }
} else {
  warning("Seeds directory not found");
}

// ================================================
// 8. Check TypeScript types
// ================================================
console.log(`\n${BLUE}8. Checking TypeScript types...${RESET}`);

const typesFile = join(ROOT_DIR, "packages", "ui", "src", "lib", "supabase", "types.ts");
if (existsSync(typesFile)) {
  const stats = await Bun.file(typesFile).text();
  if (stats.length > 100) {
    success("Supabase types file exists and has content");
  } else {
    warning('Supabase types file exists but appears empty - run "bun run db:generate"');
  }
} else {
  warning('Supabase types not generated - run "bun run db:generate"');
}

// ================================================
// 9. Check package.json scripts
// ================================================
console.log(`\n${BLUE}9. Checking package.json scripts...${RESET}`);

const packageJson = JSON.parse(await Bun.file(join(ROOT_DIR, "package.json")).text());
const requiredScripts = [
  "db:start",
  "db:stop",
  "db:reset",
  "db:push",
  "db:generate",
  "db:migration:new",
];

for (const script of requiredScripts) {
  if (packageJson.scripts[script]) {
    success(`Script '${script}' exists`);
  } else {
    error(`Script '${script}' not found in package.json`);
  }
}

// ================================================
// Summary
// ================================================
console.log(`\n${BLUE}═══════════════════════════════════════${RESET}`);
console.log(`${BLUE}           VALIDATION SUMMARY           ${RESET}`);
console.log(`${BLUE}═══════════════════════════════════════${RESET}\n`);

console.log(`Environment: ${environment}`);
console.log(`${GREEN}Passed: ${checks.passed}${RESET}`);
console.log(`${RED}Failed: ${checks.failed}${RESET}`);
console.log(`${YELLOW}Warnings: ${checks.warnings}${RESET}`);

if (checks.failed === 0) {
  console.log(`\n${GREEN}✨ Environment validation passed!${RESET}`);

  if (checks.warnings > 0) {
    console.log(`${YELLOW}⚠️  Some warnings were found - review them above${RESET}`);
  }

  console.log("\nNext steps:");
  if (environment === "local") {
    console.log("  1. Run migrations: bun run db:reset");
    console.log("  2. Generate types: bun run db:generate");
    console.log("  3. Start development: bun run dev:precision");
  } else {
    console.log(
      `  1. Deploy to ${environment}: git push origin ${environment === "staging" ? "develop" : "main"}`
    );
    console.log("  2. Monitor deployment: Check GitHub Actions");
  }
} else {
  console.log(`\n${RED}❌ Validation failed - fix the issues above${RESET}`);
  process.exit(1);
}
