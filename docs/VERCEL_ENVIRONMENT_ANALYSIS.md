# Vercel Environment Architecture - Investigation & Action Plan

## 🔍 Investigation Summary

**Date:** 2025-10-10
**Issue:** Staging and production environments not properly separated

## Current State (BROKEN)

### Alias Configuration

```
Deployment: truss-qgm6f381v-collins-projects-c5b68980.vercel.app
├── Alias: truss.forerelic.com (production)
├── Alias: www.truss.forerelic.com (production)
└── Alias: www.staging.truss.forerelic.com (staging) ❌ SAME DEPLOYMENT!
```

**Problem:** Both production and staging domains point to the same deployment. There is no actual staging environment.

### Environment Variables

```
Preview Environment:
- NEXT_PUBLIC_APP_URL (encrypted)
- NODE_ENV (encrypted)
- BETTER_AUTH_SECRET (encrypted)

Production Environment:
- NEXT_PUBLIC_APP_URL (encrypted)
- NODE_ENV (encrypted)
- BETTER_AUTH_SECRET (encrypted)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (encrypted)
- NEXT_PUBLIC_SUPABASE_URL (encrypted)
- DATABASE_URL (encrypted)
```

**Issue:** Preview environment is missing database credentials (expected for staging).

## Vercel's Environment Model

### Built-in Environments (All Plans)

Vercel provides **3 environments** (not customizable):

1. **Production**
   - Branch: Configured production branch (usually `main`)
   - Domain: Production custom domains
   - Env Vars: "Production" scoped

2. **Preview**
   - Branch: ALL non-production branches (`develop`, `feature/*`, etc.)
   - Domain: Custom preview domains OR auto-generated (`*-git-*.vercel.app`)
   - Env Vars: "Preview" scoped (SHARED across all preview branches)

3. **Development**
   - Local only (`vercel dev`)
   - Env Vars: "Development" scoped

### Key Limitations

