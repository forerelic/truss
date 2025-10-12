-- ================================================
-- Development Seed Data for MCP Suite
-- ================================================
-- This file contains test data for local development.
-- It's automatically executed during db:reset.
-- ================================================

-- ================================================
-- Test Users
-- ================================================

INSERT INTO "user" (id, email, name, "emailVerified", "createdAt", "updatedAt")
VALUES
  ('usr_dev_admin', 'admin@test.local', 'Admin User', true, NOW(), NOW()),
  ('usr_dev_user1', 'user1@test.local', 'Test User 1', true, NOW(), NOW()),
  ('usr_dev_user2', 'user2@test.local', 'Test User 2', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  "updatedAt" = NOW();

-- ================================================
-- Test Organizations
-- ================================================

INSERT INTO organization (id, name, slug, "createdAt")
VALUES
  ('org_dev_acme', 'Acme Corp', 'acme-corp', NOW()),
  ('org_dev_tech', 'Tech Startup', 'tech-startup', NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug;

-- ================================================
-- Organization Memberships
-- ================================================

INSERT INTO member (id, "organizationId", "userId", role, "createdAt")
VALUES
  ('mem_dev_1', 'org_dev_acme', 'usr_dev_admin', 'owner', NOW()),
  ('mem_dev_2', 'org_dev_acme', 'usr_dev_user1', 'member', NOW()),
  ('mem_dev_3', 'org_dev_tech', 'usr_dev_user2', 'admin', NOW())
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role;

-- ================================================
-- App Permissions
-- ================================================

INSERT INTO app_permissions (id, "memberId", app, permission)
VALUES
  ('perm_dev_1', 'mem_dev_1', 'precision', 'admin'),
  ('perm_dev_2', 'mem_dev_1', 'momentum', 'admin'),
  ('perm_dev_3', 'mem_dev_2', 'precision', 'write'),
  ('perm_dev_4', 'mem_dev_2', 'momentum', 'read'),
  ('perm_dev_5', 'mem_dev_3', 'precision', 'admin'),
  ('perm_dev_6', 'mem_dev_3', 'momentum', 'admin')
ON CONFLICT ("memberId", app) DO UPDATE SET
  permission = EXCLUDED.permission;

-- ================================================
-- Sample Projects
-- ================================================
-- Note: Add project-specific seed data in separate migration files
-- or create project tables first before seeding them.