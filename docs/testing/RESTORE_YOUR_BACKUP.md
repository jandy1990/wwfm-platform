# Restore Database from Dashboard Backup

Your backup: `docs/archive/db_cluster-24-06-2025@06-59-13.backup`

## Quick Restore

```bash
# Extract and restore (ignore schema errors - they're safe)
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  < <(sed -n '152,$p' docs/archive/db_cluster-24-06-2025@06-59-13.backup)

# Verify
npm run test:db:verify
```

Expected errors (safe to ignore):
- "schema already exists"
- "permission denied for schema auth"
- "role already exists"

## Result

✅ 13 arenas, 88 categories, 227 goals, 3,120 solutions, 23 test fixtures
