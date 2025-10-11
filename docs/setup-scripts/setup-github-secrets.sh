#!/bin/bash

# GitHub Secrets Setup Script
# This script sets up all required GitHub secrets for the MCP Suite repository
# Requires GitHub CLI (gh) to be installed and authenticated

echo "Setting up GitHub Secrets for truss repository..."
echo "================================================"

# Repository details
OWNER="forerelic"
REPO="truss"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   brew install gh"
    echo "   gh auth login"
    exit 1
fi

# Function to set a secret
set_secret() {
    local name=$1
    local value=$2
    local description=$3

    echo "Setting $name - $description"
    echo "$value" | gh secret set "$name" --repo "$OWNER/$REPO"
}

# Read values from .env.local if it exists
if [ -f ".env.local" ]; then
    echo "Reading values from .env.local..."
    source .env.local
else
    echo "⚠️  .env.local not found. Please ensure you're in the project root."
    exit 1
fi

echo ""
echo "Setting Supabase Secrets..."
echo "----------------------------"

# Supabase Access Token
set_secret "SUPABASE_ACCESS_TOKEN" \
    "$SUPABASE_ACCESS_TOKEN" \
    "Supabase CLI access token"

# Staging Environment
set_secret "STAGING_PROJECT_ID" \
    "$STAGING_PROJECT_ID" \
    "Staging Supabase project ID"

set_secret "STAGING_SUPABASE_URL" \
    "$STAGING_SUPABASE_URL" \
    "Staging Supabase URL"

set_secret "STAGING_SUPABASE_ANON_KEY" \
    "$STAGING_SUPABASE_ANON_KEY" \
    "Staging Supabase anon key"

set_secret "STAGING_DB_PASSWORD" \
    "$STAGING_DB_PASSWORD" \
    "Staging database password"

set_secret "STAGING_DATABASE_URL" \
    "$STAGING_DATABASE_URL" \
    "Staging database connection string"

# Production Environment
set_secret "PRODUCTION_PROJECT_ID" \
    "$PRODUCTION_PROJECT_ID" \
    "Production Supabase project ID"

set_secret "PRODUCTION_SUPABASE_URL" \
    "$PRODUCTION_SUPABASE_URL" \
    "Production Supabase URL"

set_secret "PRODUCTION_SUPABASE_ANON_KEY" \
    "$PRODUCTION_SUPABASE_ANON_KEY" \
    "Production Supabase anon key"

set_secret "PRODUCTION_DB_PASSWORD" \
    "$PRODUCTION_DB_PASSWORD" \
    "Production database password"

set_secret "PRODUCTION_DATABASE_URL" \
    "$PRODUCTION_DATABASE_URL" \
    "Production database connection string"

echo ""
echo "Setting Better Auth Secret..."
echo "------------------------------"

# Generate a secure Better Auth secret if not set
if [ -z "$BETTER_AUTH_SECRET" ] || [ "$BETTER_AUTH_SECRET" == "your-secret-key-here" ]; then
    BETTER_AUTH_SECRET=$(openssl rand -base64 32)
    echo "Generated new BETTER_AUTH_SECRET"
fi

set_secret "BETTER_AUTH_SECRET" \
    "$BETTER_AUTH_SECRET" \
    "Better Auth encryption secret"

echo ""
echo "Setting Repository Variables (not secrets)..."
echo "---------------------------------------------"

# These are repository variables, not secrets (they're not sensitive)
echo "Setting TURBO_TEAM variable..."
gh variable set "TURBO_TEAM" --body "forerelic" --repo "$OWNER/$REPO"

echo ""
echo "Optional Secrets (skip if not configured)..."
echo "--------------------------------------------"

# Turbo Token (for Vercel remote caching) - optional
if [ ! -z "$TURBO_TOKEN" ]; then
    set_secret "TURBO_TOKEN" \
        "$TURBO_TOKEN" \
        "Turbo remote cache token"
else
    echo "⚠️  TURBO_TOKEN not set - remote caching will be disabled"
fi

# Vercel Token (for deployments) - optional
if [ ! -z "$VERCEL_TOKEN" ]; then
    set_secret "VERCEL_TOKEN" \
        "$VERCEL_TOKEN" \
        "Vercel deployment token"

    # Also set Vercel org and project IDs if available
    if [ ! -z "$VERCEL_ORG_ID" ]; then
        gh variable set "VERCEL_ORG_ID" --body "$VERCEL_ORG_ID" --repo "$OWNER/$REPO"
    fi

    if [ ! -z "$VERCEL_PROJECT_ID" ]; then
        gh variable set "VERCEL_PROJECT_ID" --body "$VERCEL_PROJECT_ID" --repo "$OWNER/$REPO"
    fi
else
    echo "⚠️  VERCEL_TOKEN not set - Vercel deployments will be disabled"
fi

# OAuth Providers (optional)
if [ ! -z "$GITHUB_CLIENT_ID" ] && [ ! -z "$GITHUB_CLIENT_SECRET" ]; then
    set_secret "GITHUB_CLIENT_ID" "$GITHUB_CLIENT_ID" "GitHub OAuth client ID"
    set_secret "GITHUB_CLIENT_SECRET" "$GITHUB_CLIENT_SECRET" "GitHub OAuth client secret"
else
    echo "⚠️  GitHub OAuth not configured"
fi

if [ ! -z "$GOOGLE_CLIENT_ID" ] && [ ! -z "$GOOGLE_CLIENT_SECRET" ]; then
    set_secret "GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_ID" "Google OAuth client ID"
    set_secret "GOOGLE_CLIENT_SECRET" "$GOOGLE_CLIENT_SECRET" "Google OAuth client secret"
else
    echo "⚠️  Google OAuth not configured"
fi

echo ""
echo "================================================"
echo "✅ GitHub Secrets Setup Complete!"
echo ""
echo "Secrets have been added to: https://github.com/$OWNER/$REPO/settings/secrets/actions"
echo ""
echo "Next steps:"
echo "1. Verify secrets at the URL above"
echo "2. Set up Vercel project and add VERCEL_TOKEN if using Vercel"
echo "3. Configure app signing certificates for Tauri releases"
echo "4. Enable branch protection rules"
echo ""
echo "To add Vercel remote caching later:"
echo "1. Create a Vercel account and team"
echo "2. Get your TURBO_TOKEN from Vercel dashboard"
echo "3. Run: echo 'your-token' | gh secret set TURBO_TOKEN --repo $OWNER/$REPO"
echo ""
echo "To add app signing certificates later:"
echo "- macOS: APPLE_SIGNING_IDENTITY, APPLE_ID, APPLE_PASSWORD"
echo "- Windows: WINDOWS_CERTIFICATE, WINDOWS_PASSWORD"
