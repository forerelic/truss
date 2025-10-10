#!/usr/bin/env bun

/**
 * Validate migration files before committing
 *
 * This script checks SQL syntax and common issues in migration files.
 * Can be used as a pre-commit hook or run manually.
 *
 * Usage: bun run scripts/db-validate-migrations.ts [migration-file]
 */

import { $ } from "bun";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const ROOT_DIR = join(import.meta.dir, "..");
const MIGRATIONS_DIR = join(ROOT_DIR, "supabase/migrations");

// Get migration file from args or validate all
const args = process.argv.slice(2);
const targetFile = args[0];

console.log("🔍 Validating SQL migrations...\n");

interface ValidationError {
  file: string;
  line?: number;
  issue: string;
  severity: "error" | "warning";
}

const errors: ValidationError[] = [];

// Common SQL issues to check
const checks = [
  {
    pattern: /DROP TABLE (?!IF EXISTS)/gi,
    message: "DROP TABLE without IF EXISTS - dangerous for production",
    severity: "error" as const,
  },
  {
    pattern: /ALTER TABLE (?!.*IF (?:NOT )?EXISTS)/gi,
    message: "ALTER TABLE should use IF EXISTS/IF NOT EXISTS for safety",
    severity: "warning" as const,
  },
  {
    pattern: /CREATE TABLE (?!.*IF NOT EXISTS)/gi,
    message: "CREATE TABLE without IF NOT EXISTS - may fail on rerun",
    severity: "warning" as const,
  },
  {
    pattern: /REFERENCES\s+\w+\s*\([^)]+\)(?!\s+ON DELETE)/gi,
    message: "Foreign key without ON DELETE clause - may cause issues",
    severity: "warning" as const,
  },
  {
    pattern: /ALTER TABLE.*ENABLE ROW LEVEL SECURITY/i,
    message: "Good: RLS enabled",
    severity: "warning" as const,
    isPositive: true,
  },
];

function validateFile(filePath: string, fileName: string) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Check for empty file
  if (content.trim().length === 0) {
    errors.push({
      file: fileName,
      issue: "Empty migration file",
      severity: "warning",
    });
    return;
  }

  // Run pattern checks
  for (const check of checks) {
    if (check.isPositive) continue; // Skip positive checks for errors

    const matches = content.match(check.pattern);
    if (matches) {
      // Find line number
      for (let i = 0; i < lines.length; i++) {
        if (check.pattern.test(lines[i])) {
          errors.push({
            file: fileName,
            line: i + 1,
            issue: check.message,
            severity: check.severity,
          });
        }
      }
    }
  }

  // Check for RLS (should have it)
  if (
    content.includes("CREATE TABLE") &&
    !content.includes("ROW LEVEL SECURITY")
  ) {
    errors.push({
      file: fileName,
      issue: "Table created without enabling RLS - security risk",
      severity: "error",
    });
  }
}

try {
  if (targetFile) {
    // Validate specific file
    const filePath = targetFile.startsWith("/")
      ? targetFile
      : join(MIGRATIONS_DIR, targetFile);
    validateFile(filePath, targetFile);
  } else {
    // Validate all migrations
    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql") && f !== ".gitkeep")
      .sort();

    for (const file of files) {
      validateFile(join(MIGRATIONS_DIR, file), file);
    }
  }

  // Report results
  if (errors.length === 0) {
    console.log("✅ All migrations validated successfully!\n");
    console.log("No issues found.");
    process.exit(0);
  }

  // Group by severity
  const errorsList = errors.filter((e) => e.severity === "error");
  const warningsList = errors.filter((e) => e.severity === "warning");

  if (errorsList.length > 0) {
    console.log("❌ ERRORS FOUND:\n");
    for (const error of errorsList) {
      console.log(`  ${error.file}${error.line ? `:${error.line}` : ""}`);
      console.log(`    ${error.issue}\n`);
    }
  }

  if (warningsList.length > 0) {
    console.log("⚠️  WARNINGS:\n");
    for (const warning of warningsList) {
      console.log(`  ${warning.file}${warning.line ? `:${warning.line}` : ""}`);
      console.log(`    ${warning.issue}\n`);
    }
  }

  // Exit with error if there are errors (not warnings)
  if (errorsList.length > 0) {
    console.log("\n❌ Validation failed. Fix errors before proceeding.");
    process.exit(1);
  } else {
    console.log(
      "\n✅ No critical errors. Warnings can be reviewed but are not blocking.",
    );
    process.exit(0);
  }
} catch (error) {
  console.error("❌ Validation script error:", error);
  process.exit(1);
}
