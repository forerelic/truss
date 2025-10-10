# GitHub Secrets Configuration Guide

> **Complete guide for setting up GitHub secrets and environment variables**

This guide provides step-by-step instructions for configuring all required secrets for the Truss monorepo CI/CD pipeline.

## 📋 Table of Contents

- [Quick Setup Checklist](#quick-setup-checklist)
- [Repository Secrets](#repository-secrets)
- [Environment-Specific Secrets](#environment-specific-secrets)
- [How to Add Secrets](#how-to-add-secrets)
- [Secret Generation Guide](#secret-generation-guide)
- [Verification](#verification)

## ✅ Quick Setup Checklist

### Essential (Required for CI/CD)
- [ ] `TURBO_TOKEN` - Turborepo remote caching
- [ ] `TURBO_TEAM` - Turborepo team (variable)
- [ ] `GITHUB_TOKEN` - Auto-provided by GitHub

### Web Deployment (Required for Vercel)
- [ ] `VERCEL_TOKEN` - Vercel authentication
- [ ] `VERCEL_ORG_ID` - Vercel organization ID
- [ ] `VERCEL_PROJECT_ID` - Vercel project ID
- [ ] `NEXT_PUBLIC_APP_URL` - App URL
- [ ] `BETTER_AUTH_SECRET` - Auth secret key
- [ ] `DATABASE_URL` - PostgreSQL connection

### Supabase (Required for database)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `SUPABASE_ACCESS_TOKEN` - Supabase management token

### Staging Environment
- [ ] `STAGING_PROJECT_ID` - Staging Supabase project ref
- [ ] `STAGING_DB_PASSWORD` - Staging database password

### Production Environment
- [ ] `PRODUCTION_PROJECT_ID` - Production Supabase project ref
- [ ] `PRODUCTION_DB_PASSWORD` - Production database password

### Desktop Apps (Optional - for signing)
- [ ] Apple signing certificates
- [ ] Windows signing certificates
- [ ] Tauri update signing keys

### Notifications (Optional)
- [ ] `SLACK_WEBHOOK_URL` - Slack notifications
- [ ] `DISCORD_WEBHOOK` - Discord notifications

## 🔐 Repository Secrets

### Turborepo Remote Cache

**TURBO_TOKEN**
```bash
# Get from: https://vercel.com/account/tokens
# Scope: Full Account

Purpose: Enables shared build cache across CI runs
Required for: CI, builds, deployments
```

### Vercel Deployment

**VERCEL_TOKEN**
```bash
# Get from: https://vercel.com/account/tokens
# Scope: Full Account

Purpose: Deploy web app to Vercel
Required for: Web deployments
```

**VERCEL_ORG_ID**
```bash
# Find in: Vercel project settings → General
# Format: team_xxxxxxxxxxxxxxxxxxxxx

Purpose: Identify Vercel organization
Required for: Web deployments
```

**VERCEL_PROJECT_ID**
```bash
# Find in: Vercel project settings → General
# Format: prj_xxxxxxxxxxxxxxxxxxxxx

Purpose: Identify specific Vercel project
Required for: Web deployments
```

### Application Configuration

**NEXT_PUBLIC_APP_URL**
```bash
# Development: http://localhost:3000
# Staging: https://staging.truss.app
# Production: https://truss.app

Purpose: Base URL for API calls and OAuth redirects
Required for: All deployments
```

**BETTER_AUTH_SECRET**
```bash
# Generate with: openssl rand -base64 32

Purpose: Encrypt authentication tokens
Required for: Auth functionality
Security: Must be 32+ characters, keep secret
```

**DATABASE_URL**
```bash
# Format: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
# Example: postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

Purpose: Connect to Supabase/PostgreSQL
Required for: Database operations
Security: Contains password, keep secret
```

### Supabase Configuration

**NEXT_PUBLIC_SUPABASE_URL**
```bash
# Get from: Supabase project settings → API
# Format: https://xxxxxxxxxxxxx.supabase.co

Purpose: Supabase client connection
Required for: Database and auth
```

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
```bash
# Get from: Supabase project settings → API → anon/public key

Purpose: Public API key for client requests
Required for: Database and auth
Security: Safe to expose in client (has RLS protection)
```

**SUPABASE_ACCESS_TOKEN**
```bash
# Get from: https://supabase.com/dashboard/account/tokens
# Create: "New access token" with management permissions

Purpose: Manage Supabase projects via CLI
Required for: Database migrations, type generation
Security: Keep secret, has full project access
```

## 🌍 Environment-Specific Secrets

### Staging Environment

**STAGING_PROJECT_ID**
```bash
# Get from: Supabase staging project settings → General
# Format: abcdefghijklmnop

Purpose: Reference to staging Supabase project
Required for: Staging database deployments
```

**STAGING_DB_PASSWORD**
```bash
# Get from: Supabase staging project → Database → Connection string

Purpose: Direct database access for migrations
Required for: Staging migrations
Security: Keep secret
```

### Production Environment

**PRODUCTION_PROJECT_ID**
```bash
# Get from: Supabase production project settings → General
# Format: abcdefghijklmnop

Purpose: Reference to production Supabase project
Required for: Production database deployments
```

**PRODUCTION_DB_PASSWORD**
```bash
# Get from: Supabase production project → Database → Connection string

Purpose: Direct database access for migrations
Required for: Production migrations
Security: Keep secret, use strong password
```

## 🍎 macOS Code Signing (Optional)

**APPLE_CERTIFICATE**
```bash
# Generate: Export Developer ID certificate from Keychain
# Format: Base64-encoded .p12 file

# Export from Keychain:
security find-identity -v -p codesigning
security export -k login.keychain -t identities -f pkcs12 -o cert.p12
base64 -i cert.p12 | pbcopy

Purpose: Sign macOS applications
Required for: Production macOS releases
```

**APPLE_CERTIFICATE_PASSWORD**
```bash
# The password used when exporting the .p12 file

Purpose: Decrypt signing certificate
Required for: macOS code signing
Security: Keep secret
```

**APPLE_SIGNING_IDENTITY**
```bash
# Format: "Developer ID Application: Your Name (TEAM_ID)"
# Get from: security find-identity -v -p codesigning

Purpose: Identify which certificate to use
Required for: macOS code signing
```

**APPLE_ID** & **APPLE_PASSWORD**
```bash
# APPLE_ID: Your Apple Developer account email
# APPLE_PASSWORD: App-specific password from appleid.apple.com

Purpose: Notarize macOS applications
Required for: macOS app notarization
Security: Use app-specific password, not account password
```

**APPLE_TEAM_ID**
```bash
# Get from: Apple Developer Account → Membership
# Format: 10-character alphanumeric (e.g., ABCDE12345)

Purpose: Identify Apple Developer team
Required for: macOS signing and notarization
```

## 🪟 Windows Code Signing (Optional)

**WINDOWS_SIGNING_CERTIFICATE**
```bash
# Format: Base64-encoded .pfx file

# Encode certificate:
base64 -i certificate.pfx > certificate.txt

Purpose: Sign Windows executables
Required for: Production Windows releases
```

**WINDOWS_SIGNING_PASSWORD**
```bash
# The password for the .pfx certificate

Purpose: Decrypt signing certificate
Required for: Windows code signing
Security: Keep secret
```

## 🔄 Tauri Auto-Updater (Optional)

**TAURI_SIGNING_PRIVATE_KEY**
```bash
# Generate: bunx tauri signer generate
# Use: Private key output

Purpose: Sign update manifests
Required for: Auto-update functionality
Security: Keep secret, never commit
```

**TAURI_SIGNING_PUBLIC_KEY**
```bash
# Generate: bunx tauri signer generate
# Use: Public key output

Purpose: Verify update signatures
Required for: Auto-update functionality
Security: Include in app code (tauri.conf.json)
```

## 📢 Notifications (Optional)

**SLACK_WEBHOOK_URL**
```bash
# Get from: Slack → Apps → Incoming Webhooks
# Format: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX

Purpose: Send build/deploy notifications to Slack
Required for: Slack notifications
```

**DISCORD_WEBHOOK**
```bash
# Get from: Discord → Server Settings → Integrations → Webhooks
# Format: https://discord.com/api/webhooks/000000000/XXXXXXXXXXXX

Purpose: Send build/deploy notifications to Discord
Required for: Discord notifications
```

## 🛠️ How to Add Secrets

### Via GitHub Web UI

1. Navigate to repository: https://github.com/forerelic/truss
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter **Name** and **Value**
5. Click **Add secret**

### Via GitHub CLI

```bash
# Add a single secret
gh secret set SECRET_NAME

# Add secret from file
gh secret set SECRET_NAME < secret.txt

# Add secret with value
echo "secret_value" | gh secret set SECRET_NAME

# List all secrets
gh secret list
```

### Via Script (Bulk Setup)

```bash
# Use the provided setup script
./scripts/setup-github-secrets.sh

# Or manually:
gh secret set TURBO_TOKEN -b"your-token"
gh secret set VERCEL_TOKEN -b"your-token"
# ... etc
```

### Environment Variables (not Secrets)

For **non-sensitive** values, use Variables instead:

1. Go to **Settings** → **Secrets and variables** → **Actions** → **Variables** tab
2. Click **New repository variable**
3. Add: `TURBO_TEAM=your-team-name`

## 🔑 Secret Generation Guide

### Generate Random Secrets

```bash
# BETTER_AUTH_SECRET (32 bytes)
openssl rand -base64 32

# TURBO_TOKEN
# Visit: https://vercel.com/account/tokens

# VERCEL_TOKEN
# Visit: https://vercel.com/account/tokens

# Database Password (strong)
openssl rand -base64 24
```

### Generate Tauri Signing Keys

```bash
# Generate keypair
bunx tauri signer generate

# Output:
# Private key: dW50cnVzdGVk... (set as TAURI_SIGNING_PRIVATE_KEY)
# Public key: dW50cnVzdGVk... (set as TAURI_SIGNING_PUBLIC_KEY)
```

### Extract Vercel IDs

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
cd apps/web
vercel link

# Get IDs from .vercel/project.json
cat .vercel/project.json
```

## ✅ Verification

### Check Required Secrets

```bash
# List all configured secrets
gh secret list

# Expected output:
BETTER_AUTH_SECRET
DATABASE_URL
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_URL
PRODUCTION_DB_PASSWORD
PRODUCTION_PROJECT_ID
STAGING_DB_PASSWORD
STAGING_PROJECT_ID
SUPABASE_ACCESS_TOKEN
TURBO_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VERCEL_TOKEN
```

### Test Workflows

```bash
# Trigger CI workflow
git push origin main

# Check workflow status
gh run list --workflow=ci.yml

# View latest run
gh run view
```

### Verify Deployments

```bash
# Check Vercel deployment
vercel ls

# Check Supabase connection
bunx supabase projects list
```

## 🚨 Security Best Practices

1. **Never commit secrets** to git
2. **Rotate secrets regularly** (every 90 days)
3. **Use least-privilege access** (minimum required scopes)
4. **Monitor secret usage** in GitHub Actions logs
5. **Enable secret scanning** in repository settings
6. **Use environment protection rules** for production
7. **Audit access logs** regularly
8. **Remove unused secrets** promptly

## 📚 Additional Resources

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Management API](https://supabase.com/docs/reference/api/introduction)
- [Tauri Updater](https://tauri.app/v1/guides/distribution/updater)
- [Apple Code Signing](https://developer.apple.com/support/code-signing/)

---

**Questions?** Open an issue: https://github.com/forerelic/truss/issues/new
