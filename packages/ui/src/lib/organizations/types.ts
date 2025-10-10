/**
 * Organization and permission types for MCP Suite
 *
 * These types support the multi-app organization model where:
 * - Users can belong to multiple organizations (workspaces)
 * - Each organization can have different app permissions per member
 * - Example: User A has "read" on Precision, "write" on Momentum
 */

export type AppName = "precision" | "momentum";

export type AppPermissionLevel = "none" | "read" | "write" | "admin";

export type OrganizationRole = "owner" | "admin" | "member" | "guest";

/**
 * App permission for a member in an organization
 */
export interface AppPermission {
  id: string;
  member_id: string;
  app: AppName;
  permission: AppPermissionLevel;
  created_at: string;
  updated_at: string;
}

/**
 * Full member info with app permissions
 */
export interface MemberWithPermissions {
  id: string;
  user_id: string;
  organization_id: string;
  role: OrganizationRole;
  created_at: string;

  // User details
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };

  // App-specific permissions
  app_permissions: AppPermission[];
}

/**
 * Workspace context for the current user
 */
export interface WorkspaceContext {
  // null = personal workspace (no organization)
  organization_id: string | null;
  organization_name: string | null;
  organization_slug: string | null;
  role: OrganizationRole | null;

  // App permissions in current workspace
  precision_permission: AppPermissionLevel;
  momentum_permission: AppPermissionLevel;

  // Email domain auto-join settings (organization-level)
  allowed_domains: string[] | null;
  auto_join_enabled: boolean;
}

/**
 * Permission check result
 */
export interface PermissionCheck {
  hasAccess: boolean;
  permission: AppPermissionLevel;
  reason?: string;
}

/**
 * App access helpers for UI components
 */
export interface AppAccess {
  hasAccess: boolean;
  canView: boolean;
  canEdit: boolean;
  canAdmin: boolean;
  permission: AppPermissionLevel;
}

/**
 * Organization with enhanced settings
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  metadata?: Record<string, any>;
  created_at: string;

  // Email domain auto-join (like Notion, Slack)
  allowed_domains?: string[];
  auto_join_enabled?: boolean;
}

/**
 * Organization member with full app permissions
 */
export interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: OrganizationRole;
  created_at: string;

  // User info
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };

  // Flattened app permissions for easy UI access
  app_permissions: {
    precision: AppPermissionLevel;
    momentum: AppPermissionLevel;
  };
}

/**
 * Invitation with app permissions
 */
export interface InvitationWithPermissions {
  id: string;
  organization_id: string;
  email: string;
  role: OrganizationRole;
  status: "pending" | "accepted" | "rejected" | "expired";
  expires_at: string;
  invited_by: string;
  created_at: string;

  // App permissions to grant on acceptance
  app_permissions: {
    precision: AppPermissionLevel;
    momentum: AppPermissionLevel;
  };
}