❌ **Cannot create custom environments** (e.g., "staging" as a separate environment)
❌ **Cannot have different env vars for `develop` vs `feature/*` branches** (both use "Preview")
✅ **Can assign custom domains to specific branches** (e.g., `staging.domain.com` → `develop`)
✅ **Other branches get auto-generated URLs** (they won't override your staging domain)

## Correct Architecture

### Target Setup

```
┌─────────────────────────────────────────────────────────────┐
│ PRODUCTION ENVIRONMENT                                      │
├─────────────────────────────────────────────────────────────┤
│ Branch: main                                                │
│ Domain: truss.forerelic.com                                 │
│ Domain: www.truss.forerelic.com                             │
│ Env Vars: Production Supabase, Production URLs             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PREVIEW ENVIRONMENT                                         │
├─────────────────────────────────────────────────────────────┤
│ Branch: develop                                             │
│ Domain: staging.truss.forerelic.com (branch-specific)       │
│ Env Vars: Staging Supabase, Staging URLs                   │
│                                                             │
│ Branch: feature/*                                           │
│ Domain: truss-git-feature-name-team.vercel.app (auto)      │
│ Env Vars: Same as develop (SHARED preview env vars)        │
└─────────────────────────────────────────────────────────────┘
```

### Branch-to-Domain Mapping

| Branch         | Environment | Domain                                   | Env Var Scope |
| -------------- | ----------- | ---------------------------------------- | ------------- |
| `main`         | Production  | `truss.forerelic.com`                    | Production    |
| `develop`      | Preview     | `staging.truss.forerelic.com`            | Preview       |
| `feature/auth` | Preview     | `truss-git-feature-auth-team.vercel.app` | Preview       |
| `fix/bug-123`  | Preview     | `truss-git-fix-bug-123-team.vercel.app`  | Preview       |

**Key Point:** `staging.truss.forerelic.com` is **exclusively** assigned to `develop` branch. Other branches can't use it.

## Environment Variable Strategy

### Challenge

Preview environment variables are **shared** across all non-production branches. You cannot have different variables for `develop` vs `feature/*`.

### Solutions

#### Option 1: Accept Shared Preview Vars (Recommended for Free/Pro)

- All preview branches use staging database
- Feature branches test against staging data
- Pros: Simple, works with any Vercel plan
- Cons: Feature branches use staging DB (not isolated)

#### Option 2: Runtime Branch Detection

Use `VERCEL_GIT_COMMIT_REF` to differentiate at runtime:

```typescript
// apps/web/src/env.ts or config
const branch = process.env.VERCEL_GIT_COMMIT_REF;
const isStaging = branch === "develop";
const isFeatureBranch = branch?.startsWith("feature/");

export const config = {
  apiUrl: isStaging ? "https://staging.truss.forerelic.com" : process.env.NEXT_PUBLIC_APP_URL,
  // ... other runtime config
};
```

#### Option 3: Feature Branch Env Vars (Manual)

Set up ephemeral databases per feature:

- `STAGING_SUPABASE_URL` → for `develop` branch
- `FEATURE_AUTH_SUPABASE_URL` → for `feature/auth` branch
- Select at runtime based on `VERCEL_GIT_COMMIT_REF`

**Downside:** High maintenance, complex for teams

## Action Plan

### Step 1: Verify Domain Configuration in Vercel Dashboard

1. Go to: https://vercel.com/collins-projects-c5b68980/truss/settings/domains
2. Check the following:

**Production Domains:**

- [ ] `truss.forerelic.com` → assigned to `main` branch
- [ ] `www.truss.forerelic.com` → assigned to `main` branch

**Preview Domains:**

- [ ] `staging.truss.forerelic.com` → assigned to `develop` branch
- [ ] `www.staging.truss.forerelic.com` → Remove (optional subdomain)

### Step 2: Add Missing Preview Environment Variables

**Via Vercel Dashboard** (https://vercel.com/collins-projects-c5b68980/truss/settings/environment-variables):

Add these to **Preview** scope:

- `NEXT_PUBLIC_SUPABASE_URL` = `<staging-supabase-url>`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<staging-anon-key>`
- `DATABASE_URL` = `<staging-database-url>`

**Note:** These variables will be used by ALL preview branches (develop + feature branches).

### Step 3: Update Production Environment Variables

Verify these exist in **Production** scope:

- `NEXT_PUBLIC_APP_URL` = `https://truss.forerelic.com`
- `NEXT_PUBLIC_SUPABASE_URL` = `<production-supabase-url>`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<production-anon-key>`
- `DATABASE_URL` = `<production-database-url>`
- `BETTER_AUTH_SECRET` = `<secret>`

### Step 4: Trigger Test Deployments

**Test Production:**

```bash
git checkout main
git commit --allow-empty -m "test: verify production deployment"
git push origin main
```

**Verify:**

- Go to https://truss.forerelic.com
- Check it connects to production database
- Check Vercel dashboard deployment logs

**Test Staging:**

```bash
git checkout develop
git commit --allow-empty -m "test: verify staging deployment"
git push origin develop
```

**Verify:**

- Go to https://staging.truss.forerelic.com
- Check it connects to staging database
- Check environment is "preview" in Vercel

**Test Feature Branch:**

```bash
git checkout -b test/environment-separation
git commit --allow-empty -m "test: verify feature branch deployment"
git push origin test/environment-separation
```

**Verify:**

- Gets auto-generated URL like `truss-git-test-environment-separation-team.vercel.app`
- Does NOT use `staging.truss.forerelic.com`
- Uses Preview environment variables (staging database)
- Delete branch after testing

### Step 5: Update Documentation

Update `CLAUDE.md` to clarify:

- Vercel's 3-environment model
- Preview env vars are shared across all non-production branches
- Custom domain assignment ensures `staging.truss.forerelic.com` only serves `develop`
- Feature branches get auto-generated URLs and use the same Preview env vars

## Verification Checklist

- [ ] `main` branch deploys to `truss.forerelic.com`
- [ ] `develop` branch deploys to `staging.truss.forerelic.com`
- [ ] Feature branches get auto-generated URLs (not staging domain)
- [ ] Production uses production database
- [ ] Staging uses staging database
- [ ] Preview environment variables include database credentials
- [ ] No domain alias overlap between production and staging
- [ ] DNS for `staging.truss.forerelic.com` is configured (A record or CNAME)

## Common Questions

### Q: Can I create a custom "staging" environment in Vercel?

**A:** No. Vercel provides 3 fixed environments (Production, Preview, Development). "Staging" is achieved by assigning a custom domain to a specific branch within the Preview environment.

### Q: Won't feature branches use my staging domain?

**A:** No. When you assign `staging.truss.forerelic.com` to the `develop` branch, it's exclusive. Other branches get auto-generated URLs.

### Q: Can I have different env vars for staging vs feature branches?

**A:** Not directly. Both use "Preview" scope. Use runtime branch detection (`VERCEL_GIT_COMMIT_REF`) if you need differentiation.

### Q: What happens if I push to a feature branch?

**A:** Vercel creates a preview deployment with URL: `truss-git-feature-name-team.vercel.app`. It uses Preview environment variables (staging database).

### Q: How do I test with production-like data on a feature branch?

**A:** Either:

1. Accept that feature branches use staging data
2. Implement runtime branch detection to select different databases
3. Use Vercel's CLI to override env vars for specific deployments

## Recommendations

**For Solo Developer / Small Team:**

1. ✅ Use the standard 3-environment model (Production, Preview for all non-prod)
2. ✅ Assign `staging.truss.forerelic.com` to `develop` branch
3. ✅ Accept that feature branches use staging database
4. ✅ Keep it simple - don't over-engineer branch-specific env vars

**For Larger Team / Complex Needs:**

1. Consider runtime branch detection for env var selection
2. Use separate Vercel projects for true environment isolation (more complex)
3. Implement preview deployment approvals/gates

## Next Steps

1. **Immediate:** Complete Action Plan Steps 1-4 above
2. **After Verification:** Update CLAUDE.md with clarified environment model
3. **Update:** `docs/VERCEL_SETUP.md` to explain Preview environment limitations
4. **Commit:** All environment configuration changes

## Resources

- [Vercel Environments Documentation](https://vercel.com/docs/deployments/environments)
- [System Environment Variables](https://vercel.com/docs/environment-variables/system-environment-variables)
- [Git Configuration](https://vercel.com/docs/project-configuration/git-configuration)
