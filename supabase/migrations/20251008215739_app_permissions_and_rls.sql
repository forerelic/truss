-- Multi-Tenant Organization: App Permissions & RLS
--
-- Architecture:
-- - Personal workspace: organization_id IS NULL (full admin access to both apps)
-- - Organization workspace: Per-member, per-app permissions (none/read/write/admin)
-- - Inspired by Notion teamspaces, Slack workspaces, ClickUp ClickApps

-- ============================================================================
-- ENUMS
-- ============================================================================

-- App names in MCP Suite
CREATE TYPE app_name AS ENUM ('precision', 'momentum');

-- Permission levels (hierarchical: none < read < write < admin)
CREATE TYPE app_permission_level AS ENUM ('none', 'read', 'write', 'admin');

-- ============================================================================
-- APP PERMISSIONS TABLE
-- ============================================================================

-- Per-member, per-app permissions (like ClickUp per-ClickApp permissions)
CREATE TABLE app_permissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,

  -- Links to organization member (from Better Auth)
  "memberId" TEXT NOT NULL REFERENCES member(id) ON DELETE CASCADE,

  -- Which app this permission applies to
  app app_name NOT NULL,

  -- Permission level for this app
  permission app_permission_level NOT NULL DEFAULT 'none',

  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),

  -- One permission record per app per member
  UNIQUE("memberId", app)
);

-- Indexes for performance
CREATE INDEX idx_app_permissions_member_id ON app_permissions("memberId");
CREATE INDEX idx_app_permissions_app ON app_permissions(app);

-- ============================================================================
-- ORGANIZATION ENHANCEMENTS
-- ============================================================================

-- Add email domain auto-join settings to organizations (like Notion, Slack)
ALTER TABLE organization ADD COLUMN IF NOT EXISTS "allowedDomains" TEXT[];
ALTER TABLE organization ADD COLUMN IF NOT EXISTS "autoJoinEnabled" BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- RLS HELPER FUNCTIONS
-- ============================================================================

-- Get permission hierarchy value (for comparison)
CREATE OR REPLACE FUNCTION get_permission_value(perm app_permission_level)
RETURNS INT AS $$
BEGIN
  RETURN CASE perm
    WHEN 'none' THEN 0
    WHEN 'read' THEN 1
    WHEN 'write' THEN 2
    WHEN 'admin' THEN 3
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;

