"use client";

import { getSupabaseClient } from "../supabase/client";
import type {
  AppName,
  AppPermissionLevel,
  MemberWithPermissions,
} from "./types";

// Database row types (until Better Auth migrations are run)
interface AppPermissionRow {
  memberId: string;
  app: string;
  permission: string;
}

interface MemberRow {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

/**
 * Get app permissions for a member in an organization
 */
export async function getMemberAppPermissions(
  memberId: string,
): Promise<{ precision: AppPermissionLevel; momentum: AppPermissionLevel }> {
  const supabase = getSupabaseClient();

  // Note: app_permissions table will exist after running migrations
  const { data, error } = await supabase
    .from("app_permissions")
    .select("app, permission")
    .eq("memberId", memberId)
    .returns<AppPermissionRow[]>();

  if (error) {
    console.error("Error fetching app permissions:", error);
    // Return default permissions on error
    return { precision: "none", momentum: "none" };
  }

  const permissions = {
    precision: "none" as AppPermissionLevel,
    momentum: "none" as AppPermissionLevel,
  };

  data?.forEach((perm) => {
    if (perm.app === "precision")
      permissions.precision = perm.permission as AppPermissionLevel;
    if (perm.app === "momentum")
      permissions.momentum = perm.permission as AppPermissionLevel;
  });

  return permissions;
}

/**
 * Set app permission for a member
 * Only org owners and admins can call this
 */
export async function setMemberAppPermission(
  memberId: string,
  app: AppName,
  permission: AppPermissionLevel,
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  try {
    // Note: app_permissions table will exist after running migrations
    const { error } = await supabase.from("app_permissions").upsert(
      {
        memberId,
        app,
        permission,
        updatedAt: new Date().toISOString(),
      },
      {
        onConflict: "memberId,app",
      },
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get all members of an organization with their app permissions
 * Only org owners and admins can call this
 */
export async function getOrganizationMembers(
  organizationId: string,
): Promise<MemberWithPermissions[]> {
  const supabase = getSupabaseClient();

  // First get members with user info
  // Note: member table will exist after running Better Auth migrations
  const { data: members, error: membersError } = await supabase
    .from("member")
    .select(
      `
      id,
      userId,
      organizationId,
      role,
      createdAt,
      user:userId (
        id,
        name,
        email,
        image
      )
    `,
    )
    .eq("organizationId", organizationId)
    .returns<MemberRow[]>();

  if (membersError || !members) {
    console.error("Error fetching members:", membersError);
    return [];
  }

  // Then get app permissions for all members
  const memberIds = members.map((m) => m.id);
  // Note: app_permissions table will exist after running migrations
  const { data: permissions, error: permsError } = await supabase
    .from("app_permissions")
    .select("*")
    .in("memberId", memberIds)
    .returns<AppPermissionRow[]>();

  if (permsError) {
    console.error("Error fetching permissions:", permsError);
  }

  // Combine members with their permissions
  return members.map((member) => ({
    id: member.id,
    user_id: member.userId,
    organization_id: member.organizationId,
    role: member.role,
    created_at: member.createdAt,
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      image: member.user.image,
    },
    app_permissions: permissions?.filter((p) => p.memberId === member.id) || [],
  }));
}

/**
 * Check if user has permission for an app in a specific organization
 * This is a client-side helper that uses the database function
 */
export async function checkUserAppPermission(
  userId: string,
  organizationId: string,
  app: AppName,
  requiredPermission: AppPermissionLevel,
): Promise<boolean> {
  const supabase = getSupabaseClient();

  // Note: user_has_app_permission function will exist after running migrations
  const { data, error } = await supabase.rpc("user_has_app_permission", {
    check_user_id: userId,
    check_org_id: organizationId,
    app_to_check: app,
    required_permission: requiredPermission,
  });

  if (error) {
    console.error("Error checking permission:", error);
    return false;
  }

  return data === true;
}
