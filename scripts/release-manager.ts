#!/usr/bin/env bun
/**
 * Release Manager - Interactive CLI for managing releases
 * Provides a guided flow for creating releases across all apps
 * Usage: bun run scripts/release-manager.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> =>
  new Promise((resolve) => rl.question(prompt, resolve));

const APPS = {
  web: {
    name: "MCP Suite Website",
    path: "apps/web",
    tagPrefix: "web-v",
  },
  precision: {
    name: "Precision",
    path: "apps/precision",
    tagPrefix: "precision-v",
  },
  momentum: {
    name: "Momentum",
    path: "apps/momentum",
    tagPrefix: "momentum-v",
  },
};

type App = keyof typeof APPS;
type VersionType = "major" | "minor" | "patch" | "prerelease";
type Channel = "stable" | "beta" | "alpha" | "nightly";

class ReleaseManager {
  async run() {
    console.log("\n🚀 MCP Suite Release Manager");
    console.log("=============================\n");

    // Check for uncommitted changes
    if (!this.checkGitStatus()) {
      console.log("❌ You have uncommitted changes. Please commit or stash them first.");
      process.exit(1);
    }

    // Select app
    const app = await this.selectApp();

    // Get current version
    const currentVersion = this.getCurrentVersion(app);
    console.log(`\n📦 Current version: ${currentVersion}`);

    // Select release type
    const releaseType = await this.selectReleaseType(currentVersion);

    // Calculate new version
    const newVersion = this.calculateNewVersion(
      currentVersion,
      releaseType.type,
      releaseType.channel,
    );
    console.log(`📦 New version: ${newVersion}`);

    // Confirm release
    const confirmed = await this.confirmRelease(
      app,
      currentVersion,
      newVersion,
      releaseType.channel,
    );
    if (!confirmed) {
      console.log("\n❌ Release cancelled");
      process.exit(0);
    }

    // Execute release
    await this.executeRelease(app, newVersion, releaseType);

    console.log("\n✅ Release process completed successfully!");
    rl.close();
  }

  checkGitStatus(): boolean {
    try {
      const status = execSync("git status --porcelain", { encoding: "utf-8" });
      return status.trim().length === 0;
    } catch {
      return false;
    }
  }

  async selectApp(): Promise<App> {
    console.log("Select application to release:");
    Object.entries(APPS).forEach(([key, app], index) => {
      console.log(`  ${index + 1}. ${app.name} (${key})`);
    });

    const answer = await question("\nEnter number (1-3): ");
    const apps = Object.keys(APPS) as App[];
    const index = parseInt(answer) - 1;

    if (index >= 0 && index < apps.length) {
      return apps[index];
    }

    console.log("❌ Invalid selection");
    return this.selectApp();
  }

  getCurrentVersion(app: App): string {
    const packagePath = join(process.cwd(), APPS[app].path, "package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
    return packageJson.version;
  }

  async selectReleaseType(
    currentVersion: string,
  ): Promise<{ type: VersionType; channel: Channel }> {
    console.log("\nSelect release type:");
    console.log("  1. Patch (bug fixes) - Stable");
    console.log("  2. Minor (new features) - Stable");
    console.log("  3. Major (breaking changes) - Stable");
    console.log("  4. Beta (preview release)");
    console.log("  5. Alpha (development release)");
    console.log("  6. Nightly (automated build)");

    const answer = await question("\nEnter number (1-6): ");

    switch (answer) {
      case "1":
        return { type: "patch", channel: "stable" };
      case "2":
        return { type: "minor", channel: "stable" };
      case "3":
        return { type: "major", channel: "stable" };
      case "4":
        return { type: "prerelease", channel: "beta" };
      case "5":
        return { type: "prerelease", channel: "alpha" };
      case "6":
        return { type: "prerelease", channel: "nightly" };
      default:
        console.log("❌ Invalid selection");
        return this.selectReleaseType(currentVersion);
    }
  }

  calculateNewVersion(current: string, type: VersionType, channel: Channel): string {
    const [major, minor, patch] = current.split(".").map((v) => parseInt(v.split("-")[0]));

    switch (type) {
      case "major":
        return `${major + 1}.0.0`;
      case "minor":
        return `${major}.${minor + 1}.0`;
      case "patch":
        return `${major}.${minor}.${patch + 1}`;
      case "prerelease":
        if (channel === "nightly") {
          const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
          return `${major}.${minor}.${patch + 1}-nightly.${date}`;
        }
        if (current.includes(`-${channel}`)) {
          const [base, pre] = current.split("-");
          const preNumber = parseInt(pre.match(/\d+/)?.[0] || "0") + 1;
          return `${base}-${channel}.${preNumber}`;
        }
        return `${major}.${minor}.${patch + 1}-${channel}.0`;
    }
  }

  async confirmRelease(
    app: App,
    current: string,
    newVersion: string,
    channel: Channel,
  ): Promise<boolean> {
    console.log("\n📋 Release Summary");
    console.log("==================");
    console.log(`App: ${APPS[app].name}`);
    console.log(`Current: ${current}`);
    console.log(`New: ${newVersion}`);
    console.log(`Channel: ${channel}`);
    console.log(`Tag: ${APPS[app].tagPrefix}${newVersion}`);

    const answer = await question("\nProceed with release? (y/N): ");
    return answer.toLowerCase() === "y";
  }

  async executeRelease(
    app: App,
    version: string,
    releaseType: { type: VersionType; channel: Channel },
  ) {
    console.log("\n🔄 Starting release process...");

    try {
      // 1. Update version in package.json
      console.log("1️⃣ Updating version...");
      const packagePath = join(process.cwd(), APPS[app].path, "package.json");
      const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
      packageJson.version = version;
      writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");

      // 2. Generate changelog
      console.log("2️⃣ Generating changelog...");
      execSync(`bun run changelog:${app}`, { stdio: "inherit" });

      // 3. Commit changes
      console.log("3️⃣ Committing changes...");
      execSync(`git add ${APPS[app].path}/package.json`, { stdio: "inherit" });
      execSync(`git add ${APPS[app].path}/CHANGELOG.md 2>/dev/null || true`, {
        stdio: "inherit",
      });
      execSync(`git commit -m "chore(${app}): release v${version}"`, {
        stdio: "inherit",
      });

      // 4. Create tag
      console.log("4️⃣ Creating tag...");
      const tag = `${APPS[app].tagPrefix}${version}`;
      execSync(`git tag -a ${tag} -m "Release ${APPS[app].name} v${version}"`, {
        stdio: "inherit",
      });

      // 5. Push changes
      const pushAnswer = await question("\nPush to GitHub and trigger release workflow? (y/N): ");
      if (pushAnswer.toLowerCase() === "y") {
        console.log("5️⃣ Pushing to GitHub...");
        execSync("git push origin main", { stdio: "inherit" });
        execSync(`git push origin ${tag}`, { stdio: "inherit" });

        console.log("\n🎉 Release triggered!");
        console.log(`\nMonitor the release workflow at:`);
        console.log(`https://github.com/forerelic/truss/actions`);

        if (releaseType.channel !== "stable") {
          console.log(`\n📢 This is a ${releaseType.channel} release`);
          console.log(`Users on the ${releaseType.channel} channel will receive this update`);
        }
      } else {
        console.log("\n📝 Changes committed locally. Push when ready:");
        console.log(`   git push origin main`);
        console.log(`   git push origin ${tag}`);
      }
    } catch (error: any) {
      console.error("\n❌ Release failed:", error.message);
      console.error("\nYou may need to manually resolve the issue");
      process.exit(1);
    }
  }
}

// Run the release manager
const manager = new ReleaseManager();
manager.run().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