-- Check if user has required permission level for an app in an organization
-- Handles permission hierarchy: admin >= write >= read >= none
-- Organization owners automatically get admin access to all apps
CREATE OR REPLACE FUNCTION user_has_app_permission(
  check_user_id TEXT,
  check_org_id TEXT,
  app_to_check app_name,
  required_permission app_permission_level
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_permission app_permission_level;
BEGIN
  -- Check if user is a member of the organization
  SELECT role INTO user_role
  FROM member
  WHERE member."userId" = user_has_app_permission.check_user_id
    AND member."organizationId" = user_has_app_permission.check_org_id;

  -- Not a member = no access
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Organization owners automatically get admin access to all apps
  IF user_role = 'owner' THEN
    RETURN TRUE;
  END IF;

  -- Get user's app permission
  SELECT permission INTO user_permission
  FROM app_permissions ap
  JOIN member m ON ap."memberId" = m.id
  WHERE m."userId" = user_has_app_permission.check_user_id
    AND m."organizationId" = user_has_app_permission.check_org_id
    AND ap.app = user_has_app_permission.app_to_check;

  -- No explicit permission = no access
  IF user_permission IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user's permission meets or exceeds required permission
  RETURN get_permission_value(user_permission) >= get_permission_value(required_permission);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's permission level for an app (for UI display)
CREATE OR REPLACE FUNCTION get_user_app_permission(
  check_user_id TEXT,
  check_org_id TEXT,
  app_to_check app_name
)
RETURNS app_permission_level AS $$
DECLARE
  user_role TEXT;
  user_permission app_permission_level;
BEGIN
  -- Personal workspace (org_id IS NULL) = admin access
  IF check_org_id IS NULL THEN
    RETURN 'admin'::app_permission_level;
  END IF;

  -- Check if user is a member
  SELECT role INTO user_role
  FROM member
  WHERE member."userId" = get_user_app_permission.check_user_id
    AND member."organizationId" = get_user_app_permission.check_org_id;

  -- Not a member = none
  IF user_role IS NULL THEN
    RETURN 'none'::app_permission_level;
  END IF;

  -- Owner = admin
  IF user_role = 'owner' THEN
    RETURN 'admin'::app_permission_level;
  END IF;

  -- Get explicit permission
  SELECT permission INTO user_permission
  FROM app_permissions ap
  JOIN member m ON ap."memberId" = m.id
  WHERE m."userId" = get_user_app_permission.check_user_id
    AND m."organizationId" = get_user_app_permission.check_org_id
    AND ap.app = get_user_app_permission.app_to_check;

  RETURN COALESCE(user_permission, 'none'::app_permission_level);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES FOR APP_PERMISSIONS
-- ============================================================================

ALTER TABLE app_permissions ENABLE ROW LEVEL SECURITY;

-- Only organization owners and admins can view app permissions
CREATE POLICY "Org owners and admins can view app permissions"
  ON app_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM member m
      WHERE m.id = app_permissions."memberId"
        AND EXISTS (
          SELECT 1 FROM member um
          WHERE um."userId" = (select auth.uid()::text)
            AND um."organizationId" = m."organizationId"
            AND um.role IN ('owner', 'admin')
        )
    )
  );

-- Only organization owners and admins can create app permissions
CREATE POLICY "Org owners and admins can create app permissions"
  ON app_permissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM member m
      WHERE m.id = app_permissions."memberId"
        AND EXISTS (
          SELECT 1 FROM member um
          WHERE um."userId" = (select auth.uid()::text)
            AND um."organizationId" = m."organizationId"
            AND um.role IN ('owner', 'admin')
        )
    )
  );

-- Only organization owners and admins can update app permissions
CREATE POLICY "Org owners and admins can update app permissions"
  ON app_permissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM member m
      WHERE m.id = app_permissions."memberId"
        AND EXISTS (
          SELECT 1 FROM member um
          WHERE um."userId" = (select auth.uid()::text)
            AND um."organizationId" = m."organizationId"
            AND um.role IN ('owner', 'admin')
        )
    )
  );

-- Only organization owners and admins can delete app permissions
CREATE POLICY "Org owners and admins can delete app permissions"
  ON app_permissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM member m
      WHERE m.id = app_permissions."memberId"
        AND EXISTS (
          SELECT 1 FROM member um
          WHERE um."userId" = (select auth.uid()::text)
            AND um."organizationId" = m."organizationId"
            AND um.role IN ('owner', 'admin')
        )
    )
  );

-- ============================================================================
-- DEFAULT APP PERMISSIONS FOR NEW MEMBERS
-- ============================================================================

-- Automatically create default app permissions when a member is added
CREATE OR REPLACE FUNCTION create_default_app_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Create 'none' permissions for both apps by default
  INSERT INTO app_permissions ("memberId", app, permission)
  VALUES
    (NEW.id, 'precision'::app_name, 'none'::app_permission_level),
    (NEW.id, 'momentum'::app_name, 'none'::app_permission_level)
  ON CONFLICT ("memberId", app) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_member_app_permissions
  AFTER INSERT ON member
  FOR EACH ROW
  EXECUTE FUNCTION create_default_app_permissions();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE app_permissions IS 'Per-member, per-app permissions for multi-tenant organizations';
COMMENT ON FUNCTION user_has_app_permission IS 'Check if user has required permission level for an app (handles hierarchy and owner auto-admin)';
COMMENT ON FUNCTION get_user_app_permission IS 'Get user''s permission level for an app (for UI display)';
