#!/usr/bin/env bun
/**
 * Changelog Generation Script
 * Generates changelogs for individual apps based on conventional commits
 * Usage: bun run changelog <app> [--from=tag] [--to=tag]
 */

import { parseArgs } from "node:util";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const APPS = {
  web: {
    path: "apps/web",
    name: "MCP Suite Website",
    tagPrefix: "web-v",
    changelogPath: "apps/web/CHANGELOG.md",
  },
  precision: {
    path: "apps/precision",
    name: "Precision",
    tagPrefix: "precision-v",
    changelogPath: "apps/precision/CHANGELOG.md",
  },
  momentum: {
    path: "apps/momentum",
    name: "Momentum",
    tagPrefix: "momentum-v",
    changelogPath: "apps/momentum/CHANGELOG.md",
  },
} as const;

type App = keyof typeof APPS;
type CommitType = {
  type: string;
  scope?: string;
  subject: string;
  breaking?: boolean;
  hash: string;
  date: string;
};

const COMMIT_TYPES = {
  feat: "✨ Features",
  fix: "🐛 Bug Fixes",
  perf: "⚡ Performance",
  docs: "📚 Documentation",
  style: "💅 Styling",
  refactor: "♻️ Code Refactoring",
  test: "✅ Tests",
  build: "📦 Build System",
  ci: "🔧 CI/CD",
  chore: "🔨 Maintenance",
  revert: "⏪ Reverts",
};

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    from: { type: "string" },
    to: { type: "string", default: "HEAD" },
    output: { type: "string" },
    "dry-run": { type: "boolean", default: false },
  },
  allowPositionals: true,
});

const app = positionals[0] as App;

if (!app || !APPS[app]) {
  console.error("❌ Invalid app. Use one of:", Object.keys(APPS).join(", "));
  process.exit(1);
}

const appConfig = APPS[app];

// Get the last tag for this app if not specified
const fromTag =
  values.from ||
  (() => {
    try {
      const lastTag = execSync(
        `git describe --tags --abbrev=0 --match="${appConfig.tagPrefix}*" 2>/dev/null`,
        { encoding: "utf-8" },
      ).trim();
      return lastTag;
    } catch {
      // No previous tag, use first commit
      return execSync("git rev-list --max-parents=0 HEAD", {
        encoding: "utf-8",
      }).trim();
    }
  })();

const toRef = values.to as string;

console.log(`\n📝 Generating Changelog for ${appConfig.name}`);
console.log(`From: ${fromTag}`);
console.log(`To: ${toRef}`);

try {
  // Get commits for this app's path
  const gitLog = execSync(
    `git log ${fromTag}..${toRef} --pretty=format:"%H|%s|%ad" --date=short -- ${appConfig.path}`,
    { encoding: "utf-8" },
  ).trim();

  if (!gitLog) {
    console.log("ℹ️  No commits found in this range");
    process.exit(0);
  }

  const commits: CommitType[] = gitLog.split("\n").map((line) => {
    const [hash, message, date] = line.split("|");

    // Parse conventional commit format
    const match = message.match(/^(\w+)(?:\(([^)]+)\))?: (.+)$/);
    if (match) {
      const [_, type, scope, subject] = match;
      return {
        type,
        scope,
        subject,
        breaking: message.includes("!") || message.includes("BREAKING CHANGE"),
        hash: hash.substring(0, 7),
        date,
      };
    }

    return {
      type: "other",
      subject: message,
      hash: hash.substring(0, 7),
      date,
    };
  });

  // Group commits by type
  const grouped: Record<string, CommitType[]> = {};
  const breaking: CommitType[] = [];

  commits.forEach((commit) => {
    if (commit.breaking) {
      breaking.push(commit);
    }

    const category = COMMIT_TYPES[commit.type as keyof typeof COMMIT_TYPES] || "Other Changes";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(commit);
  });

  // Get version from package.json
  const packagePath = join(process.cwd(), appConfig.path, "package.json");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
  const version = packageJson.version;

  // Generate changelog entry
  const date = new Date().toISOString().split("T")[0];
  let changelog = `## [${version}](https://github.com/forerelic/truss/releases/tag/${appConfig.tagPrefix}${version}) (${date})\n\n`;

  // Add breaking changes first
  if (breaking.length > 0) {
    changelog += "### 💥 BREAKING CHANGES\n\n";
    breaking.forEach((commit) => {
      const scope = commit.scope ? `**${commit.scope}:** ` : "";
      changelog += `* ${scope}${commit.subject} ([${commit.hash}](https://github.com/forerelic/truss/commit/${commit.hash}))\n`;
    });
    changelog += "\n";
  }

  // Add grouped commits
  const typeOrder = [
    "✨ Features",
    "🐛 Bug Fixes",
    "⚡ Performance",
    "📚 Documentation",
    "Other Changes",
  ];
  typeOrder.forEach((type) => {
    if (grouped[type] && grouped[type].length > 0) {
      changelog += `### ${type}\n\n`;
      grouped[type].forEach((commit) => {
        const scope = commit.scope ? `**${commit.scope}:** ` : "";
        changelog += `* ${scope}${commit.subject} ([${commit.hash}](https://github.com/forerelic/truss/commit/${commit.hash}))\n`;
      });
      changelog += "\n";
    }
  });

  // Handle remaining categories
  Object.keys(grouped).forEach((type) => {
    if (!typeOrder.includes(type) && grouped[type].length > 0) {
      changelog += `### ${type}\n\n`;
      grouped[type].forEach((commit) => {
        const scope = commit.scope ? `**${commit.scope}:** ` : "";
        changelog += `* ${scope}${commit.subject} ([${commit.hash}](https://github.com/forerelic/truss/commit/${commit.hash}))\n`;
      });
      changelog += "\n";
    }
  });

  console.log("\n📋 Generated Changelog:");
  console.log("=".repeat(60));
  console.log(changelog);

  if (!values["dry-run"]) {
    // Update or create CHANGELOG.md
    const changelogPath = values.output || appConfig.changelogPath;
    let existingChangelog = "";

    if (existsSync(changelogPath)) {
      existingChangelog = readFileSync(changelogPath, "utf-8");
      // Remove the header if it exists
      const headerEnd = existingChangelog.indexOf("## ");
      if (headerEnd > 0) {
        existingChangelog = existingChangelog.substring(headerEnd);
      }
    }

    const header = `# ${appConfig.name} Changelog\n\nAll notable changes to ${appConfig.name} will be documented in this file.\n\n`;
    const fullChangelog = header + changelog + existingChangelog;

    writeFileSync(changelogPath, fullChangelog);
    console.log(`\n✅ Updated ${changelogPath}`);
  } else {
    console.log("\n🏃 Dry run mode - no files written");
  }
} catch (error) {
  console.error("❌ Error:", error);
  process.exit(1);
}
