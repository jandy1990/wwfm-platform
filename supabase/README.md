# ⚠️ LOCAL SUPABASE INSTANCE - TESTING ONLY

This directory contains configuration for a **LOCAL Supabase instance** used ONLY for testing infrastructure.

## CRITICAL: This is NOT the Production Database

**Production Database:**
- URL: https://wqxkhxdbxdtpuvuvgirx.supabase.co
- Access via: Supabase MCP tools or `lib/database/client.ts`
- Contains real user data and AI-generated solutions
- **USE THIS for all feature development and queries**

**Local Test Database (this directory):**
- Config: `config.toml` (marked "local-testing-only")
- Port: 54322
- Purpose: Testing Supabase CLI migrations and local setup only
- **DO NOT query this database with psql**
- **DO NOT use for feature development**
- **Contains NO production data**

## What's in this directory?

- **config.toml**: Local Supabase configuration (ports, project settings)
- **migrations/**: SQL migration files that apply to BOTH local and production
- **functions/**: Edge Functions (deployed to production via Supabase MCP tools)

## How to use

### ✅ Correct: Testing migrations locally
```bash
supabase db reset  # Test migrations in local database
npm run test:forms:local  # Run E2E tests against local instance
```

### ❌ Incorrect: Querying data
```bash
# DON'T DO THIS - queries local test database with no data
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "SELECT * FROM solutions;"

# DO THIS - queries production database
# Use Supabase MCP tool: mcp__supabase__execute_sql
```

## When to use this directory

1. **Testing migrations**: Before deploying to production
2. **Running E2E tests**: Test forms/features in isolated environment
3. **Validating RLS policies**: Test security rules locally

## When NOT to use this directory

1. ❌ Exploring production data
2. ❌ Debugging feature issues
3. ❌ Checking user submissions
4. ❌ Analyzing solution effectiveness

**For all of the above, use Supabase MCP tools to query production database.**
