-- ================================================
-- Base Seed Data
-- ================================================
-- This file contains the base seed data that is loaded in ALL environments.
-- It includes essential data like system configurations, default roles, etc.
-- ================================================

-- Clear existing seed data (optional, be careful in production)
-- This ensures idempotent seeding
TRUNCATE TABLE app_permissions CASCADE;

-- ================================================
-- System Configuration
-- ================================================

-- Insert default app configurations if needed
-- Example: System settings, feature flags, etc.

-- ================================================
-- Default Roles and Permissions
-- ================================================

-- Note: Better Auth manages its own roles, but we can add app-specific defaults here

-- ================================================
-- Essential Reference Data
-- ================================================

-- Add any reference data that all environments need
-- Example: Countries, currencies, status types, etc.