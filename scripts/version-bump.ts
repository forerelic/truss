#!/usr/bin/env bun
/**
 * Version Bump Script
 * Handles version bumping for individual apps with semantic versioning
 * Usage: bun run version:bump <app> <version-type>
 * Example: bun run version:bump web patch
 */

import { parseArgs } from "node:util";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const APPS = {
  web: {
    path: "apps/web",
    name: "MCP Suite Website",
    tagPrefix: "web-v",
  },
  precision: {
    path: "apps/precision",
    name: "Precision",
    tagPrefix: "precision-v",
  },
  momentum: {
    path: "apps/momentum",
    name: "Momentum",
    tagPrefix: "momentum-v",
  },
} as const;

type App = keyof typeof APPS;
type VersionType = "major" | "minor" | "patch" | "prerelease";

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    preid: { type: "string", default: "beta" },
    "dry-run": { type: "boolean", default: false },
    message: { type: "string" },
  },
  allowPositionals: true,
});

const app = positionals[0] as App;
const versionType = positionals[1] as VersionType;

if (!app || !APPS[app]) {
  console.error("❌ Invalid app. Use one of:", Object.keys(APPS).join(", "));
  process.exit(1);
}

if (!versionType || !["major", "minor", "patch", "prerelease"].includes(versionType)) {
  console.error("❌ Invalid version type. Use: major, minor, patch, or prerelease");
  process.exit(1);
}

const appConfig = APPS[app];
const packagePath = join(process.cwd(), appConfig.path, "package.json");

try {
  // Read current package.json
  const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
  const currentVersion = packageJson.version;

  // Calculate new version
  const [major, minor, patch] = currentVersion.split(".").map((v: string) => {
    const num = parseInt(v.split("-")[0]);
    return isNaN(num) ? 0 : num;
  });

  let newVersion: string;
  const preid = values.preid as string;

  switch (versionType) {
    case "major":
      newVersion = `${major + 1}.0.0`;
      break;
    case "minor":
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case "patch":
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
    case "prerelease":
      if (currentVersion.includes("-")) {
        // Increment prerelease version
        const [base, pre] = currentVersion.split("-");
        const preNumber = parseInt(pre.match(/\d+/)?.[0] || "0") + 1;
        newVersion = `${base}-${preid}.${preNumber}`;
      } else {
        // Start new prerelease
        newVersion = `${major}.${minor}.${patch + 1}-${preid}.0`;
      }
      break;
  }

  console.log(`\n📦 ${appConfig.name} Version Bump`);
  console.log(`Current: ${currentVersion}`);
  console.log(`New: ${newVersion}`);

  if (values["dry-run"]) {
    console.log("\n🏃 Dry run mode - no changes made");
    process.exit(0);
  }

  // Update package.json
  packageJson.version = newVersion;
  writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");
  console.log(`✅ Updated ${appConfig.path}/package.json`);

  // Create git commit and tag
  const commitMessage = values.message || `chore(${app}): bump version to ${newVersion}`;

  try {
    execSync(`git add ${appConfig.path}/package.json`, { stdio: "inherit" });
    execSync(`git commit -m "${commitMessage}"`, { stdio: "inherit" });

    const tag = `${appConfig.tagPrefix}${newVersion}`;
    execSync(`git tag -a ${tag} -m "Release ${appConfig.name} v${newVersion}"`, {
      stdio: "inherit",
    });

    console.log(`✅ Created commit and tag: ${tag}`);
    console.log("\n🚀 To trigger release workflow:");
    console.log(`   git push origin main --tags`);
  } catch (gitError) {
    console.error("⚠️  Git operations failed. You may need to commit manually.");
  }
} catch (error) {
  console.error("❌ Error:", error);
  process.exit(1);
}
