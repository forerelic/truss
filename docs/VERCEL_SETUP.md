# Vercel Environment Variables - Manual Setup Required

This document contains the **manual steps** you need to complete in the Vercel dashboard to finalize the staging → production pipeline setup.

## ⚠️ Why Manual Setup is Required

Sensitive environment variables (like database URLs and Supabase keys) cannot be set via Vercel CLI because they require interactive input. These must be added through the Vercel dashboard.

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/
- **Project Settings**: https://vercel.com/[your-team]/truss/settings/environment-variables
- **Deployments**: https://vercel.com/[your-team]/truss

## 📋 Current Status

✅ **Completed (Automated):**

- Removed production values from Preview environment
- Updated `NEXT_PUBLIC_APP_URL` to staging URL in Preview
- Added `STAGING_WEB_URL` GitHub secret for desktop builds
- Updated desktop build workflow for environment selection
- Created production and staging `.env` files

⚠️ **Requires Manual Action (You):**

- Add staging Supabase credentials to Vercel Preview environment
- Verify production environment variables are correct
- Test staging deployment

## 🎯 Manual Steps Required

### Step 1: Access Vercel Environment Variables

1. Go to: https://vercel.com/[your-team]/truss/settings/environment-variables
2. You should see existing variables for Production and Preview scopes

### Step 2: Add Staging Supabase Variables to Preview

Add these three variables with **Preview** scope:

| Variable Name                   | Value                                     | Environment Scope |
| ------------------------------- | ----------------------------------------- | ----------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://[staging-project].supabase.co`   | Preview           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (your staging Supabase anon key) | Preview           |
| `DATABASE_URL`                  | `postgresql://...` (staging database URL) | Preview           |

**How to add each variable:**

1. Click "Add New" button
2. Enter the variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
3. Enter the value from your staging Supabase project
4. Select **"Preview"** in the "Environment" dropdown
5. Click "Save"

### Step 3: Verify Production Variables

Ensure these variables exist with **Production** scope:

| Variable Name                   | Value                                        | Environment Scope |
| ------------------------------- | -------------------------------------------- | ----------------- |
| `NEXT_PUBLIC_APP_URL`           | `https://truss.forerelic.com`                | Production        |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://[prod-project].supabase.co`         | Production        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (your production Supabase anon key) | Production        |
| `DATABASE_URL`                  | `postgresql://...` (production database URL) | Production        |
| `BETTER_AUTH_SECRET`            | `<32+ character secret>`                     | Production        |

**If any are missing or incorrect:**

1. Click the variable name to edit
2. Update the value
3. Ensure "Production" scope is selected
4. Click "Save"

### Step 4: Verify Environment Variable Scoping

After adding all variables, you should have this structure:

```
Production Environment:
  ✅ NEXT_PUBLIC_APP_URL = https://truss.forerelic.com
  ✅ DATABASE_URL = postgresql://... (production)
  ✅ NEXT_PUBLIC_SUPABASE_URL = https://[prod-project].supabase.co
  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ... (production)
  ✅ BETTER_AUTH_SECRET = <secret>

Preview Environment:
  ✅ NEXT_PUBLIC_APP_URL = https://staging.truss.forerelic.com
  ✅ DATABASE_URL = postgresql://... (staging)
  ✅ NEXT_PUBLIC_SUPABASE_URL = https://[staging-project].supabase.co
  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ... (staging)
  ✅ BETTER_AUTH_SECRET = <secret> (can be same as production)
```

### Step 5: Trigger a Staging Deployment

After setting up the environment variables, trigger a staging deployment to verify:

```bash
# Make a small change to trigger deployment
git checkout develop
git commit --allow-empty -m "chore: trigger staging deployment"
git push origin develop
```

Then visit: https://staging.truss.forerelic.com

**Verify:**

- [ ] Staging site loads correctly
- [ ] Can connect to staging database
- [ ] Authentication works (if applicable)
- [ ] No environment variable errors in logs

## 🔍 Verification Commands

After completing manual setup, verify with these commands:

```bash
# Check Vercel environment variables
vercel env ls

# You should see different values for:
# - Production vs Preview scopes
# - NEXT_PUBLIC_APP_URL should differ
# - DATABASE_URL should differ
# - SUPABASE URLs should differ
```

## 🐛 Troubleshooting

### "Environment variable not found" errors on staging

**Cause:** Variable not set for Preview scope

**Fix:**

1. Check Vercel dashboard → Environment Variables
2. Ensure the missing variable has "Preview" selected
3. Redeploy staging: `git push origin develop`

### Staging site connects to production database

**Cause:** `DATABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` not scoped correctly

**Fix:**

1. Verify Preview environment has staging database URL
2. Verify Production environment has production database URL
3. Check that both are saved with correct scopes
4. Redeploy: `git push origin develop`

### Changes not appearing on staging

**Cause:** May be deploying to wrong branch or environment

**Fix:**

1. Verify you pushed to `develop` branch: `git branch --show-current`
2. Check Vercel dashboard → Deployments
3. Ensure latest deployment is from `develop` branch
4. Check deployment logs for errors

## 📖 Related Documentation

- **Deployment Pipeline**: See `CLAUDE.md` → "Deployment Pipeline (Local → Staging → Production)"
- **Environment Variables**: See `CLAUDE.md` → "Environment Variables"
- **GitHub Secrets**: See `CLAUDE.md` → "GitHub Secrets for Desktop Builds"

## ✅ Completion Checklist

- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` to Preview environment
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Preview environment
- [ ] Added `DATABASE_URL` to Preview environment
- [ ] Verified all Production environment variables are correct
- [ ] Triggered test deployment to staging
- [ ] Staging site loads without errors
- [ ] Verified staging connects to staging database
- [ ] Verified production connects to production database

## 🎉 Next Steps

Once all manual steps are complete:

1. **Test the pipeline end-to-end:**
   - Create feature branch
   - Merge to `develop` → verify staging deployment
   - Merge to `main` → verify production deployment

2. **Build desktop apps:**
   - Test staging build via GitHub Actions
   - Test production build via GitHub Actions

3. **Commit pipeline setup:**
   ```bash
   git add .
   git commit -m "feat: complete staging → production pipeline setup"
   git push origin develop
   ```

## 📞 Need Help?

If you encounter issues:

1. Check Vercel deployment logs: https://vercel.com/[your-team]/truss
2. Review GitHub Actions logs: https://github.com/[your-org]/truss/actions
3. Verify environment variables match between Vercel dashboard and GitHub secrets
4. Ensure branch strategy is correct (`develop` → staging, `main` → production)
