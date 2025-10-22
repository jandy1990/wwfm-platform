# Archived Test Setup Scripts

These legacy helpers predate the consolidated `tests/setup/complete-test-setup.js` runner. They are retained only for historical reference and should **not** be executed or updated:

- `create-all-test-fixtures.sql` and friends create fixture rows with outdated variant labels (e.g. `1000IU softgel`, `10ml bottle`).
- Cleanup scripts assume old goal IDs and manual Supabase console workflows.

Use the modern workflow instead:

```bash
npm run test:db:start
npm run test:db:seed
npm run test:forms:local
```

The seed step delegates to `complete-test-setup.js`, which handles both fixture creation and cleanup using the service-role client. If additional fixtures are required, extend that script rather than reviving the archived files.
