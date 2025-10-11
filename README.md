# MCP Suite

A Turborepo monorepo containing **two professional desktop apps** (Precision & Momentum) and a
**marketing website**. All apps share a single design system for maximum code reuse.

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐
│    Precision    │         │    Momentum     │
│  Desktop App    │         │   Desktop App   │
│   (Tauri v2)    │         │   (Tauri v2)    │
└─────────────────┘         └─────────────────┘
         │                           │
         └───────────┬───────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │   @repo/ui      │
            │ Shared Design   │
            │     System      │
            └─────────────────┘
                     ▲
                     │
            ┌─────────────────┐
            │   Website       │
            │  (Next.js 15)   │
            │   Port 3000     │
            └─────────────────┘
```

**Three apps, one codebase:**

- `apps/web` - Marketing and download site for desktop apps (port 3000)
- `apps/precision` - Professional project estimation desktop app (port 1420)
- `apps/momentum` - Professional project tracking desktop app (port 1420)
- `packages/ui` - Shared React components, views, hooks, and Tailwind theme

## 🚀 Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Start developing (ONE command does it all!)
bun run dev:precision    # Starts backend + Vite + Precision app
# OR
bun run dev:momentum     # Starts backend + Vite + Momentum app
```

**That's it!** One command orchestrates everything via Tauri's `beforeDevCommand` + `concurrently`:

- ✅ Next.js backend (port 3000)
- ✅ Vite dev server (port 1420)
- ✅ Tauri app window

No terminal juggling. Color-coded output (blue=web, green=vite).

## 📦 What's Inside

### Apps

- **web** - Next.js 15 marketing site with download links
- **precision** - Tauri v2 + Vite + React estimation desktop app
- **momentum** - Tauri v2 + Vite + React project tracking desktop app

### Packages

- **@truss/ui** - Shared React components, views, hooks, and design system
- **@truss/eslint-config** - Shared ESLint configuration
- **@truss/typescript-config** - Shared TypeScript configuration

## 🛠️ Development Commands

```bash
# Development (auto-starts backend + frontend + app)
bun run dev:precision    # Backend (3000) + Vite (1420) + Precision app window
bun run dev:momentum     # Backend (3000) + Vite (1420) + Momentum app window
bun run dev:web          # Backend only (API development without Tauri)

# Build
bun run build            # Build all apps
bun run build:precision  # Build Precision installer
bun run build:momentum   # Build Momentum installer

# Quality
bun run lint             # Lint all packages
bun run check-types      # Type check everything
bun run format           # Format with Prettier

# Components
bun run shadcn add button    # Add shadcn component to shared UI
```

### How Development Works

When you run `dev:precision` or `dev:momentum`:

1. Tauri executes `beforeDevCommand` from `tauri.conf.json`
2. `concurrently` starts both processes in parallel:
   - **Web backend** (Next.js, port 3000) - API endpoints
   - **Vite dev server** (React, port 1420) - UI with hot-reload
3. `wait-on` ensures backend is ready before starting Vite
4. Tauri opens app window pointing to `localhost:1420`
5. UI renders from Vite, API calls hit `localhost:3000`

**Result**: One command, fully coordinated startup, color-coded logs!

## ✨ Enhanced Developer Experience

### Automatic Features

When you run `bun run dev:precision` or `dev:momentum`, you get:

- ✅ **Auto-opening Browser DevTools** - Instantly debug frontend
- ✅ **Tauri DevTools Plugin** - Debug Rust backend
- ✅ **Rust Backtraces** (`RUST_BACKTRACE=1`) - Detailed error messages
- ✅ **Color-coded Logs** - Blue (web API), Green (vite UI)
- ✅ **Graceful Shutdown** - All processes stop together on error
- ✅ **Wait-on Coordination** - Backend ready before frontend starts

### VS Code Debugging

1. Install recommended extensions (auto-prompted)
2. Press `F5` to start debugging
3. Set breakpoints in Rust or TypeScript
4. Full variable inspection and step-through debugging

### Health Check

```bash
./scripts/health-check.sh
```

Verifies all services are running correctly.

## 🎨 Adding UI Components

All UI components live in `packages/ui` and are shared across all apps:

```bash
# Add a shadcn component
bun run shadcn add card

# Use it in any app
import { Card } from "@repo/ui/components/card"
```

## 🔌 Creating API Endpoints

1. Create `apps/web/app/api/[endpoint]/route.ts`:

```typescript
import { createResponse, createErrorResponse } from "@repo/ui/lib/api-server";

export async function GET(request: Request) {
  try {
    return createResponse({ message: "Hello!" });
  } catch (error) {
    return createErrorResponse(error as Error);
  }
}
```

2. Call from any app (native or web):

```typescript
import { apiClient } from "@repo/ui/lib/api-client";

const response = await apiClient.get("/api/endpoint");
```

## 🏗️ Tech Stack

- **Monorepo**: Turborepo with Bun
- **Web**: Next.js 15, Turbopack, Tailwind v4
- **Native**: Tauri v2, Vite, React 19
- **Styling**: Tailwind v4 (CSS-based config, no tailwind.config.js)
- **Components**: shadcn/ui
- **TypeScript**: 5.9.2 (web/packages), 5.8.3 (Tauri apps)

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - Comprehensive project documentation
- [Turborepo Docs](https://turborepo.com)
- [Tauri Docs](https://tauri.app)
- [Next.js Docs](https://nextjs.org)

## 🤝 Contributing

1. Clone the repo
2. Run `bun install`
3. Start with `bun run dev:precision` or `bun run dev:momentum`
4. Make changes (they hot-reload across all apps!)
5. Run `bun run check-types` before committing

## 📝 License

[Your License Here]

<!-- Test comment: Claude Code verified working at 2025-10-09 -->
