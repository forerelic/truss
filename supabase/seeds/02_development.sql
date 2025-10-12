-- ================================================
-- Development Seed Data
-- ================================================
-- This file contains seed data for LOCAL DEVELOPMENT only.
-- It includes test users, sample projects, and demo data.
-- ================================================

-- Only run in development environment
DO $$
BEGIN
  -- Check if we're in a development environment
  -- This prevents accidental seeding in production
  IF current_database() != 'postgres' OR current_setting('app.environment', true) = 'production' THEN
    RAISE NOTICE 'Skipping development seed data (not in development environment)';
    RETURN;
  END IF;

  RAISE NOTICE 'Loading development seed data...';
END $$;

-- ================================================
-- Test Users
-- ================================================

-- Insert test users (Better Auth)
-- Note: Passwords should be hashed using Better Auth's hashing method
-- These are example users - adjust based on your Better Auth setup

INSERT INTO "user" (id, email, name, "emailVerified", "createdAt", "updatedAt")
VALUES
  ('usr_dev_admin', 'admin@test.local', 'Admin User', true, NOW(), NOW()),
  ('usr_dev_user1', 'user1@test.local', 'Test User 1', true, NOW(), NOW()),
  ('usr_dev_user2', 'user2@test.local', 'Test User 2', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  "updatedAt" = NOW();

-- Insert test organizations
INSERT INTO organization (id, name, slug, "createdAt", "updatedAt")
VALUES
  ('org_dev_acme', 'Acme Corp', 'acme-corp', NOW(), NOW()),
  ('org_dev_tech', 'Tech Startup', 'tech-startup', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  "updatedAt" = NOW();

-- Insert organization memberships
INSERT INTO member (id, "organizationId", "userId", role, "createdAt", "updatedAt")
VALUES
  ('mem_dev_1', 'org_dev_acme', 'usr_dev_admin', 'owner', NOW(), NOW()),
  ('mem_dev_2', 'org_dev_acme', 'usr_dev_user1', 'member', NOW(), NOW()),
  ('mem_dev_3', 'org_dev_tech', 'usr_dev_user2', 'admin', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- Insert app permissions for members
INSERT INTO app_permissions (id, "memberId", app, permission)
VALUES
  ('perm_dev_1', 'mem_dev_1', 'precision', 'admin'),
  ('perm_dev_2', 'mem_dev_1', 'momentum', 'admin'),
  ('perm_dev_3', 'mem_dev_2', 'precision', 'write'),
  ('perm_dev_4', 'mem_dev_2', 'momentum', 'read'),
  ('perm_dev_5', 'mem_dev_3', 'precision', 'admin'),
  ('perm_dev_6', 'mem_dev_3', 'momentum', 'admin')
ON CONFLICT (id) DO UPDATE SET
  permission = EXCLUDED.permission;

-- ================================================
-- Sample Projects (Precision)
-- ================================================

-- Add sample Precision projects if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'precision_projects') THEN
    INSERT INTO precision_projects (id, "organizationId", "ownerId", name, "createdAt", "updatedAt")
    VALUES
      (gen_random_uuid(), 'org_dev_acme', 'usr_dev_admin', 'Office Renovation', NOW(), NOW()),
      (gen_random_uuid(), 'org_dev_acme', 'usr_dev_user1', 'Website Redesign', NOW(), NOW()),
      (gen_random_uuid(), NULL, 'usr_dev_user2', 'Personal Home Project', NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ================================================
-- Sample Projects (Momentum)
-- ================================================

-- Add sample Momentum projects if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'momentum_projects') THEN
    INSERT INTO momentum_projects (id, "organizationId", "ownerId", name, status, "createdAt", "updatedAt")
    VALUES
      (gen_random_uuid(), 'org_dev_acme', 'usr_dev_admin', 'Q1 Marketing Campaign', 'active', NOW(), NOW()),
      (gen_random_uuid(), 'org_dev_tech', 'usr_dev_user2', 'Product Launch', 'planning', NOW(), NOW()),
      (gen_random_uuid(), NULL, 'usr_dev_user1', 'Personal Goals Tracker', 'active', NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ================================================
-- Development Environment Settings
-- ================================================

-- Add any development-specific settings or feature flags
-- Example: Enable debug mode, disable rate limiting, etc.

RAISE NOTICE 'Development seed data loaded successfully';