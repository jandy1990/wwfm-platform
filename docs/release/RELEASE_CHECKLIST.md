# WWFM Release Checklist

_Last updated: 2025-10-05_

## 1. Pre-Release Verification
- [ ] Run `npm run test:forms:local` (Chromium + disposable Supabase) and record run ID.
- [ ] Manually execute persona walkthroughs (see `docs/testing/FORM_FIX_PROGRESS.md`) – attach screenshots or notes.
- [ ] Confirm `FORM_FIX_PROGRESS.md` and `TESTING_SUMMARY.md` updated with latest results.
- [ ] Verify crisis resources manual run until automation flake resolved.

## 2. Security & Config
- [ ] Verify RLS roles remain `{authenticated}` for mailbox/schedule mutations (re-run policy snapshot).
- [ ] Scrub server action console logs or guard with `if (process.env.NODE_ENV !== 'production')`.
- [ ] Confirm Vercel → Logflare drain active:
  - Production Source ID / dashboard URL: `TBD`
  - Staging Source ID / dashboard URL: `TBD`
- [ ] Ensure Logflare saved searches + alerts configured:
  - Aggregation queue failures alert URL: `TBD`
  - `submitSolution` error alert URL: `TBD`
  - `retrospectives/check-retrospectives` failure alert URL: `TBD`
- [ ] Ensure aggregation queue processor metrics/alerts configured (e.g., Supabase logs dashboard or external monitor).

## 3. Documentation & Communications
- [ ] Confirm `docs/audit/WWFM_AUDIT_LOG.md` reflects final status for all phases.
- [ ] Publish release notes summarizing major audit findings & mitigations.
- [ ] Update support playbook with manual QA outcomes.

## 4. Rollback Plan
- [ ] Snapshot database before deploy (Supabase backup / `pg_dump`).
- [ ] Validate latest migrations have down scripts or manual rollback steps documented.
- [ ] Keep `db_cluster-24-06-2025@06-59-13.backup` accessible; rehearse `pg_restore` command.
- [ ] Document how to revert deployment (Vercel previous build, clear edge cache).

## 5. Deployment
- [ ] Deploy to staging, repeat smoke tests.
- [ ] Deploy to production once staging verified.
- [ ] Monitor logs/metrics for aggregation queue and retrospectives for 24 hours.
