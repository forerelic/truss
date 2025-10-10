# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Architecture Overview

Turborepo monorepo with **3 independent applications**:

- **Website** (Next.js 15): Marketing and download site at `apps/web` (port 3000)
- **Precision** (Tauri v2): Professional project estimation desktop app at `apps/precision` (port 1420)
- **Momentum** (Tauri v2): Professional project tracking desktop app at `apps/momentum` (port 1420)
- **Shared UI** (`@repo/ui`): Common components and design tokens

**Tech Stack**:

- **Website**: Next.js 15, Tailwind CSS v4, Vercel deployment
- **Desktop Apps**: Tauri v2, React 19, Vite, Rust backend
- **Build System**: Turborepo with remote caching
- **Package Manager**: Bun (fast, modern alternative to npm)
- **Styling**: Tailwind CSS v4 (design tokens approach)
- **Type Safety**: End-to-end TypeScript

**Application Structure**:

```
truss/
├── apps/
│   ├── web/              # Marketing website (Next.js)
│   ├── precision/         # Desktop estimating app (Tauri)
│   └── momentum/          # Desktop tracking app (Tauri)
├── packages/
│   ├── ui/               # Shared components & design system
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
└── scripts/              # Build and release automation
```

## Application Descriptions

### Website (`apps/web`)

- **Purpose**: Marketing site to showcase and distribute the desktop applications
- **Features**: Product information, download links, documentation
- **Deployment**: Vercel (automatic on push to main)
- **No Backend**: Static site, no database or authentication needed

### Precision (`apps/precision`)

- **Purpose**: Professional project estimation tool
- **Features**: Cost estimation, resource planning, quote generation
- **Platform**: Desktop application (macOS, Windows, Linux)
- **Data**: Local SQLite or user's own database

### Momentum (`apps/momentum`)

- **Purpose**: Project tracking and management
- **Features**: Task tracking, time management, progress monitoring
- **Platform**: Desktop application (macOS, Windows, Linux)
- **Data**: Local SQLite or user's own database

## CRITICAL RULES

**IMPORTANT: Package manager:**

- ✅ ALWAYS use `bun` commands (this project uses Bun, not npm/yarn)
- ❌ NEVER use `npm install` or `yarn` commands

**IMPORTANT: Shared UI package (`@repo/ui`):**

- ✅ Keep components platform-agnostic (work in both Vite and Next.js)
- ✅ Use design tokens from Tailwind CSS v4
- ❌ NEVER import Next.js-specific features (next/link, next/image, etc.)
- ❌ NEVER use Node.js-only libraries in shared components

**IMPORTANT: Application independence:**

- ✅ Each app has its own version and release cycle
- ✅ Apps can be released independently
- ✅ Use semantic versioning for each app
- ❌ NEVER couple release cycles between apps

## Common Commands

```bash
# Development
bun run dev:web              # Start website dev server
bun run dev:precision        # Start Precision desktop app
bun run dev:momentum         # Start Momentum desktop app

# Building
bun run build                # Build all apps
bun run build:web            # Build website only
bun run build:precision      # Build Precision installer
bun run build:momentum       # Build Momentum installer

# Quality Checks
bun run lint                 # Lint all packages
bun run check-types          # Type check all packages
bun run format               # Format code with Prettier

# Releases (Independent versioning)
bun run release:manager      # Interactive release CLI
bun run release:precision    # Quick Precision release
bun run release:momentum     # Quick Momentum release

# Version Management (Desktop Apps)
bun run version:precision:minor  # Bump Precision minor version
bun run version:momentum:major   # Bump Momentum major version

# Changelog Generation (Desktop Apps)
bun run changelog:precision  # Generate Precision changelog
bun run changelog:momentum   # Generate Momentum changelog

# Troubleshooting
bun run cleanup-ports        # Fix "EADDRINUSE" errors
```

## Release Strategy

### Independent Releases

Each application is versioned and released independently:

- **Website**: Deployed to Vercel on every push to main
- **Precision**: Released via GitHub Releases with installers
- **Momentum**: Released via GitHub Releases with installers

### Version Patterns

- **Stable**: `1.0.0` - Production releases
- **Beta**: `1.0.0-beta.1` - Preview releases
- **Alpha**: `1.0.0-alpha.1` - Development releases
- **Nightly**: `1.0.0-nightly.20250108` - Automated builds

### Release Workflows

Desktop apps use GitHub Actions workflows for building and releasing:

- `.github/workflows/release-desktop.yml` - Desktop app builds (Precision & Momentum)

