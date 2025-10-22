# Supabase RLS Policy Snapshot – 2025-10-04

This document captures the current Row Level Security configuration for the core WWFM data tables that power solution aggregation and user contributions. Source data was collected on **2025-10-04** using the queries below.

## 1. RLS Status Per Table

```sql
SELECT
  c.relname            AS table_name,
  c.relrowsecurity     AS rls_enabled,
  c.relforcerowsecurity AS force_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = ANY (ARRAY['goal_implementation_links','ratings','aggregation_queue'])
ORDER BY c.relname;
```

| table_name              | rls_enabled | force_rls |
|-------------------------|-------------|-----------|
| aggregation_queue       | false       | false     |
| goal_implementation_links | true     | false     |
| ratings                 | true        | false     |

## 2. Policy Definitions

```sql
SELECT
  policyname,
  tablename,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = ANY (ARRAY['goal_implementation_links','ratings','aggregation_queue'])
ORDER BY tablename, policyname;
```

| policyname                                       | tablename                 | cmd    | permissive | roles         | qual                                      | with_check                                     |
|--------------------------------------------------|---------------------------|--------|------------|---------------|-------------------------------------------|------------------------------------------------|
| Anyone can view goal-implementation links        | goal_implementation_links | SELECT | PERMISSIVE | {public}      | true                                      | _(none)_                                        |
| Authenticated users can create goal-implementation links | goal_implementation_links | INSERT | PERMISSIVE | {authenticated} | _(none)_                                 | true                                           |
| Authenticated users can update goal-implementation links | goal_implementation_links | UPDATE | PERMISSIVE | {authenticated} | true                                     | true                                           |
| Public read access to ratings                    | ratings                   | SELECT | PERMISSIVE | {public}      | true                                      | _(none)_                                        |
| Users create own ratings                         | ratings                   | INSERT | PERMISSIVE | {authenticated} | _(none)_                                 | (user_id = ( SELECT auth.uid() AS uid))         |
| Users delete own ratings                         | ratings                   | DELETE | PERMISSIVE | {authenticated} | (( SELECT auth.uid() AS uid) = user_id)   | _(none)_                                        |
| Users update own ratings                         | ratings                   | UPDATE | PERMISSIVE | {authenticated} | (( SELECT auth.uid() AS uid) = user_id)   | _(none)_                                        |

## Notes & Follow-Ups

- `aggregation_queue` currently has RLS disabled. Background processors rely on the anon key, so this is acceptable today; enable RLS only after migrating processors to use the service role or adding explicit policies.
- `goal_implementation_links` allows public reads while restricting writes to authenticated users. Both INSERT and UPDATE flows rely on `with_check = true`, so client-side payloads must satisfy all column constraints.
- `ratings` permits public read access and enforces per-user mutations via `auth.uid()`. The UPDATE/DELETE policies are assigned to `roles = {public}`; consider narrowing these to `{authenticated}` before launch to reduce surface area.
- Re-run these queries after any Supabase changes and add new snapshots to this directory so audit history remains complete.

## Recommended Adjustments

To narrow mutation access on `ratings` to authenticated users only, run:

```sql
ALTER POLICY "Users delete own ratings"
  ON ratings
  TO authenticated;

ALTER POLICY "Users update own ratings"
  ON ratings
  TO authenticated;
```

Re-run the snapshot queries afterwards to confirm the role assignments reflect the change.
