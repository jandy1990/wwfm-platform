# Test Security Guidelines

## Service Role Key Management

### ⚠️ CRITICAL SECURITY INFORMATION

The test setup uses a Supabase service role key that bypasses ALL Row Level Security (RLS) policies. This key has FULL DATABASE ACCESS and must be handled with extreme care.

### Security Rules

1. **NEVER commit the service key to git**
   - Already in .gitignore (multiple patterns for safety)
   - If accidentally committed, rotate the key immediately in Supabase dashboard

2. **Only use service key for test setup/teardown**
   - NEVER use in application code
   - NEVER use in client-side code
   - NEVER expose in logs or error messages

3. **Environment variable location**
   - Store in `.env.local` (gitignored)
   - For CI/CD, use GitHub Secrets or equivalent secure storage
   - Never hardcode in scripts

### Current Implementation

```javascript
// tests/setup/complete-test-setup.js

// Admin client - ONLY for test fixture management
const supabaseAdmin = createClient(url, serviceKey);

// Regular client - for all test operations
const supabase = createClient(url, anonKey);
```

### Why We Need This

Pre-launch testing requires:
- Creating test fixtures owned by different users
- Cleaning up all test data regardless of owner
- Bypassing RLS policies that would block test setup

### Security Checklist

- [x] Service key in .env.local only
- [x] .env.local in .gitignore
- [x] Additional .gitignore patterns for safety
- [x] Service key only used in test setup script
- [x] Clear comments warning about security
- [x] Admin client only for setup/teardown
- [ ] Rotate key periodically (set reminder)
- [ ] Add to CI/CD secrets when needed

### If Key Is Compromised

1. Immediately rotate in Supabase dashboard
2. Update .env.local with new key
3. Check git history for any accidental commits
4. Audit database for any unauthorized changes
5. Update CI/CD secrets if applicable

### For Production

When moving to production:
1. Use different Supabase project for production
2. Never use service key in production code
3. Implement proper user authentication for all operations
4. Keep test and production environments completely separate