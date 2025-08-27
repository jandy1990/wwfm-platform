# Setting Up GitHub Secrets for E2E Tests

## Required Secrets

To run E2E tests in GitHub Actions, you need to configure these repository secrets:

### 1. `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://wqxkhxdbxdtpuvuvgirx.supabase.co`
- **Description**: Your Supabase project URL
- **Security**: Public, safe to expose

### 2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGtoeGRieGR0cHV2dXZnaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjgzMTUsImV4cCI6MjA2MzEwNDMxNX0.eBP6_TUB4Qa9KwPvEnUxrp7e7AGtOA3_Zs3CxaObPTo`
- **Description**: Public anonymous key for Supabase
- **Security**: Public, safe to expose

### 3. `SUPABASE_SERVICE_KEY`
- **Value**: `[YOUR SERVICE ROLE KEY - DO NOT SHARE]`
- **Description**: Service role key that bypasses RLS for testing
- **Security**: SECRET - Never commit or expose this
- **Note**: Get this from Supabase Dashboard → Settings → API → Service role key

### 4. `TEST_GOAL_ID`
- **Value**: `91d4a950-bb87-4570-b32d-cf4f4a4bb20d`
- **Description**: UUID of the dedicated test goal
- **Security**: Safe to expose

## How to Add Secrets

1. Go to your GitHub repository
2. Click on **Settings** (you need admin access)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. For each secret:
   - Enter the secret name exactly as shown above
   - Paste the value
   - Click **Add secret**

## Verifying Secrets

After adding all secrets:

1. Go to the **Actions** tab
2. Find the "Form E2E Tests" workflow
3. Click **Run workflow**
4. Select your branch and run
5. Check if tests pass

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Rotate service keys** periodically
3. **Limit access** to repository settings
4. **Use environment-specific keys** (don't use production keys for testing)
5. **Monitor usage** in Supabase dashboard

## Troubleshooting

### Tests fail with "Missing required environment variables"
- Verify all 4 secrets are added
- Check secret names match exactly (case-sensitive)
- Ensure no extra spaces in values

### Tests fail with authentication errors
- Verify `SUPABASE_SERVICE_KEY` is the service role key, not anon key
- Check the key hasn't been rotated in Supabase
- Ensure the test goal exists in database

### Tests can't find test goal
- Verify `TEST_GOAL_ID` matches the UUID in your database
- Check the goal is marked as `is_approved = true`
- Ensure the goal hasn't been deleted

## Local Development

For local testing, these same values should be in `.env.test.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wqxkhxdbxdtpuvuvgirx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
TEST_GOAL_ID=91d4a950-bb87-4570-b32d-cf4f4a4bb20d
```

Remember: `.env.test.local` is gitignored and should never be committed!