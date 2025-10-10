#!/usr/bin/env bun
/**
 * GitHub Release Creation Script
 * Automates the creation of GitHub releases for each app
 * Usage: bun run scripts/create-release.ts <app> [--draft] [--prerelease]
 */

import { parseArgs } from "node:util";
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const APPS = {
  web: {
    path: "apps/web",
    name: "MCP Suite Website",
    tagPrefix: "web-v",
    changelogPath: "apps/web/CHANGELOG.md",
    assets: [], // Website has no downloadable assets
  },
  precision: {
    path: "apps/precision",
    name: "Precision",
    tagPrefix: "precision-v",
    changelogPath: "apps/precision/CHANGELOG.md",
    assets: [
      "Precision_*_aarch64.dmg",
      "Precision_*_x64.dmg",
      "Precision_*_x64-setup.exe",
      "Precision_*_x64.AppImage",
    ],
  },
  momentum: {
    path: "apps/momentum",
    name: "Momentum",
    tagPrefix: "momentum-v",
    changelogPath: "apps/momentum/CHANGELOG.md",
    assets: [
      "Momentum_*_aarch64.dmg",
      "Momentum_*_x64.dmg",
      "Momentum_*_x64-setup.exe",
      "Momentum_*_x64.AppImage",
    ],
  },
} as const;

type App = keyof typeof APPS;

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    draft: { type: "boolean", default: false },
    prerelease: { type: "boolean", default: false },
    "auto-generate-notes": { type: "boolean", default: true },
    title: { type: "string" },
    notes: { type: "string" },
    "notes-file": { type: "string" },
    discussion: { type: "string" },
    target: { type: "string", default: "main" },
  },
  allowPositionals: true,
});

const app = positionals[0] as App;

if (!app || !APPS[app]) {
  console.error("❌ Invalid app. Use one of:", Object.keys(APPS).join(", "));
  process.exit(1);
}

const appConfig = APPS[app];

async function getLatestTag(app: App): Promise<string | null> {
  try {
    const tag = execSync(
      `git describe --tags --abbrev=0 --match="${appConfig.tagPrefix}*" 2>/dev/null`,
      { encoding: "utf-8" },
    ).trim();
    return tag;
  } catch {
    return null;
  }
}

async function getVersion(app: App): Promise<string> {
  const packagePath = join(process.cwd(), appConfig.path, "package.json");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
  return packageJson.version;
}

async function getChangelogEntry(app: App, version: string): Promise<string> {
  if (!existsSync(appConfig.changelogPath)) {
    return "";
  }

  const changelog = readFileSync(appConfig.changelogPath, "utf-8");

  // Extract the entry for this version
  const versionPattern = new RegExp(
    `## \\[?${version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]?[^#]*`,
    "g",
  );
  const match = changelog.match(versionPattern);

  if (match && match[0]) {
    // Clean up the entry
    return match[0]
      .replace(/## \[?[\d.]+(-\w+\.\d+)?\]?.*\n/, "") // Remove version header
      .trim();
  }

  return "";
}

async function createRelease() {
  try {
    const version = await getVersion(app);
    const tag = `${appConfig.tagPrefix}${version}`;
    const isPrerelease = values.prerelease || version.includes("-");

    console.log(`\n🚀 Creating GitHub Release for ${appConfig.name}`);
    console.log(`Version: ${version}`);
    console.log(`Tag: ${tag}`);
    console.log(`Prerelease: ${isPrerelease}`);
    console.log(`Draft: ${values.draft}`);

    // Check if tag exists
    try {
      execSync(`git rev-parse ${tag} 2>/dev/null`, { encoding: "utf-8" });
    } catch {
      console.error(`❌ Tag ${tag} does not exist. Create it first with:`);
      console.error(`   bun run version:${app}:patch`);
      process.exit(1);
    }

    // Prepare release notes
    let releaseNotes = "";

    if (values["notes-file"]) {
      releaseNotes = readFileSync(values["notes-file"] as string, "utf-8");
    } else if (values.notes) {
      releaseNotes = values.notes as string;
    } else {
      // Get changelog entry
      const changelogEntry = await getChangelogEntry(app, version);
      if (changelogEntry) {
        releaseNotes = changelogEntry;
      }
    }

    // Build release title
    const title = values.title || `${appConfig.name} v${version}`;

    // Create the release using GitHub CLI
    const ghCommand = [
      "gh",
      "release",
      "create",
      tag,
      `--title="${title}"`,
      `--target=${values.target}`,
      isPrerelease ? "--prerelease" : "",
      values.draft ? "--draft" : "",
      values["auto-generate-notes"] ? "--generate-notes" : "",
      values.discussion ? `--discussion-category="${values.discussion}"` : "",
      releaseNotes ? `--notes="${releaseNotes}"` : "",
    ]
      .filter(Boolean)
      .join(" ");

    console.log("\n📝 Creating release with GitHub CLI...");

    try {
      const output = execSync(ghCommand, {
        encoding: "utf-8",
        stdio: ["inherit", "pipe", "pipe"],
      });

      console.log("✅ Release created successfully!");
      console.log(`🔗 ${output.trim()}`);

      // Add release channel info
      if (isPrerelease) {
        const channelMatch = version.match(/-(\w+)\.\d+/);
        if (channelMatch) {
          const channel = channelMatch[1];
          console.log(`\n📢 Release Channel: ${channel}`);

          if (channel === "beta") {
            console.log("   Users on beta channel will receive this update");
          } else if (channel === "alpha") {
            console.log("   Internal testers will receive this update");
          } else if (channel === "nightly") {
            console.log("   Development build for testing");
          }
        }
      } else {
        console.log("\n📢 Release Channel: stable");
        console.log("   All users will receive this update");
      }

      // Instructions for next steps
      console.log("\n📋 Next Steps:");
      if (appConfig.assets.length > 0) {
        console.log("1. Upload release assets (will be done by CI/CD)");
        console.log("   Assets pattern:", appConfig.assets.join(", "));
      }
      console.log("2. Announce the release");
      console.log("3. Monitor telemetry for adoption");
      console.log("4. Watch for issues/feedback");
    } catch (error: any) {
      console.error("❌ Failed to create release:", error.message);
      console.error("\nMake sure you have GitHub CLI installed and authenticated:");
      console.error("   brew install gh");
      console.error("   gh auth login");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run the script
createRelease();
