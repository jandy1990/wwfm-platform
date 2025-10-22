# Supabase RLS Policy Snapshot – Retrospective Tables (2025-10-04)

Captured policies for the retrospective reminder system tables.

## Policies

| policyname                     | tablename               | cmd    | permissive | roles    | qual                   | with_check |
| ------------------------------ | ----------------------- | ------ | ---------- | -------- | ---------------------- | ---------- |
| Users can update own mailbox   | mailbox_items           | UPDATE | PERMISSIVE | {authenticated} | (auth.uid() = user_id) | null       |
| Users can view own mailbox     | mailbox_items           | SELECT | PERMISSIVE | {authenticated} | (auth.uid() = user_id) | null       |
| Users can update own schedules | retrospective_schedules | UPDATE | PERMISSIVE | {authenticated} | (auth.uid() = user_id) | null       |
| Users can view own schedules   | retrospective_schedules | SELECT | PERMISSIVE | {authenticated} | (auth.uid() = user_id) | null       |

## Notes
- Policies now scoped to `{authenticated}`; `auth.uid() = user_id` still enforces ownership.
- Edge function `supabase/functions/check-retrospectives/index.ts` executes with the service role, bypassing RLS when inserting reminders or mailbox items.
