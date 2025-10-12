-- ================================================
-- Staging Seed Data
-- ================================================
-- This file contains seed data for STAGING environment only.
-- It includes realistic test data for QA and UAT testing.
-- ================================================

-- Only run in staging environment
DO $$
BEGIN
  -- Check if we're in staging environment
  IF current_setting('app.environment', true) != 'staging' THEN
    RAISE NOTICE 'Skipping staging seed data (not in staging environment)';
    RETURN;
  END IF;

  RAISE NOTICE 'Loading staging seed data...';
END $$;

-- ================================================
-- QA Test Users
-- ================================================

-- Insert QA test users with realistic data
INSERT INTO "user" (id, email, name, "emailVerified", "createdAt", "updatedAt")
VALUES
  ('usr_qa_admin', 'qa.admin@staging.example.com', 'QA Admin', true, NOW(), NOW()),
  ('usr_qa_tester1', 'qa.tester1@staging.example.com', 'QA Tester 1', true, NOW(), NOW()),
  ('usr_qa_tester2', 'qa.tester2@staging.example.com', 'QA Tester 2', true, NOW(), NOW()),
  ('usr_qa_manager', 'qa.manager@staging.example.com', 'QA Manager', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  "updatedAt" = NOW();

-- Insert staging test organizations
INSERT INTO organization (id, name, slug, "createdAt", "updatedAt")
VALUES
  ('org_qa_enterprise', 'QA Enterprise', 'qa-enterprise', NOW(), NOW()),
  ('org_qa_startup', 'QA Startup', 'qa-startup', NOW(), NOW()),
  ('org_qa_agency', 'QA Agency', 'qa-agency', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  "updatedAt" = NOW();

-- Insert realistic membership scenarios
INSERT INTO member (id, "organizationId", "userId", role, "createdAt", "updatedAt")
VALUES
  ('mem_qa_1', 'org_qa_enterprise', 'usr_qa_admin', 'owner', NOW(), NOW()),
  ('mem_qa_2', 'org_qa_enterprise', 'usr_qa_tester1', 'admin', NOW(), NOW()),
  ('mem_qa_3', 'org_qa_enterprise', 'usr_qa_tester2', 'member', NOW(), NOW()),
  ('mem_qa_4', 'org_qa_startup', 'usr_qa_manager', 'owner', NOW(), NOW()),
  ('mem_qa_5', 'org_qa_agency', 'usr_qa_tester1', 'member', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- Insert varied app permissions for testing
INSERT INTO app_permissions (id, "memberId", app, permission)
VALUES
  -- Enterprise: Full access for owner/admin, limited for member
  ('perm_qa_1', 'mem_qa_1', 'precision', 'admin'),
  ('perm_qa_2', 'mem_qa_1', 'momentum', 'admin'),
  ('perm_qa_3', 'mem_qa_2', 'precision', 'write'),
  ('perm_qa_4', 'mem_qa_2', 'momentum', 'write'),
  ('perm_qa_5', 'mem_qa_3', 'precision', 'read'),
  ('perm_qa_6', 'mem_qa_3', 'momentum', 'none'),

  -- Startup: Owner has full access
  ('perm_qa_7', 'mem_qa_4', 'precision', 'admin'),
  ('perm_qa_8', 'mem_qa_4', 'momentum', 'admin'),

  -- Agency: Member has mixed permissions
  ('perm_qa_9', 'mem_qa_5', 'precision', 'write'),
  ('perm_qa_10', 'mem_qa_5', 'momentum', 'read')
ON CONFLICT (id) DO UPDATE SET
  permission = EXCLUDED.permission;

-- ================================================
-- Realistic Test Data
-- ================================================

-- Add realistic test projects for QA testing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'precision_projects') THEN
    INSERT INTO precision_projects (id, "organizationId", "ownerId", name, "createdAt", "updatedAt")
    VALUES
      (gen_random_uuid(), 'org_qa_enterprise', 'usr_qa_admin', 'Enterprise Construction Project', NOW(), NOW()),
      (gen_random_uuid(), 'org_qa_enterprise', 'usr_qa_tester1', 'Office Buildout Estimate', NOW(), NOW()),
      (gen_random_uuid(), 'org_qa_startup', 'usr_qa_manager', 'Startup Office Design', NOW(), NOW()),
      (gen_random_uuid(), 'org_qa_agency', 'usr_qa_tester1', 'Client Project Alpha', NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Add realistic test momentum projects
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'momentum_projects') THEN
    INSERT INTO momentum_projects (id, "organizationId", "ownerId", name, status, "createdAt", "updatedAt")
    VALUES
      (gen_random_uuid(), 'org_qa_enterprise', 'usr_qa_admin', 'Q2 Roadmap', 'active', NOW(), NOW()),
      (gen_random_uuid(), 'org_qa_enterprise', 'usr_qa_tester2', 'Customer Success Initiative', 'planning', NOW(), NOW()),
      (gen_random_uuid(), 'org_qa_startup', 'usr_qa_manager', 'MVP Development', 'active', NOW(), NOW()),
      (gen_random_uuid(), 'org_qa_agency', 'usr_qa_tester1', 'Client Deliverables', 'active', NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ================================================
-- Performance Test Data
-- ================================================

-- Generate bulk data for performance testing (optional)
-- Uncomment to create larger datasets for load testing
/*
DO $$
DECLARE
  i INTEGER;
BEGIN
  -- Generate 100 test projects for performance testing
  FOR i IN 1..100 LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'precision_projects') THEN
      INSERT INTO precision_projects (id, "organizationId", "ownerId", name, "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'org_qa_enterprise',
        'usr_qa_admin',
        'Performance Test Project ' || i,
        NOW() - (i || ' days')::INTERVAL,
        NOW() - (i || ' days')::INTERVAL
      );
    END IF;
  END LOOP;
END $$;
*/

RAISE NOTICE 'Staging seed data loaded successfully';