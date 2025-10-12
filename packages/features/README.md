# @truss/features

**Purpose**: Modular business logic features for all applications

## Usage

```typescript
// Organizations
import { hasPermission, getAppAccess } from "@truss/features/organizations/permissions";
import {
  useWorkspace,
  WorkspaceProvider,
  useAppAccess,
} from "@truss/features/organizations/workspace-context";
import type {
  WorkspaceContext,
  AppPermissionLevel,
  OrganizationRole,
} from "@truss/features/organizations/types";

// Example: Permission checking
const access = getAppAccess("write");
if (access.canEdit) {
  // Show edit UI
}

// Example: Workspace context
function MyComponent() {
  const { workspace } = useWorkspace();
  const { hasAccess } = useAppAccess("precision");

  if (!hasAccess) return <div>No access</div>;
  return <div>Workspace: {workspace?.organization_name || "Personal"}</div>;
}
```

## What Goes Here

✅ **DO** add:

- Feature-specific business logic
- Multi-step operations
- React context providers and hooks
- Domain-specific utilities
- Feature modules (organizations, projects, time-tracking, etc.)

❌ **DON'T** add:

- UI components (use `@truss/ui`)
- Generic utilities (use `@truss/lib`)
- Type definitions only (use `@truss/types`)
- Configuration (use `@truss/config`)

## Rules

1. **Feature isolation** - Each feature is self-contained in its own directory
2. **Single Responsibility** - One feature = one business domain
3. **Composable** - Features can depend on each other but avoid circular deps
4. **Platform-agnostic** - Must work in both Next.js and Tauri (use "use client" when needed)

## File Structure

```
src/
├── organizations/           - Organization & workspace management
│   ├── types.ts            - TypeScript types
│   ├── permissions.ts      - Permission checking logic
│   ├── utils.ts            - Database operations
│   ├── workspace-context.tsx - React context provider
│   └── index.ts            - Barrel export
│
├── projects/               - Future: Project management (Precision)
│   └── ...
│
├── time-tracking/          - Future: Time tracking (Momentum)
│   └── ...
│
└── index.ts                - Top-level barrel export
```

## Current Features

### Organizations

Multi-tenant workspace management with app-specific permissions.

**Key concepts:**

- Users can belong to multiple organizations
- Each organization has members with roles (owner, admin, member, guest)
- Members have app-specific permissions (none, read, write, admin) for Precision and Momentum
- Personal workspace (no organization) = full access to all apps

**Components:**

- `WorkspaceProvider` - React context for current workspace
- `useWorkspace()` - Access workspace data and switching
- `useAppAccess()` - Check app permissions in current workspace
- `hasPermission()` - Compare permission levels
- `getAppAccess()` - Get full access object for UI

## Dependencies

- `@truss/auth` (peer) - Authentication and user sessions
- `@truss/database` (peer) - Database operations
- `@truss/config` (peer) - Configuration and constants
- `@truss/lib` (peer) - Utility functions
- `@truss/types` (peer) - Type definitions
- `react` (peer) - For context providers and hooks
