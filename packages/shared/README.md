# @truss/shared

Shared business logic, utilities, and types used across all applications.

## Contents

- **Organization management** - Workspace switching, permissions, role-based access
- **Permission utilities** - Permission checking and validation
- **Shared types** - Common types used across apps

## Usage

### Organization Management

```typescript
import { WorkspaceProvider, useWorkspace, useAppAccess } from "@truss/shared/organizations";

function App() {
  return (
    <WorkspaceProvider>
      <YourApp />
    </WorkspaceProvider>
  );
}

function MyComponent() {
  const { workspace } = useWorkspace();
  const { canEdit } = useAppAccess("precision");

  return (
    <div>
      Current workspace: {workspace?.organization_name || "Personal"}
      {canEdit && <button>Edit</button>}
    </div>
  );
}
```

### Permission Utilities

```typescript
import {
  hasPermission,
  checkPermission,
  canView,
  canEdit,
  canAdmin,
  getAppAccess,
} from "@truss/shared/organizations/permissions";

// Check if a permission level meets a requirement
const allowed = hasPermission("write", "read"); // true

// Get detailed permission check
const result = checkPermission("read", "write");
// { hasAccess: false, permission: 'read', reason: '...' }

// Quick checks
const canViewData = canView("read"); // true
const canEditData = canEdit("read"); // false

// Get comprehensive access object
const access = getAppAccess("write");
// { hasAccess: true, canView: true, canEdit: true, canAdmin: false, permission: 'write' }
```

### Types

```typescript
import type {
  AppPermissionLevel,
  OrganizationRole,
  WorkspaceContext,
} from "@truss/shared/organizations/types";
import type { ApiResponse, ApiError } from "@truss/shared/types/api";
```

## Features

- ✅ Multi-workspace support (personal + organizations)
- ✅ App-specific permissions (Precision, Momentum)
- ✅ Role-based access control (owner, admin, member, guest)
- ✅ Permission hierarchy (none < read < write < admin)
- ✅ React context for workspace state
- ✅ Utility functions for permission checks

## Architecture

This package follows Cal.com's client/server separation pattern:

- Business logic separated from UI components
- Reusable across web and desktop apps
- Type-safe with full TypeScript support
- No UI components (those are in `@truss/ui`)
