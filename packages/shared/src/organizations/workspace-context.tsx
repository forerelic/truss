"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession, useActiveOrganization, useListOrganizations } from "@truss/auth/client";
import { getMemberAppPermissions } from "./utils";
import type { WorkspaceContext, AppPermissionLevel, OrganizationRole } from "./types";

// Better Auth organization types (until proper types are exported)
interface BetterAuthMember {
  id: string;
  userId: string;
  role: string;
}

interface BetterAuthOrganization {
  id: string;
  name: string;
  slug: string;
  members?: BetterAuthMember[];
  allowedDomains?: string[] | null;
  autoJoinEnabled?: boolean;
}

interface WorkspaceContextValue {
  // Current workspace
  workspace: WorkspaceContext | null;
  isLoading: boolean;

  // Workspace switching
  switchToPersonal: () => void;
  switchToOrganization: (organizationId: string) => void;

  // Available workspaces
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;

  // Refresh workspace data
  refresh: () => Promise<void>;
}

const WorkspaceContextContext = createContext<WorkspaceContextValue | undefined>(undefined);

/**
 * Workspace Provider
 *
 * Manages the current workspace context (personal vs organization)
 * and provides workspace switching functionality.
 *
 * Usage:
 * ```tsx
 * import { WorkspaceProvider } from '@repo/ui/lib/organizations/workspace-context'
 *
 * function App() {
 *   return (
 *     <WorkspaceProvider>
 *       <YourApp />
 *     </WorkspaceProvider>
 *   )
 * }
 * ```
 */
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending: sessionLoading } = useSession();
  const { data: activeOrg } = useActiveOrganization();
  const { data: organizationsList } = useListOrganizations();

  const [workspace, setWorkspace] = useState<WorkspaceContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load workspace data
  const loadWorkspace = useCallback(async () => {
    if (!session?.user) {
      setWorkspace(null);
      setIsLoading(false);
      return;
    }

    try {
      // Personal workspace (no organization)
      if (!activeOrg) {
        setWorkspace({
          organization_id: null,
          organization_name: null,
          organization_slug: null,
          role: null,
          precision_permission: "admin", // Full access in personal workspace
          momentum_permission: "admin",
          allowed_domains: null,
          auto_join_enabled: false,
        });
        return;
      }

      // Organization workspace
      // Get member info to retrieve permissions
      const betterAuthOrg = activeOrg as unknown as BetterAuthOrganization;
      const member = betterAuthOrg.members?.find((m) => m.userId === session.user.id);

      if (!member) {
        throw new Error("User is not a member of the active organization");
      }

      // Owners get full access automatically
      if (member.role === "owner") {
        setWorkspace({
          organization_id: activeOrg.id,
          organization_name: activeOrg.name,
          organization_slug: activeOrg.slug,
          role: "owner",
          precision_permission: "admin",
          momentum_permission: "admin",
          // Custom fields from Better Auth organization schema
          allowed_domains: betterAuthOrg.allowedDomains ?? null,
          auto_join_enabled: betterAuthOrg.autoJoinEnabled ?? false,
        });
        return;
      }

      // Get app-specific permissions for non-owners
      const permissions = await getMemberAppPermissions(member.id);

      setWorkspace({
        organization_id: activeOrg.id,
        organization_name: activeOrg.name,
        organization_slug: activeOrg.slug,
        role: member.role as OrganizationRole,
        precision_permission: permissions.precision,
        momentum_permission: permissions.momentum,
        // Custom fields from Better Auth organization schema
        allowed_domains: betterAuthOrg.allowedDomains ?? null,
        auto_join_enabled: betterAuthOrg.autoJoinEnabled ?? false,
      });
    } catch (error) {
      console.error("Error loading workspace:", error);
      // Fallback to personal workspace on error
      setWorkspace({
        organization_id: null,
        organization_name: null,
        organization_slug: null,
        role: null,
        precision_permission: "admin",
        momentum_permission: "admin",
        allowed_domains: null,
        auto_join_enabled: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [session, activeOrg]);

  // Reload workspace when session or active org changes
  useEffect(() => {
    if (!sessionLoading) {
      loadWorkspace();
    }
  }, [sessionLoading, loadWorkspace]);

  // Switch to personal workspace
  const switchToPersonal = useCallback(() => {
    // Set active organization to null
    // This should trigger a re-load of workspace context
    window.location.href = "/workspace/personal"; // Or use your router
  }, []);

  // Switch to organization workspace
  const switchToOrganization = useCallback((organizationId: string) => {
    window.location.href = `/workspace/${organizationId}`; // Or use your router
  }, []);

  const value: WorkspaceContextValue = {
    workspace,
    isLoading: isLoading || sessionLoading,
    switchToPersonal,
    switchToOrganization,
    organizations: (organizationsList || []).map((org: BetterAuthOrganization) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      role: "member", // This would come from the members join - for now default to member
    })),
    refresh: loadWorkspace,
  };

  return (
    <WorkspaceContextContext.Provider value={value}>{children}</WorkspaceContextContext.Provider>
  );
}

/**
 * Hook to access workspace context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { workspace, switchToOrganization } = useWorkspace()
 *
 *   if (!workspace) return <div>Loading...</div>
 *
 *   return (
 *     <div>
 *       Current workspace: {workspace.organization_name || 'Personal'}
 *       Precision access: {workspace.precision_permission}
 *     </div>
 *   )
 * }
 * ```
 */
export function useWorkspace() {
  const context = useContext(WorkspaceContextContext);

  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }

  return context;
}

/**
 * Hook to check app access in current workspace
 *
 * @example
 * ```tsx
 * function PrecisionFeature() {
 *   const { hasAccess, permission } = useAppAccess('precision')
 *
 *   if (!hasAccess) {
 *     return <div>You don't have access to Precision in this workspace</div>
 *   }
 *
 *   return <div>You have {permission} access to Precision</div>
 * }
 * ```
 */
export function useAppAccess(app: "precision" | "momentum") {
  const { workspace } = useWorkspace();

  if (!workspace) {
    return {
      hasAccess: false,
      permission: "none" as AppPermissionLevel,
      canView: false,
      canEdit: false,
      canAdmin: false,
    };
  }

  const permission =
    app === "precision" ? workspace.precision_permission : workspace.momentum_permission;

  const hierarchy: AppPermissionLevel[] = ["none", "read", "write", "admin"];
  const permissionLevel = hierarchy.indexOf(permission);

  return {
    hasAccess: permission !== "none",
    permission,
    canView: permissionLevel >= hierarchy.indexOf("read"),
    canEdit: permissionLevel >= hierarchy.indexOf("write"),
    canAdmin: permissionLevel >= hierarchy.indexOf("admin"),
  };
}
