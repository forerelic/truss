<div align="center">

# Truss

**Professional monorepo for cross-platform desktop applications**

Modern TypeScript monorepo powering two professional desktop apps (Precision & Momentum) and a
marketing website. Built with Turborepo, Tauri v2, and Next.js 15.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.2.4+-000000?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![Turborepo](https://img.shields.io/badge/Turborepo-Latest-EF4444?style=flat&logo=turborepo&logoColor=white)](https://turbo.build/repo)
[![Tauri](https://img.shields.io/badge/Tauri-v2-FFC131?style=flat&logo=tauri&logoColor=white)](https://tauri.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) •
[Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Architecture](#%EF%B8%8F-architecture)
- [What's Inside](#-whats-inside)
- [Development](#%EF%B8%8F-development)
- [Tech Stack](#-tech-stack)
- [Documentation](#-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **🚀 Turborepo Monorepo** - Lightning-fast builds with remote caching and task orchestration
- **🖥️ Cross-Platform Desktop Apps** - Native apps for macOS, Windows, and Linux via Tauri v2
- **🎨 Shared Design System** - Single source of truth for UI components across web and desktop
- **⚡ Modern Stack** - Next.js 15, React 19, TypeScript 5.9, Tailwind CSS v4
- **🔐 Production-Ready Auth** - Better Auth with multi-tenant organizations, RBAC, and OAuth
- **🗄️ Type-Safe Database** - Supabase PostgreSQL with auto-generated TypeScript types
- **🛠️ Developer Experience** - One-command setup, hot-reload everywhere, VS Code debugging
- **📦 JIT Packages** - Zero build step for internal packages using modern bundler features
- **🎯 Industry Standards** - Silicon Valley best practices for code quality, comments, and
  structure

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **[Bun](https://bun.sh)** v1.2.4 or higher

  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

- **[Node.js](https://nodejs.org)** v20.11.0 (specified in `.nvmrc`)

  ```bash
  nvm install
  ```

- **[Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)** for local database

  ```bash
  brew install supabase/tap/supabase
  ```

- **[Rust](https://www.rust-lang.org/tools/install)** (for Tauri desktop apps)
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```

## 🚀 Quick Start

Get up and running in under 2 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/truss.git
cd truss

# 2. Install dependencies
bun install

# 3. Setup environment variables (creates .env.local files)
./scripts/setup-env.sh

# 4. Configure credentials (see docs/ENVIRONMENT.md for details)
# Edit the following files with your credentials:
#   - apps/web/.env.local
#   - apps/precision/.env.local
#   - apps/momentum/.env.local

# 5. Start local database
bun run db:start

# 6. Start developing!
bun run dev:precision    # Precision desktop app
# OR
bun run dev:momentum     # Momentum desktop app
```

**That's it!** One command orchestrates everything:

- ✅ Next.js backend (port 3000)
- ✅ Vite dev server (port 1420)
- ✅ Tauri app window with hot-reload

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Precision     │         │   Momentum      │
│  Desktop App    │         │  Desktop App    │
│   (Tauri v2)    │         │   (Tauri v2)    │
└─────────────────┘         └─────────────────┘
         │                           │
         └───────────┬───────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │   @truss/ui     │
            │ Shared Design   │
            │     System      │
            └─────────────────┘
                     ▲
                     │
            ┌─────────────────┐
            │    Website      │
            │  (Next.js 15)   │
            │   Port 3000     │
            └─────────────────┘
```

**Three apps, one codebase:**

- `apps/web` - Next.js 15 marketing site (deployed to Vercel)
- `apps/precision` - Project estimation desktop app (Tauri v2 + React)
- `apps/momentum` - Project tracking desktop app (Tauri v2 + React)

## 📦 What's Inside

### Applications

| App           | Description                     | Framework               | Port |
| ------------- | ------------------------------- | ----------------------- | ---- |
| **web**       | Marketing and download site     | Next.js 15              | 3000 |
| **precision** | Professional project estimation | Tauri v2 + Vite + React | 1420 |
| **momentum**  | Professional project tracking   | Tauri v2 + Vite + React | 1420 |

### Shared Packages

#### Foundation (Zero Dependencies)

- **@truss/types** - Centralized TypeScript type definitions
- **@truss/lib** - Pure utility functions (date, string, validation)
- **@truss/config** - Configuration, constants, and environment helpers

#### Infrastructure

- **@truss/database** - Supabase types and client
- **@truss/auth** - Better Auth server config and clients (web/Tauri)
- **@truss/ui** - Platform-agnostic UI components (shadcn/ui)

#### Features

- **@truss/features** - Modular business logic (organizations, projects, time-tracking)

#### Tooling

- **@truss/eslint-config** - Shared ESLint configuration
- **@truss/typescript-config** - Shared TypeScript configuration

## 🛠️ Development

### Development Commands

```bash
# Development (auto-starts backend + frontend + app)
bun run dev:precision    # Precision app: Backend (3000) + Vite (1420) + window
bun run dev:momentum     # Momentum app: Backend (3000) + Vite (1420) + window
bun run dev:web          # Backend only (API development without Tauri)

# Build
bun run build            # Build all apps
bun run build:precision  # Build Precision installer (.dmg, .exe, .deb)
bun run build:momentum   # Build Momentum installer (.dmg, .exe, .deb)
bun run build:web        # Build web app for production

# Quality Checks
bun run lint             # ESLint all packages (max 0 warnings)
bun run check-types      # TypeScript type check everything
bun run format           # Format with Prettier
bun run format:check     # Check formatting (CI)

# Database (Supabase)
bun run db:start         # Start local Supabase
bun run db:stop          # Stop local Supabase
bun run db:reset         # Reset local database
bun run db:studio        # Open Supabase Studio UI
bun run db:migration:create <name>  # Create migration + generate types
bun run db:generate      # Generate TypeScript types from schema

# Components
bun run shadcn add button    # Add shadcn component to shared UI

# Utilities
bun run cleanup-ports    # Kill processes on port 3000/1420
bun run clean            # Clean all build artifacts
```

### How Development Works

When you run `bun run dev:precision` or `dev:momentum`:

1. **Tauri starts** and executes `beforeDevCommand` from `tauri.conf.json`
2. **Concurrently launches** two processes in parallel:
   - Next.js backend (port 3000) - API endpoints, authentication
   - Vite dev server (port 1420) - UI with hot module replacement
3. **Wait-on ensures** backend is ready before Vite starts
4. **Tauri opens** app window pointing to `localhost:1420`
5. **UI renders** from Vite, API calls hit `localhost:3000`

**Result**: One command, fully coordinated startup with color-coded logs!

### Developer Experience

**Automatic Features:**

- ✅ **Browser DevTools** - Auto-open for frontend debugging
- ✅ **Tauri DevTools** - Rust backend inspection
- ✅ **Rust Backtraces** - `RUST_BACKTRACE=1` enabled
- ✅ **Color-coded Logs** - Blue (web), Green (Vite)
- ✅ **Graceful Shutdown** - All processes stop together
- ✅ **Hot Reload** - Changes reflect instantly across all apps

**VS Code Debugging:**

1. Install recommended extensions (auto-prompted)
2. Press `F5` to start debugging
3. Set breakpoints in Rust or TypeScript
4. Full variable inspection and step-through

### Adding UI Components

All UI components live in `packages/ui` and are shared across all apps:

```bash
# Add a shadcn component to the shared design system
bun run shadcn add card

# Use it in any app (web or desktop)
import { Card } from "@truss/ui/components/card"
```

### Creating API Endpoints

**1. Create endpoint** in `apps/web/app/api/[endpoint]/route.ts`:

```typescript
import { createResponse, createErrorResponse } from "@truss/ui/lib/api-server";

export async function GET(request: Request) {
  try {
    return createResponse({ message: "Hello!" });
  } catch (error) {
    return createErrorResponse(error as Error);
  }
}
```

**2. Call from any app** (web or desktop):

```typescript
import { apiClient } from "@truss/ui/lib/api-client";

const response = await apiClient.get("/api/endpoint");
```

## 🏗️ Tech Stack

### Core Technologies

- **Monorepo**: [Turborepo](https://turbo.build/repo) with [Bun](https://bun.sh)
- **Web Framework**: [Next.js 15](https://nextjs.org) with Turbopack
- **Desktop Framework**: [Tauri v2](https://tauri.app) + [Vite](https://vitejs.dev)
- **Frontend**: [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (CSS-based config)
- **Components**: [shadcn/ui](https://ui.shadcn.com)
- **Database**: [Supabase](https://supabase.com) PostgreSQL
- **Authentication**: [Better Auth](https://www.better-auth.com)

### TypeScript Versions

- Web/Packages: **TypeScript 5.9.2**
- Tauri Apps: **TypeScript 5.8.3** (Vite compatibility)

### Key Features

- **JIT Packages** - Zero build step for internal packages
- **Remote Caching** - Turborepo remote cache for faster CI/CD
- **Type Safety** - End-to-end type safety from database to UI
- **Hot Reload** - Instant updates across all apps during development

## 📚 Documentation

- **[ENVIRONMENT.md](./docs/ENVIRONMENT.md)** - Comprehensive environment variable guide
- **[CLAUDE.md](./CLAUDE.md)** - Full project documentation and architecture
- **[COMMENTING_STANDARDS.md](./COMMENTING_STANDARDS.md)** - Code commenting guidelines
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment workflows (staging, production)

**External Resources:**

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Tauri Documentation](https://tauri.app/v2/guides/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Error: EADDRINUSE: address already in use
bun run cleanup-ports    # Kills processes on ports 3000 and 1420
```

### Type Errors After Schema Changes

```bash
# Error: Type errors after database migration
bun run db:generate      # Regenerate TypeScript types from schema
```

### Environment Variable Issues

```bash
# Error: Missing environment variables
./scripts/setup-env.sh   # Recreate .env.local files

# Verify all required variables are set
# See docs/ENVIRONMENT.md for detailed setup
```

### Build Failures

```bash
# Clean all build artifacts and caches
bun run clean

# Reinstall dependencies
rm -rf node_modules
bun install

# Type check before building
bun run check-types
```

### Supabase Connection Issues

```bash
# Check if Supabase is running
bun run db:status

# Restart Supabase
bun run db:stop
bun run db:start

# Verify health
./scripts/health-check.sh
```

For more issues, see [GitHub Issues](https://github.com/your-org/truss/issues).

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Setup environment** (see [Quick Start](#-quick-start))
4. **Make your changes** (follow [COMMENTING_STANDARDS.md](./COMMENTING_STANDARDS.md))
5. **Run quality checks**:
   ```bash
   bun run lint             # Must pass with 0 warnings
   bun run check-types      # Must pass with 0 errors
   bun run format           # Auto-format code
   ```
6. **Commit your changes** (`git commit -m 'feat: add amazing feature'`)
7. **Push to branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

**Commit Convention**: We use [Conventional Commits](https://www.conventionalcommits.org/)

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks

See [CLAUDE.md](./CLAUDE.md) for comprehensive development guidelines.

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with ❤️ using Turborepo, Tauri, and Next.js**

[Report Bug](https://github.com/your-org/truss/issues) •
[Request Feature](https://github.com/your-org/truss/issues)

</div>