Website deployment is handled automatically by Vercel's Git integration (no GitHub Actions needed).

### Creating Releases

```bash
# Interactive release manager (recommended)
bun run release:manager

# Manual release
bun run version:precision:patch    # Bump version
bun run changelog:precision        # Generate changelog
git push origin main --tags        # Trigger workflow
```

## Getting Started

```bash
# 1. Clone repository
git clone <repo-url>
cd truss

# 2. Install dependencies
bun install

# 3. Start developing
bun run dev:web        # For website
bun run dev:precision  # For Precision app
bun run dev:momentum   # For Momentum app
```

## Package Structure

### `@repo/ui` - Shared Design System

```typescript
// Components
import { Button, Card, Dialog } from "@repo/ui/components";

// Utilities
import { cn } from "@repo/ui/lib/utils";

// Types
import type { AppConfig } from "@repo/ui/types";
```

### Application Imports

```typescript
// In apps/precision or apps/momentum
import { Button } from "@repo/ui/components/button";
import { useTheme } from "@repo/ui/hooks/use-theme";

// In apps/web (Next.js specific features)
import Link from "next/link";
import Image from "next/image";
```

## Environment Variables

### Website (`apps/web`)

```bash
# Build environment
NODE_ENV=production           # Build environment

# Public variables
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_PRECISION_DOWNLOAD_URL=https://github.com/...
NEXT_PUBLIC_MOMENTUM_DOWNLOAD_URL=https://github.com/...

# Note: Vercel environment variables are configured in the Vercel dashboard
```

### Desktop Apps (`apps/precision`, `apps/momentum`)

```bash
# Build configuration
TAURI_SIGNING_PRIVATE_KEY=xxx  # Code signing
TAURI_SIGNING_PUBLIC_KEY=xxx   # Code verification

# App configuration
VITE_APP_VERSION=1.0.0
VITE_AUTO_UPDATE_URL=https://...
```

## CI/CD Configuration

### Website Deployment

The website uses **Vercel's automatic Git integration**:
- Automatically deploys on every push to `main`
- Preview deployments for all PRs
- No GitHub Actions needed - configure in Vercel dashboard

### GitHub Secrets Required (Desktop Apps)

```bash
# Code Signing (Optional)
APPLE_SIGNING_CERTIFICATE   # macOS signing
APPLE_SIGNING_PASSWORD      # Certificate password
WINDOWS_SIGNING_CERTIFICATE # Windows signing
WINDOWS_SIGNING_PASSWORD    # Certificate password

# Turbo Cache
TURBO_TOKEN                 # Remote caching
TURBO_TEAM                  # Team identifier
```

### Workflow Triggers

- **Push to main**: Website auto-deploys via Vercel (no workflow)
- **Tag push `precision-v*`**: Precision release build
- **Tag push `momentum-v*`**: Momentum release build

## Development Guidelines

### Component Development

1. Create components in `@repo/ui` for sharing
2. Keep components pure and platform-agnostic
3. Use Tailwind CSS v4 design tokens
4. Document with TypeScript and JSDoc

### Desktop App Development

1. Use Tauri commands for native functionality
2. Keep UI in React/TypeScript
3. Business logic in Rust when needed
4. Test on all target platforms

### Website Development

1. Keep it simple and static
2. Optimize for SEO and performance
3. Clear download CTAs for desktop apps
4. Responsive design for all devices

## Troubleshooting

**Port already in use:**

```bash
bun run cleanup-ports
```

**Type errors after changes:**

```bash
bun run check-types
```

**Build failures:**

```bash
# Clean and rebuild
bun run clean
bun install
bun run build
```

**Release workflow not triggering:**

```bash
# Ensure tag format is correct
git tag -a precision-v1.0.0 -m "Release Precision v1.0.0"
git push origin precision-v1.0.0
```

## Key Directories

- `apps/web/` - Marketing website source
- `apps/precision/` - Precision desktop app source
- `apps/momentum/` - Momentum desktop app source
- `packages/ui/` - Shared component library
- `.github/workflows/` - CI/CD pipelines
- `scripts/` - Build and release automation
- `docs/` - Additional documentation

## Not Yet Implemented

- Auto-updater for desktop apps
- Telemetry and analytics
- Crash reporting
- Localization/i18n
- Desktop app tests
- Offline mode for desktop apps
- Cloud sync (optional feature)

---

**Remember**: This is a monorepo with independent applications. The website showcases and distributes the desktop apps. Precision and Momentum are standalone desktop applications that don't require backend services.
