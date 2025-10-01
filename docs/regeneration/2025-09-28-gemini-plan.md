# 2025-09-28 Gemini Regeneration Plan (1000-call budget)

## Snapshot
- Objective: refresh degraded distribution data for existing goal ⇄ solution links using V3 tooling without altering link structure.
- Budget: Gemini 2.5 Flash-Lite daily cap 1000 calls (`.gemini-usage.json` shows 4 used → 996 remaining). Plan spends ~925, reserving ~70 for retries and QA.
- Core scripts: `scripts/generate-validated-fields-v3.ts`, `scripts/validate-field-quality.ts`, `scripts/clear-goal-fields.ts` (only if rollback needed).
- Safeguards: keep `--field-filter` scoped to targeted fields, respect 4s delay (`--api-delay=4000`), never overwrite existing high-quality data, and run goal-by-goal to preserve context.
- Data sources: `CATEGORY_FIELD_CONFIG` (lib/config/solution-fields.ts), dropdown map (`scripts/field-generation-utils/dropdown-options.ts`), audit counts (`comprehensive-field-audit.json`).

## Pre-flight Checklist
- [ ] Confirm Supabase credentials loaded (`.env.local`), and run `npm install` if dependencies changed.
- [ ] Inspect `.gemini-usage.json`; if `requestCount` > 4, adjust remaining budget accordingly.
- [ ] Verify no outstanding manual edits in target goals that need preservation.
- [ ] Warm up with `npm run quality:validate -- --goal-id=<id> --field-filter=<field> --dry-run` on one goal per block to confirm detector flags the right fields.
- [ ] Create a fresh log entry (see QA section) to capture timestamps, call counts, and validation notes.

## Call Allocation Strategy
| Field | Category scope | Solutions needing regen | Target calls today | Notes |
|-------|----------------|-------------------------|--------------------|-------|
| `session_length` | therapists_counselors, coaches_mentors, alternative_practitioners | 265 | 265 | Display-blocking field; run with `--field-filter=session_length`. |
| `group_size` | groups_communities | 152 | 150 | Key community signal; `--field-filter=group_size`. |
| `practice_length` | meditation_mindfulness | 160 | 160 | All missing; `--field-filter=practice_length`. |
| `learning_difficulty` | books_courses | 833 | 350 | Focus on top coverage goals; `--field-filter=learning_difficulty`. |
| Buffer | — | — | ~70 | Hold back for retries, validation reruns, or emergent issues. |

Total planned usage ≈ 925 calls (plus buffer). Keep the state file (`--state-file .cache/generate-validated-fields/<block>.json`) per block so runs are resumable without double-counting.

## Prioritized Goal Coverage
Use the helper snippet below to refresh goal counts before each block:
```
CATEGORY=books_courses node --input-type=module scripts/field-generation-utils/list-goals-by-category.mjs
CATEGORIES=therapists_counselors,coaches_mentors,alternative_practitioners node --input-type=module scripts/field-generation-utils/list-goals-by-category.mjs
```
*(See Execution Runbook for creating the helper script if it is missing.)*

### `session_length` (265 total)
Top goals covering 140 solutions (53% of total):
| Goal | Solutions |
|------|-----------|
| Improve emotional regulation (`f5dd1ba0-7141-4e74-a036-42ea76c01f3a`) | 9 |
| Calm my anxiety (`56e2801e-0d78-4abd-a795-869e5b780ae7`) | 7 |
| Channel anger productively (`b54f0730-006a-4c77-90c0-9625d98effba`) | 6 |
| Express emotions healthily (`789c75b4-daf7-4a80-96c2-8dc2c0875fbc`) | 6 |
| Build emotional intelligence (`2244e53d-d88b-4e9f-98e7-3bbb3ca6dfc1`) | 5 |
| Get over dating anxiety (`c826834a-bf7e-45d4-9888-7526b8d6cba2`) | 5 |
| Improve posture (`8050920c-de2f-41bc-be0b-0a411fbfa502`) | 4 |
| Develop morning routine (`d6f8f5df-c34b-4239-b978-18d702f5936a`) | 4 |
| Share opinions confidently (`fe5c92b9-574a-4f73-940b-f312be38c181`) | 4 |
| Quit marijuana dependency (`b41d3f03-a5f4-4a91-8a59-951fa97f82a8`) | 4 |
| Cope with PTSD (`dd761c23-9b37-4f60-b9bc-7f1a27eb9cdb`) | 4 |
| Quit smoking (`74ba0f3b-8dd8-445b-9a3b-f74271daf504`) | 4 |
| Overcome eating disorders (`b640da48-e674-4e7d-a335-8ea29b7cb22d`) | 4 |
| Follow through on commitments (`99981e39-0c39-4806-867d-62d36b2230ec`) | 4 |
| Start over at 40+ (`e416cef3-ff8a-4bc1-a467-8cab2855344e`) | 3 |
Target these first; remaining long tail (~125 solutions) can be batched after verifying quota.

### `group_size` (152 total)
Top coverage (72 solutions):
| Goal | Solutions |
|------|-----------|
| Give back effectively (`6436959e-8859-46e8-af4a-139484b6f966`) | 8 |
| Volunteer meaningfully (`749d9acb-b15a-4d27-993e-a9ac5fc71319`) | 6 |
| Build mutual aid network (`2b5d7aca-f22a-4c4e-a17f-52f0436daf02`) | 5 |
| Learn to code (`82d7b9f1-fda0-435d-b982-d1975c75dbbf`) | 4 |
| Start grassroots movement (`ce72cfad-9062-4e86-acad-d9a0bec51acc`) | 4 |
| Network effectively (`d652351e-6a68-4940-b79b-8e62d9f86588`) | 4 |
| Start support groups (`41c58331-a79f-406b-a049-1abd1f8c4d6f`) | 4 |
| Help those in need (`1f467a6d-a3be-48dd-a763-049166d9a15f`) | 4 |
| Support refugees and immigrants (`a0473f4c-8367-45e3-9d43-ef99858a95b7`) | 4 |
| Follow through on commitments (`99981e39-0c39-4806-867d-62d36b2230ec`) | 3 |

### `practice_length` (160 total)
Top coverage (79 solutions):
| Goal | Solutions |
|------|-----------|
| Improve emotional regulation (`f5dd1ba0-7141-4e74-a036-42ea76c01f3a`) | 14 |
| Practice self-compassion (`7b0d1a0a-f65a-41d9-b1cd-afedf41d52b9`) | 12 |
| Develop morning routine (`d6f8f5df-c34b-4239-b978-18d702f5936a`) | 11 |
| Practice mindfulness (`e6ddd417-0e78-4f20-a043-08a7de10c801`) | 10 |
| Calm my anxiety (`56e2801e-0d78-4abd-a795-869e5b780ae7`) | 8 |
| Channel anger productively (`b54f0730-006a-4c77-90c0-9625d98effba`) | 8 |
| Practice meditation (`39790d9d-9cb3-4fda-8851-9105ad8ac7cf`) | 7 |
| Cope with PTSD (`dd761c23-9b37-4f60-b9bc-7f1a27eb9cdb`) | 4 |
| Maintain deep focus (`f36c91a3-bb0f-4cd4-906c-337e3d8a5f3c`) | 3 |
| Start yoga practice (`0bfa9bd6-794a-4663-9262-9f2aa640f34e`) | 3 |

### `learning_difficulty` (833 total)
Top 25 goals cover 284 solutions; tackling the first 35 goals hits 351 solutions (today’s target). First 20 shown below:
| Goal | Solutions |
|------|-----------|
| Improve emotional regulation (`f5dd1ba0-7141-4e74-a036-42ea76c01f3a`) | 33 |
| Channel anger productively (`b54f0730-006a-4c77-90c0-9625d98effba`) | 26 |
| Develop morning routine (`d6f8f5df-c34b-4239-b978-18d702f5936a`) | 21 |
| Calm my anxiety (`56e2801e-0d78-4abd-a795-869e5b780ae7`) | 16 |
| Understand cryptocurrency (`28ee14b7-fab1-46d3-82c5-54b1004e2fe7`) | 12 |
| Learn new skills (`9c5ecdf7-b473-489b-9c98-866a03417710`) | 12 |
| Update outdated skills (`16bbe856-4eae-45f7-ae3f-2bec6185d351`) | 11 |
| Understand personal finance basics (`02cdeb6e-d240-4189-9637-f020d0827287`) | 10 |
| Create good habits (`e9569309-a911-4045-a416-a74827827c7c`) | 10 |
| Change careers successfully (`4474e00e-d59a-42c9-ac5c-7bda99d6578a`) | 10 |
| Learn to draw (`e4b12be3-9570-46d1-8b0b-dbc3f2a48fe6`) | 9 |
| Stand out from applicants (`6be41ee3-9d04-4aad-a43d-6672c90964ad`) | 9 |
| Heal from heartbreak (`965430b3-6caf-489a-8be3-fc7930951198`) | 9 |
| Set social boundaries (`64dedad8-83f2-41f4-af75-8af1f0a24e73`) | 9 |
| Manage frustration without outbursts (`d6ac7810-8b70-4c72-b23d-b33da6eb3fb5`) | 9 |
| Start over at 40+ (`e416cef3-ff8a-4bc1-a467-8cab2855344e`) | 9 |
| Stop emotional eating (`e6de646e-9a2d-4935-a785-df4dc098684d`) | 8 |
| Develop growth mindset (`4aedae73-e27d-4ed0-b261-1e725c494abb`) | 8 |
| Coach youth sports (`5f0d4198-761d-4617-a3d7-e65a833d7e4b`) | 8 |
| Learn to paint (`1f5a3dba-9aad-4c0a-932b-7657a3842b40`) | 8 |
Continue through goal #35 (`Learn to use AI tools`) to reach the 350-call target.

## Execution Runbook
1. **Helper script (one-time if missing)**: create `scripts/field-generation-utils/list-goals-by-category.mjs` with the snippet below so future runs can call `CATEGORY=... node --input-type=module scripts/field-generation-utils/list-goals-by-category.mjs` without copy/paste.
   ```js
   import { createClient } from '@supabase/supabase-js'
   import dotenv from 'dotenv'

   dotenv.config({ path: '.env.local' })

   const categories = (process.env.CATEGORY ?? process.env.CATEGORIES ?? '').split(',').filter(Boolean)
   if (!categories.length) {
     console.error('Set CATEGORY=<single> or CATEGORIES=a,b,c before running')
     process.exit(1)
   }

   const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

   async function main() {
     const counts = new Map()
     const pageSize = 1000
     for (let from = 0; ; from += pageSize) {
       const { data, error } = await client
         .from('goal_implementation_links')
         .select('goal_id, goal:goals!inner(title), solution_variants!inner(solutions!inner(solution_category))')
         .eq('data_display_mode', 'ai')
         .in('solution_variants.solutions.solution_category', categories)
         .range(from, from + pageSize - 1)

       if (error) {
         console.error(error)
         process.exit(1)
       }
       if (!data?.length) break

       for (const row of data) {
         const key = `${row.goal_id}|${row.goal.title}`
         counts.set(key, (counts.get(key) || 0) + 1)
       }

       if (data.length < pageSize) break
     }

     const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
     let cumulative = 0
     sorted.forEach(([key, count], index) => {
       const [goalId, title] = key.split('|')
       cumulative += count
       console.log(`${(index + 1).toString().padStart(2, '0')} ${count.toString().padStart(3, ' ')} - ${title} - ${goalId} - cumulative ${cumulative}`)
     })

     const total = sorted.reduce((sum, [, count]) => sum + count, 0)
     console.log(`Total goals ${sorted.length}`)
     console.log(`Total solutions ${total}`)
   }

   main()
   ```
2. **Block A – `session_length` (≈265 calls)**
   - Generate prioritized goal list (helper script with aggregated categories).
   - For each goal (start with table above), run:
     - `npm run quality:validate -- --goal-id=<id> --field-filter=session_length --category-filter=therapists_counselors,coaches_mentors,alternative_practitioners --show-good-quality`
     - `npx tsx scripts/generate-validated-fields-v3.ts --goal-id=<id> --field-filter=session_length --api-delay=4000 --state-file .cache/generate-v3/session-length-<id>.json`
   - Log successes, issues, and cumulative `stats.apiCalls` (script output) plus `.gemini-usage` delta.
3. **Block B – `group_size` (≈150 calls)**
   - Repeat validation/generation with `--field-filter=group_size`.
   - Expect small per-goal batches; adjust order by highest counts to minimize goal switches.
4. **Block C – `practice_length` (≈160 calls)**
   - Use same process with `--field-filter=practice_length`.
   - Monitor derived cost fields: the script will auto-derive `cost`/`cost_type`; confirm via validation spot-checks.
5. **Block D – `learning_difficulty` (≈350 calls)**
   - Work through top 35 goals; run validation and generation with `--field-filter=learning_difficulty`.
   - After each ~75 calls, re-open `.gemini-usage.json` to ensure the remaining budget is adequate.
6. **Buffer & Retries**
   - Keep ~70 calls reserved for: rerunning any failed goals, opportunistic fixes (e.g., `session_frequency` anomalies discovered during validation), and final QA adjustments.

## QA & Logging
- Maintain a running log in `docs/regeneration/2025-09-28-gemini-plan.md` (append under a new “Progress Log” heading) noting timestamp, goal id, field, calls spent, validation summary.
- After each block, spot-check with:
  - `npm run quality:validate -- --goal-id=<id> --field-filter=<field>` to ensure no remaining issues.
  - Supabase console query: inspect `goal_implementation_links` for updated `aggregated_fields.<field>` entries.
  - Frontend check: load the corresponding goal page to ensure no `[Object object]` regressions.
- If validation flags persistent issues, pause before consuming buffer calls; investigate prompt inputs, dropdown alignment, or potential manual cleanup.

## Next Steps / Backlog Beyond Today
- Remaining high-volume gaps after today: `startup_cost` / `ongoing_cost` (4444 solutions), `session_frequency` (200), `side_effects` (637). Plan separate focused days with similar quota planning.
- Once high-priority fields are healthy, schedule a pass to fix mechanistic source labels (`scripts/safe/fix-source-labels-only.ts`).
- Keep daily plan docs up to date so future assistants can resume from recorded progress without re-discovering priorities.

## Progress Log
- 2025-09-28 17:02 UTC — Added helper script `scripts/field-generation-utils/list-goals-by-category.mjs` for reusable goal counts.
- 2025-09-28 17:08 UTC — Baseline validation before regeneration:
  - `session_length` on `Improve emotional regulation` (9 solutions) flagged 9/9 missing (`therapists_counselors`, `coaches_mentors`, `alternative_practitioners`).
  - `group_size` on `Give back effectively` (8 solutions) flagged 8/8 missing (`groups_communities`).
  - `practice_length` on `Improve emotional regulation` (14 solutions) flagged 14/14 missing (`meditation_mindfulness`).
  - `learning_difficulty` on `Improve emotional regulation` (33 solutions) flagged 33/33 missing (`books_courses`).
- 2025-09-28 17:18 UTC — Block A kickoff:
  - Ran `generate-validated-fields-v3` for `session_length` on `Improve emotional regulation` (goal `f5dd1ba0-7141-4e74-a036-42ea76c01f3a`), updating 9 solutions across `therapists_counselors`, `coaches_mentors`, `alternative_practitioners` with 9 Gemini calls (55s runtime).
  - Post-run validation confirmed 0% error rate (`session_length`) for the goal; all regenerated fields passing dropdown + quality checks.
- 2025-09-28 17:26 UTC — Continued `session_length` block:
  - Validated baseline for `Channel anger productively` (goal `b54f0730-006a-4c77-90c0-9625d98effba`); 6/6 targeted solutions missing `session_length`.
  - Regenerated `session_length` for the goal (6 Gemini calls, 37s runtime) covering therapists + alternative practitioner solutions; follow-up validation now shows 0% error rate.
- 2025-09-28 17:34 UTC — Continued `session_length` block:
  - Baseline validation for `Express emotions healthily` (goal `789c75b4-daf7-4a80-96c2-8dc2c0875fbc`) confirmed 6/6 missing `session_length` across therapist/coach/alt practitioner solutions.
  - Regenerated with 6 Gemini calls (37s runtime); post-run validation now 0% error rate for all categories on that goal.
- 2025-09-28 17:40 UTC — Continued `session_length` block:
  - Baseline check for `Build emotional intelligence` (goal `2244e53d-d88b-4e9f-98e7-3bbb3ca6dfc1`) showed 5/5 missing `session_length` across therapist/coach/alt practitioner solutions.
  - Regenerated via V3 (5 Gemini calls, 30s runtime) and revalidated at 0% error.
- 2025-09-28 17:45 UTC — Spot-check mid-list:
  - `Calm my anxiety` (goal `56e2801e-0d78-4abd-a795-869e5b780ae7`) already had 5/5 valid `session_length` entries; marked as no-action to conserve calls.
- 2025-09-28 17:47 UTC — Continued `session_length` block:
  - Baseline for `Get over dating anxiety` (goal `c826834a-bf7e-45d4-9888-7526b8d6cba2`) showed 5/5 missing `session_length`.
  - Regenerated with 5 Gemini calls (30s runtime); validation now 0% error across therapist + alt practitioner solutions.
- 2025-09-28 17:52 UTC — Continued `session_length` block:
  - Baseline for `Improve posture` (goal `8050920c-de2f-41bc-be0b-0a411fbfa502`) showed 4/4 missing `session_length` (therapist + alternative practitioners).
  - Regenerated with 4 Gemini calls (26s runtime); now 0% error on revalidation.
- 2025-09-28 17:57 UTC — Continued `session_length` block:
  - Baseline for `Develop morning routine` (goal `d6f8f5df-c34b-4239-b978-18d702f5936a`) showed 4/4 missing `session_length` across therapists/coaches/alt practitioners.
  - Regenerated with 4 Gemini calls (23s runtime); validation now 0% error.
- 2025-09-28 18:01 UTC — Continued `session_length` block:
  - Baseline for `Share opinions confidently` (goal `fe5c92b9-574a-4f73-940b-f312be38c181`) showed 4/4 missing `session_length` across therapist + coach solutions.
  - Regenerated with 4 Gemini calls (24s runtime); post-run validation now 0% error.
- 2025-09-28 18:06 UTC — Continued `session_length` block:
  - Baseline for `Quit marijuana dependency` (goal `b41d3f03-a5f4-4a91-8a59-951fa97f82a8`) showed 4/4 missing `session_length` (therapist/coach/alt practitioner mix).
  - Regenerated with 4 Gemini calls (26s runtime); validation now 0% error.
- 2025-09-28 18:10 UTC — Continued `session_length` block:
  - Baseline for `Cope with PTSD` (goal `dd761c23-9b37-4f60-b9bc-7f1a27eb9cdb`) showed 4/4 missing `session_length`.
  - Regenerated with 4 Gemini calls (24s runtime); validation now 0% error.
- 2025-09-28 18:15 UTC — Continued `session_length` block:
  - Baseline for `Quit smoking` (goal `74ba0f3b-8dd8-445b-9a3b-f74271daf504`) showed 4/4 missing `session_length` across therapist/coach/alt practitioner.
  - Regenerated with 4 Gemini calls (24s runtime); validation now 0% error.
- 2025-09-28 18:19 UTC — Continued `session_length` block:
  - Baseline for `Overcome eating disorders` (goal `b640da48-e674-4e7d-a335-8ea29b7cb22d`) showed 4/4 missing `session_length` (therapists).
  - Regenerated with 4 Gemini calls (23s runtime); validation now 0% error.
- 2025-09-28 18:23 UTC — Continued `session_length` block:
  - Baseline for `Follow through on commitments` (goal `99981e39-0c39-4806-867d-62d36b2230ec`) showed 4/4 missing `session_length` (therapists + coaches).
  - Regenerated with 4 Gemini calls (22s runtime); validation now 0% error.
- 2025-09-28 18:26 UTC — Continued `session_length` block:
  - Baseline for `Start over at 40+` (goal `e416cef3-ff8a-4bc1-a467-8cab2855344e`) showed 3/3 missing `session_length` (therapists + coaches).
  - Regenerated with 3 Gemini calls (19s runtime); validation now 0% error.
- 2025-09-28 18:29 UTC — Continued `session_length` block:
  - Baseline for `Land dream job` (goal `a660050e-780c-44c8-be6a-1cfdfeaaf82d`) showed 3/3 missing `session_length` (coaches only).
  - Regenerated with 3 Gemini calls (18s runtime); validation now 0% error.
- 2025-09-28 18:32 UTC — Continued `session_length` block:
  - Baseline for `Look put together` (goal `bf74d2f1-3c7e-43b4-bf93-748afec276e9`) showed 3/3 missing `session_length` (coach + therapist + alternative practitioner).
  - Regenerated with 3 Gemini calls (17s runtime); validation now 0% error.
- 2025-09-28 18:35 UTC — Continued `session_length` block:
  - Baseline for `Respond not react` (goal `d76a03d4-27fb-4d52-960f-2791898e42d6`) showed 3/3 missing `session_length` (therapists + alternative practitioner).
  - Regenerated with 3 Gemini calls (18s runtime); validation now 0% error.
- 2025-09-28 18:38 UTC — Continued `session_length` block:
  - Baseline for `Improve flexibility` (goal `cf920463-3968-4813-815f-613ad1c48926`) showed 3/3 missing `session_length` (alternative practitioners).
  - Regenerated with 3 Gemini calls (18s runtime); validation now 0% error.
- 2025-09-28 18:41 UTC — Continued `session_length` block:
  - Baseline for `Improve balance` (goal `43d81f73-c2b4-4c5d-9ee0-ea44e7d2c5ae`) showed 3/3 missing `session_length` (therapists + alternative practitioner).
  - Regenerated with 3 Gemini calls (18s runtime); validation now 0% error.
- 2025-09-28 18:44 UTC — Continued `session_length` block:
  - Baseline for `Break bad habits` (goal `68099253-5b89-48cf-a8dd-08f5118b9c19`) showed 3/3 missing `session_length` (therapists + coaches).
  - Regenerated with 3 Gemini calls (18s runtime); validation now 0% error.
- 2025-09-28 18:47 UTC — Continued `session_length` block:
  - Baseline for `Manage ADHD symptoms` (goal `bfdedb5e-b7d1-4dc8-b2ff-30cda27d6eb8`) showed 3/3 missing `session_length` (therapist + coach + alternative practitioner).
  - Regenerated with 3 Gemini calls (17s runtime); validation now 0% error.
- 2025-09-28 18:50 UTC — Continued `session_length` block:
  - Baseline for `Break porn addiction` (goal `f26f7bc7-4caf-4e30-8e2a-5046f1608b5a`) showed 3/3 missing `session_length` (therapists).
  - Regenerated with 3 Gemini calls (18s runtime); validation now 0% error.
- 2025-09-28 18:53 UTC — Continued `session_length` block:
  - Baseline for `Control OCD behaviors` (goal `c017b79a-30c7-4f72-90f2-4aff05eea0f9`) showed 3/3 missing `session_length` (therapists).
  - Regenerated with 3 Gemini calls (17s runtime); validation now 0% error.
- 2025-09-28 18:56 UTC — Continued `session_length` block:
  - Baseline for `Stop gambling` (goal `2c2be634-4586-4b4b-8da8-b1a2795eb3bc`) showed 3/3 missing `session_length` (therapists).
  - Regenerated with 3 Gemini calls (18s runtime); validation now 0% error.
- 2025-09-28 18:59 UTC — Continued `session_length` block:
  - Baseline for `Give back effectively` (goal `6436959e-8859-46e8-af4a-139484b6f966`) showed 3/3 missing `session_length` (coaches).
  - Regenerated with 3 Gemini calls (18s runtime); validation now 0% error.
- 2025-09-28 19:02 UTC — Continued `session_length` block:
  - Baseline for `Navigate autism challenges` (goal `e049b4c5-6d7c-4988-b205-b6f24d1362fd`) showed 3/3 missing `session_length` (therapists + alternative practitioner).
  - Regenerated with 3 Gemini calls (18s runtime); validation now 0% error.
- 2025-09-28 19:05 UTC — Continued `session_length` block:
  - Baseline for `Start side hustle` (goal `91f8cf27-c3f2-47af-ad88-c39ccaea72d4`) showed 3/3 missing `session_length` (coaches).
  - Regenerated with 3 Gemini calls (17s runtime); validation now 0% error.
- 2025-09-28 19:08 UTC — Continued `session_length` block:
  - Baseline for `Set social boundaries` (goal `64dedad8-83f2-41f4-af75-8af1f0a24e73`) showed 3/3 missing `session_length` (therapists + coach).
  - Regenerated with 3 Gemini calls (18s runtime); validation now 0% error.
- 2025-09-28 19:12 UTC — Continued `session_length` block:
  - Baseline for `Look fit in clothes` (goal `f053571e-8118-44a4-a5c2-c3cd49a08a69`) showed 3/3 missing `session_length` (therapist + coach + alternative practitioner).
  - Regenerated with 3 Gemini calls (19s runtime); validation now 0% error.
- 2025-09-28 19:15 UTC — Continued `session_length` block:
  - Baseline for `Fall asleep faster` (goal `4bc9eecd-0815-46a8-812f-5745ae369b3e`) showed 2/2 missing `session_length` (therapist + alternative practitioner).
  - Regenerated with 2 Gemini calls (12s runtime); validation now 0% error.
- 2025-09-28 19:17 UTC — Continued `session_length` block:
  - Baseline for `Manage chronic pain` (goal `dcb86734-1bbc-4ab0-8ffb-b82d75fdcd64`) showed 2/2 missing `session_length` (therapist + alternative practitioner).
  - Regenerated with 2 Gemini calls (13s runtime); validation now 0% error.
- 2025-09-28 19:20 UTC — Continued `session_length` block:
  - Baseline for `Quit vaping` (goal `cf73ce7b-8e8f-40aa-908c-6900209878a0`) showed 2/2 missing `session_length` (therapist + alternative practitioner).
  - Regenerated with 2 Gemini calls (14s runtime); validation now 0% error.
- 2025-09-28 19:23 UTC — Continued `session_length` block:
  - Baseline for `Manage frustration without outbursts` (goal `d6ac7810-8b70-4c72-b23d-b33da6eb3fb5`) showed 2/2 missing `session_length` (therapist + alternative practitioner).
  - Regenerated with 2 Gemini calls (12s runtime); validation now 0% error.
- 2025-09-28 19:26 UTC — Continued `session_length` block:
  - Baseline for `Keep conversations going` (goal `b279c24b-2032-425d-989e-105bd59240e1`) showed 2/2 missing `session_length` (therapists).
  - Regenerated with 2 Gemini calls (13s runtime); validation now 0% error.
- 2025-09-28 19:29 UTC — Continued `session_length` block:
  - Baseline for `Return after maternity/leave` (goal `6ea319a6-88a1-4e98-8cf2-9c04ef260ed7`) showed 2/2 missing `session_length` (therapist + coach).
  - Regenerated with 2 Gemini calls (13s runtime); validation now 0% error.
- 2025-09-28 19:32 UTC — Continued `session_length` block:
  - Baseline for `Stay indispensable` (goal `091e4035-81cf-4bbf-bd75-ebbeff6cab47`) showed 2/2 missing `session_length` (therapist + coach).
  - Regenerated with 2 Gemini calls (14s runtime); validation now 0% error.
- 2025-09-28 19:35 UTC — Continued `session_length` block:
  - Baseline for `Heal from heartbreak` (goal `965430b3-6caf-489a-8be3-fc7930951198`) showed 2/2 missing `session_length` (therapist + alternative practitioner).
  - Regenerated with 2 Gemini calls (12s runtime); validation now 0% error.
- 2025-09-28 19:38 UTC — Continued `session_length` block:
  - Baseline for `Lose weight sustainably` (goal `5c398aef-3019-4d41-a5cb-9dedaacda4ab`) showed 2/2 missing `session_length` (therapist + coach).
  - Regenerated with 1 additional Gemini call (retry after transient DB failure); validation now 0% error.
- 2025-09-28 19:41 UTC — Continued `session_length` block:
  - Baseline for `Create good habits` (goal `e9569309-a911-4045-a416-a74827827c7c`) showed 2/2 missing `session_length` (therapist + coach).
  - Regenerated with 2 Gemini calls (13s runtime); validation now 0% error.
- 2025-09-28 19:44 UTC — Continued `session_length` block:
  - Baseline for `Stop news addiction` (goal `580ab7cb-63ae-4234-9fe4-b7e0f0fe7d9c`) showed 2/2 missing `session_length` (therapist + alternative practitioner).
  - Regenerated with 2 Gemini calls (15s runtime); validation now 0% error.
- 2025-09-28 19:47 UTC — Continued `session_length` block:
  - Baseline for `Manage PCOS` (goal `ca9d28b4-ad04-4a0c-9cbd-5bdf9699968f`) showed 2/2 missing `session_length` (therapist + alternative practitioner).
  - Regenerated with 2 Gemini calls (12s runtime); validation now 0% error.
- 2025-09-28 19:50 UTC — Continued `session_length` block:
  - Baseline for `Manage autoimmune conditions` (goal `13a6540f-d793-4007-ba52-b964e35e89ee`) showed 2/2 missing `session_length` (therapist + alternative practitioner).
  - Regenerated with 2 Gemini calls (13s runtime); validation now 0% error.
- 2025-09-28 19:53 UTC — Continued `session_length` block:
  - Baseline for `Stay flexible as I age` (goal `eddd32ce-f951-4232-a80f-f1a80ec50f96`) showed 2/2 missing `session_length` (alternative practitioners only).
  - Regenerated with 2 Gemini calls (13s runtime); validation now 0% error.
- 2025-09-28 19:56 UTC — Continued `session_length` block:
  - Baseline for `Mentor young people` (goal `2dfb4085-c5f3-484f-868f-062abb371077`) showed 2/2 missing `session_length` (therapist + coach).
  - Regenerated with 2 Gemini calls (13s runtime); validation now 0% error.
- 2025-09-28 19:59 UTC — Continued `session_length` block:
  - Baseline for `Think more positively` (goal `45ececcb-85ed-4537-8206-4b5c541d050e`) showed 2/2 missing `session_length` (therapist + alternative practitioner).
  - Regenerated with 2 Gemini calls (14s runtime); validation now 0% error.
- 2025-09-28 20:02 UTC — Continued `session_length` block:
  - Baseline for `Change negative self-talk` (goal `7338e1ae-8bdf-4b9f-bdf5-eb5021aad086`) showed 2/2 missing `session_length` (therapist + coach).
  - Regenerated with 2 Gemini calls (14s runtime); validation now 0% error.
- 2025-09-28 20:05 UTC — Continued `session_length` block:
  - Baseline for `Plan for healthcare costs` (goal `888693d9-7498-410b-ac31-cea63ee12078`) showed 2/2 missing `session_length` (therapist + alternative practitioner).
  - Regenerated with 2 Gemini calls (14s runtime); validation now 0% error.
- 2025-09-28 20:08 UTC — Continued `session_length` block:
  - Baseline for `Build self-discipline` (goal `2177f4dc-41df-492d-8a7f-9c4827d689bd`) showed 2/2 missing `session_length` (therapists only).
  - Regenerated with 2 Gemini calls (13s runtime); validation now 0% error.
- 2025-09-28 20:02 UTC — Continued `session_length` block:
  - Baseline for `Change negative self-talk` (goal `7338e1ae-8bdf-4b9f-bdf5-eb5021aad086`) showed 2/2 missing `session_length` (therapist + coach).
  - Regenerated with 2 Gemini calls (14s runtime); validation now 0% error.

- 2025-09-30 23:33 UTC — Continued `session_length` block:
  - Baseline for `TEST - Automated Testing Goal` (goal `91d4a950-bb87-4570-b32d-cf4f4a4bb20d`) showed 3/3 missing `session_length` (therapists_counselors + alternative_practitioners).
  - Regenerated with 3 Gemini calls (18s runtime); revalidation now 0% error across targeted categories.

- 2025-09-30 23:34 UTC — Continued `session_length` block:
  - Baseline for `Have a flatter stomach` (goal `cea54b7e-3d17-47f4-964a-e8e4cd06d116`) showed 3/3 missing `session_length` (alternative_practitioners + coaches_mentors).
  - Regenerated with 3 Gemini calls (21s runtime); revalidation now 0% error for the targeted categories.

- 2025-09-30 23:35 UTC — Continued `session_length` block:
  - Baseline for `Develop growth mindset` (goal `4aedae73-e27d-4ed0-b261-1e725c494abb`) showed 2/2 missing `session_length` (therapists_counselors + coaches_mentors).
  - Regenerated with 2 Gemini calls (13s runtime); revalidation now 0% error for the targeted categories.

- 2025-09-30 23:35 UTC — Continued `session_length` block:
  - Baseline for `Stop junk food binges` (goal `f7c595e0-b4bf-42ee-b93e-31cf6222c5c2`) showed 2/2 missing `session_length` (therapists_counselors).
  - Regenerated with 2 Gemini calls (12s runtime); revalidation now 0% error for the targeted category.

- 2025-09-30 23:36 UTC — Continued `session_length` block:
  - Baseline for `Relax in social settings` (goal `104d626b-eba7-4452-96e3-9cdc872e643f`) showed 2/2 missing `session_length` (therapists_counselors + alternative_practitioners).
  - Regenerated with 2 Gemini calls (22s runtime); revalidation now 0% error for the targeted categories.

- 2025-09-30 23:37 UTC — Continued `session_length` block:
  - Baseline for `Stop abusing painkillers` (goal `9522f755-f58a-4b4b-bd24-c154166a8d05`) showed 2/2 missing `session_length` (therapists_counselors + alternative_practitioners).
  - Regenerated with 2 Gemini calls (27s runtime); revalidation now 0% error for the targeted categories.

- 2025-09-30 23:38 UTC — Continued `session_length` block:
  - Baseline for `Navigate menopause` (goal `552e81a6-7580-4956-a0cb-8893ce9e55b7`) showed 2/2 missing `session_length` (therapists_counselors + alternative_practitioners).
  - Regenerated with 2 Gemini calls (16s runtime); revalidation now 0% error for the targeted categories.

- 2025-09-30 23:39 UTC — Continued `session_length` block:
  - Baseline for `Stop self-harm` (goal `a5169243-f97b-4cc7-98ce-79c2a5ac9997`) showed 2/2 missing `session_length` (therapists_counselors).
  - Regenerated with 2 Gemini calls (14s runtime); revalidation now 0% error for the targeted category.

- 2025-09-30 23:40 UTC — Continued `session_length` block:
  - Baseline for `Prepare for job loss` (goal `0bceed44-3db4-4c7b-9ed4-3286ee4008b0`) showed 2/2 missing `session_length` (therapists_counselors + coaches_mentors).
  - Regenerated with 2 Gemini calls (23s runtime); revalidation now 0% error for the targeted categories.

- 2025-09-30 23:41 UTC — Continued `session_length` block:
  - Baseline for `Quiet racing mind` (goal `cfc96452-e4b1-47e2-a286-8d1d834b2af7`) showed 2/2 missing `session_length` (alternative_practitioners + therapists_counselors).
  - Regenerated with 2 Gemini calls (13s runtime); revalidation now 0% error for the targeted categories.

- 2025-09-30 23:41 UTC — Continued `session_length` block:
  - Baseline for `Stop emotional eating` (goal `e6de646e-9a2d-4935-a785-df4dc098684d`) showed 2/2 missing `session_length` (therapists_counselors + coaches_mentors).
  - Regenerated with 2 Gemini calls (14s runtime); revalidation now 0% error for the targeted categories.

- 2025-09-30 23:42 UTC — Continued `session_length` block:
  - Baseline for `Stop insomnia` (goal `0f89cae2-cc94-47ef-ab16-1ad45a79b746`) showed 2/2 missing `session_length` (therapists_counselors + alternative_practitioners).
  - Regenerated with 2 Gemini calls (13s runtime); revalidation now 0% error for the targeted categories.

- 2025-09-30 23:42 UTC — Continued `session_length` block:
  - Baseline for `Make guests comfortable` (goal `1187609c-fca9-4793-8ca5-3fc34ecfaf78`) showed 2/2 missing `session_length` (alternative_practitioners + therapists_counselors).
  - Regenerated with 2 Gemini calls (13s runtime); revalidation now 0% error for the targeted categories.

- 2025-09-30 23:43 UTC — Continued `session_length` block:
  - Baseline for `Stop migraines` (goal `823cb2dc-1b96-4f64-8de8-2ee71974ba08`) showed 2/2 missing `session_length` (therapists_counselors + alternative_practitioners).
  - Regenerated with 2 Gemini calls (13s runtime); revalidation now 0% error for the targeted categories.

- 2025-09-30 23:44 UTC — Continued `session_length` block:
  - Baseline for `Control my temper` (goal `91db190f-4fd5-4091-ab9d-3a88c73bb233`) showed 2/2 missing `session_length` (therapists_counselors).
  - Regenerated with 2 Gemini calls (12s runtime); revalidation now 0% error for the targeted category.

- 2025-09-30 23:45 UTC — Continued `session_length` block:
  - Baseline for `Manage business finances` (goal `d5f5b5c7-12d0-49ec-97be-5e97ce51a9ad`) showed 2/2 missing `session_length` (coaches_mentors).
  - Regenerated with 2 Gemini calls (18s runtime); revalidation now 0% error for the targeted category.

- 2025-09-30 23:46 UTC — Continued `session_length` block:
  - Baseline for `Build a coordinated wardrobe` (goal `0cea6523-b928-4855-91a5-5c3e41e87e4b`) showed 2/2 missing `session_length` (coaches_mentors).
  - Regenerated with 2 Gemini calls (16s runtime); revalidation now 0% error for the targeted category.

- 2025-09-30 23:48 UTC — Continued `session_length` block:
  - Baseline for `Build freelance career` (goal `ae0082f6-9e1f-47f4-be07-635a4775a10f`) showed 2/2 missing `session_length` (coaches_mentors).
  - Regenerated with 2 Gemini calls (12s runtime); revalidation now 0% error for the targeted category.

- 2025-09-30 23:49 UTC — Continued `session_length` block:
  - Baseline for `Change careers successfully` (goal `4474e00e-d59a-42c9-ac5c-7bda99d6578a`) showed 2/2 missing `session_length` (coaches_mentors).
  - Regenerated with 2 Gemini calls (12s runtime); revalidation now 0% error for the targeted category.

- 2025-09-30 23:50 UTC — Continued `session_length` block:
  - Baseline for `Manage fibromyalgia` (goal `8747b8d3-96ff-42cf-8b9f-70a3c27a90c7`) showed 2/2 missing `session_length` (therapists_counselors).
  - Regenerated with 2 Gemini calls (13s runtime); revalidation now 0% error for the targeted category.

- 2025-09-30 23:51 UTC — Continued `session_length` block:
  - Baseline for `Control inflammation` (goal `2633f500-9b34-449a-bb87-9dce0d203a31`) showed 2/2 missing `session_length` (alternative_practitioners).
  - Regenerated with 2 Gemini calls (12s runtime); revalidation now 0% error for the targeted category.

- 2025-09-30 23:51 UTC — Continued `session_length` block:
  - Baseline for `Date after divorce` (goal `f54b624a-33d1-4ad2-8de5-15b6d458e2bc`) showed 2/2 missing `session_length` (therapists_counselors + coaches_mentors).
  - Regenerated with 2 Gemini calls (12s runtime); revalidation now 0% error for the targeted categories.

- 2025-09-30 23:52 UTC — Continued `session_length` block:
  - Baseline for `Stop overspending` (goal `5a6203f4-f94f-4b2f-9e12-e980e908f0f7`) showed 2/2 missing `session_length` (therapists_counselors).
  - Regenerated with 2 Gemini calls (13s runtime); revalidation now 0% error for the targeted category.

- 2025-09-30 23:53 UTC — Continued `session_length` block:
  - Baseline for `Manage chronic fatigue` (goal `3a8eae50-6c90-4fce-b069-156862871cfe`) showed 2/2 missing `session_length` (therapists_counselors + alternative_practitioners).
  - Regenerated with 2 Gemini calls (13s runtime); revalidation now 0% error for the targeted categories.

- 2025-09-30 23:54 UTC — Continued `session_length` block:
  - Baseline for `Learn pottery` (goal `eebc1755-2d21-484c-ab4d-59eb86ac0143`) showed 2/2 missing `session_length` (coaches_mentors).
  - Regenerated with 2 Gemini calls (13s runtime); revalidation now 0% error for the targeted category.

- 2025-09-30 23:55 UTC — Continued `session_length` block:
  - Baseline for `Worry less` (goal `27f38396-bd04-4d86-9af8-5a7a8240c2ae`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (7s runtime); revalidation now 0% error for the targeted category.

- 2025-09-30 23:56 UTC — Continued `session_length` block:
  - Baseline for `Find causes I care about` (goal `cf23e088-e507-4160-a5bb-92152f445e78`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (7s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:07 UTC — Continued `session_length` block:
  - Baseline for `Sleep peacefully` (goal `d46ce9bb-3d80-4d94-b402-8d389e27781f`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (10s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:08 UTC — Continued `session_length` block:
  - Baseline for `Stop procrastinating` (goal `47a38ad8-447a-448e-868a-abedfcaa8743`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (9s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:09 UTC — Continued `session_length` block:
  - Baseline for `Calm my anxiety` (goal `56e2801e-0d78-4abd-a795-869e5b780ae7`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:11 UTC — Continued `session_length` block:
  - Baseline for `Stop yo-yo dieting` (goal `86794c43-865c-41aa-a51f-8ea77699aba1`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (11s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:12 UTC — Continued `session_length` block:
  - Baseline for `Handle job uncertainty` (goal `2f8b2a3e-ec14-4ac3-9fd4-faf9effe970a`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (9s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:13 UTC — Continued `session_length` block:
  - Baseline for `Develop perseverance` (goal `5ceb513d-b531-4e35-ad74-221cb6dff539`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (10s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:14 UTC — Continued `session_length` block:
  - Baseline for `Ace interviews` (goal `9efd2e89-095b-47af-8123-39138ee4ff31`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:15 UTC — Continued `session_length` block:
  - Baseline for `Handle social rejection` (goal `ed1f08b5-1e65-447c-a3af-e4f6e594a7ab`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:16 UTC — Continued `session_length` block:
  - Baseline for `Reduce joint pain` (goal `769a0120-666e-4713-a988-16ed49516158`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:17 UTC — Continued `session_length` block:
  - Baseline for `Manage seasonal depression` (goal `867d2275-157c-4b2c-8160-c8d3b8e641fe`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (14s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:18 UTC — Continued `session_length` block:
  - Baseline for `Prepare for baby` (goal `97b7334e-74c7-44ff-a8c0-fc9643fb3789`) showed 1/1 missing `session_length` (alternative_practitioners).
  - Regenerated with 1 Gemini call (7s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:19 UTC — Continued `session_length` block:
  - Baseline for `Control blood sugar` (goal `d7c3a613-c5fe-4aba-bc68-78b221f07f3d`) showed 1/1 missing `session_length` (alternative_practitioners).
  - Regenerated with 1 Gemini call (9s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:20 UTC — Continued `session_length` block:
  - Baseline for `Leave toxic situation` (goal `28a9df62-1511-4d0a-aebc-3b8d303f33d4`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (7s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:21 UTC — Continued `session_length` block:
  - Baseline for `Manage eczema/psoriasis` (goal `bbe1b334-f430-4722-b994-1916341d3e1a`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:22 UTC — Continued `session_length` block:
  - Baseline for `Stop emotional exhaustion` (goal `fd47e075-e2e3-4f83-8f05-096bfa7585d3`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:23 UTC — Continued `session_length` block:
  - Baseline for `Improve posture` (goal `c156fc35-fd76-4d7f-a253-59105975b58c`) showed 1/1 missing `session_length` (alternative_practitioners).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:50 UTC — Continued `session_length` block:
  - Baseline for `Overcome drug abuse` (goal `a409f987-6ab6-4e6f-b657-85b26901d562`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (16s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:52 UTC — Continued `session_length` block:
  - Baseline for `Prevent injuries` (goal `287d5b7e-4fc2-40c3-94f2-500d120bc522`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (16s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:54 UTC — Continued `session_length` block:
  - Baseline for `Lift heavier weights` (goal `1be300b4-6945-45c0-946e-934f1443053e`) showed 1/1 missing `session_length` (coaches_mentors).
  - Regenerated with 1 Gemini call (15s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:56 UTC — Continued `session_length` block:
  - Baseline for `Quit drinking` (goal `6e15bc27-d903-4126-ac8c-1720f99ab561`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (15s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:58 UTC — Continued `session_length` block:
  - Baseline for `Bike long distances` (goal `0772b2d8-3194-485e-affa-3efdb8ea1b77`) showed 1/1 missing `session_length` (coaches_mentors).
  - Regenerated with 1 Gemini call (9s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 00:59 UTC — Continued `session_length` block:
  - Baseline for `Stand out from applicants` (goal `6be41ee3-9d04-4aad-a43d-6672c90964ad`) showed 1/1 missing `session_length` (coaches_mentors).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 02:12 UTC — Continued `session_length` block:
  - Baseline for `Get more dating matches` (goal `49a8e45d-6732-4738-a705-5b9f35e3a184`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 02:13 UTC — Continued `session_length` block:
  - Baseline for `Network effectively` (goal `d652351e-6a68-4940-b79b-8e62d9f86588`) showed 1/1 missing `session_length` (coaches_mentors).
  - Regenerated with 1 Gemini call (9s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 02:15 UTC — Continued `session_length` block:
  - Baseline for `Control gaming addiction` (goal `0ba6a398-8a4b-4b08-b43c-5ae04f0ec608`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (11s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 02:55 UTC — Continued `session_length` block:
  - Baseline for `Complete a marathon` (goal `d08a7dde-e7fe-42e8-af4e-752cef7a7355`) showed 1/1 missing `session_length` (alternative_practitioners).
  - Regenerated with 1 Gemini call (11s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 02:56 UTC — Continued `session_length` block:
  - Baseline for `Start support groups` (goal `41c58331-a79f-406b-a049-1abd1f8c4d6f`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (9s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 02:58 UTC — Continued `session_length` block:
  - Baseline for `Swim regularly` (goal `dca1334b-c2b4-417c-a880-43a7c5a39081`) showed 1/1 missing `session_length` (coaches_mentors).
  - Regenerated with 1 Gemini call (7s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 02:59 UTC — Continued `session_length` block:
  - Baseline for `Do a pull-up` (goal `3aa0902d-a5bd-4d6e-aaff-767a826b13a5`) showed 1/1 missing `session_length` (coaches_mentors).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 03:01 UTC — Continued `session_length` block:
  - Baseline for `Spot layoff signs` (goal `e8fe3af7-49b9-4a54-8466-ca4775c37884`) showed 1/1 missing `session_length` (coaches_mentors).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 03:02 UTC — Continued `session_length` block:
  - Baseline for `Maintain deep focus` (goal `f36c91a3-bb0f-4cd4-906c-337e3d8a5f3c`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 03:04 UTC — Continued `session_length` block:
  - Baseline for `Build muscle mass` (goal `38fc0df5-6a7a-4ebd-9bb9-79a297562886`) showed 1/1 missing `session_length` (coaches_mentors).
  - Regenerated with 1 Gemini call (7s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 03:05 UTC — Continued `session_length` block:
  - Baseline for `Build muscle definition` (goal `ac62f0f5-eacf-41b3-950b-0e7ff9dd80d0`) showed 1/1 missing `session_length` (alternative_practitioners).
  - Regenerated with 1 Gemini call (14s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 03:07 UTC — Continued `session_length` block:
  - Baseline for `Build confidence` (goal `acacf4ec-79b9-41eb-996e-599d21fc8df9`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 03:09 UTC — Continued `session_length` block:
  - Baseline for `Manage IBS and gut issues` (goal `db8a2938-5fe7-48b4-bb95-5b97747f91d7`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (7s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 03:13 UTC — Continued `session_length` block:
  - Baseline for `Start journaling` (goal `1e792f27-966f-4968-bae4-c84c84989fed`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (7s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 03:15 UTC — Continued `session_length` block:
  - Baseline for `Deal with excessive sweating` (goal `c06ce272-50b1-424d-ac13-fade70b170b6`) showed 1/1 missing `session_length` (alternative_practitioners).
  - Regenerated with 1 Gemini call (7s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 03:17 UTC — Continued `session_length` block:
  - Baseline for `Start side business` (goal `8227b511-30b7-48b5-a482-1ba46a15af9d`) showed 1/1 missing `session_length` (coaches_mentors).
  - Regenerated with 1 Gemini call (13s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 03:18 UTC — Continued `session_length` block:
  - Baseline for `Get second dates` (goal `fec1af39-041c-4fab-ae59-d827fc09063b`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 03:20 UTC — Continued `session_length` block:
  - Baseline for `Learn an instrument` (goal `1723df8a-dd75-4c99-8b63-29c24e36d89f`) showed 1/1 missing `session_length` (coaches_mentors).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 03:21 UTC — Continued `session_length` block:
  - Baseline for `Manage vertigo and dizziness` (goal `31b43af1-fb4d-4c27-bb97-91ba77c3e02e`) showed 1/1 missing `session_length` (alternative_practitioners).
  - Regenerated with 1 Gemini call (8s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 03:22 UTC — Continued `session_length` block:
  - Baseline for `Practice self-compassion` (goal `7b0d1a0a-f65a-41d9-b1cd-afedf41d52b9`) showed 1/1 missing `session_length` (coaches_mentors).
  - Regenerated with 1 Gemini call (7s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 03:24 UTC — Continued `session_length` block:
  - Baseline for `Get toned body` (goal `23f16afa-0166-44c5-94ce-00797409ed92`) showed 1/1 missing `session_length` (coaches_mentors).
  - Regenerated with 1 Gemini call (7s runtime); revalidation now 0% error for the targeted category.

- 2025-10-01 03:25 UTC — Continued `session_length` block:
  - Baseline for `Control my drinking` (goal `659e0530-f38f-4472-9320-1082337de090`) showed 1/1 missing `session_length` (therapists_counselors).
  - Regenerated with 1 Gemini call (7s runtime); revalidation now 0% error for the targeted category.
- 2025-10-01 09:55 UTC — Completed final `session_length` cleanup:
  - Validated + regenerated 9 single-solution goals (`Remember names and faces`, `Stop losing it`, `Learn to code`, `Host confidently`, `Control compulsive shopping`, `Reduce social media use`, `Find job openings`, `Complete daily priorities`, `Coach youth sports`), each missing 1 `session_length`.
  - Total 9 Gemini calls via V3; `.gemini-usage.json` now tracks 53 requests for 2025-10-01.
  - Follow-up validation + Supabase audit confirm 0 remaining missing `session_length` entries across therapists/coaches/alt practitioners.
- 2025-10-01 10:48 UTC — Completed Block B `group_size` regeneration:
  - Manual pass covered top 24 solutions across goals (`Give back effectively`, `Volunteer meaningfully`, `Build mutual aid network`, `Learn to code`, `Start grassroots movement`, `Network effectively`, `Start support groups`, `Help those in need`, `Support refugees and immigrants`, `Follow through on commitments`, `Find job openings`, `Budget home projects`, `Learn to paint`, `Start writing regularly`, `Entertain on budget`, `Mentor young people`, `Start exercising regularly`, `Find exercise I enjoy`).
  - Automated sweep (`node --input-type=module ...`) processed the remaining 95 solutions with 4s pacing; total `group_size` calls today = 152.
  - Post-run Supabase audit confirms 0 missing `group_size` distributions for `groups_communities`; spot validations clean.
- 2025-10-01 12:05 UTC — Block C `practice_length` completion:
  - Regenerated 152 meditation/mindfulness solutions across 73 goals (manual spot runs for `Improve emotional regulation` + `Practice self-compassion`, then automated sweep for the remaining 71 goals at 4s pacing).
  - `.gemini-usage.json` updated to 357 requests (practice_length delta + previously logged work).
  - Supabase audit now reports 0 missing `practice_length` entries for meditation/mindfulness; validation spot checks clean.
- 2025-10-01 13:28 UTC — Block D `learning_difficulty` run paused (Gemini daily cap hit):
  - Automated sweep regenerated ~671 book/course solutions across 100 goals before quota exhausted (429 from gemini-2.5-flash-lite).
  - `.gemini-usage.json` set to 1000/1000 for 2025-10-01; please resume tomorrow with remaining 99 goals (146 solutions) starting from `Get stronger`, `Stay flexible as I age`, `Track all expenses`, etc.
  - Supabase check confirms 146 `learning_difficulty` gaps remain (see TODO list in this entry).

    Next 20 goals when quota resets:
  - [723f006e-10fa-4c09-9270-927915a46037] Get stronger — 3 remaining
  - [eddd32ce-f951-4232-a80f-f1a80ec50f96] Stay flexible as I age — 3 remaining
  - [97fe516b-0d28-40a4-9fbb-221e00c31d1d] Track all expenses — 3 remaining
  - [bbe1b334-f430-4722-b994-1916341d3e1a] Manage eczema/psoriasis — 2 remaining
  - [f609b584-d74f-4b42-94a0-db56d1f32d3a] Gain healthy weight — 2 remaining
  - [6436959e-8859-46e8-af4a-139484b6f966] Give back effectively — 2 remaining
  - [867d2275-157c-4b2c-8160-c8d3b8e641fe] Manage seasonal depression — 2 remaining
  - [e783dbdf-c1c7-43a3-9751-06ab573240e5] Start exercising regularly — 2 remaining
  - [f5dd1ba0-7141-4e74-a036-42ea76c01f3a] Improve emotional regulation — 2 remaining
  - [a72b9494-5508-4ded-8c6c-94dc96910009] Bounce back from firing — 2 remaining
  - [0ba6a398-8a4b-4b08-b43c-5ae04f0ec608] Control gaming addiction — 2 remaining
  - [dca1334b-c2b4-417c-a880-43a7c5a39081] Swim regularly — 2 remaining
  - [86794c43-865c-41aa-a51f-8ea77699aba1] Stop yo-yo dieting — 2 remaining
  - [25988abd-7991-4b30-9bf1-9af3e43ebfd3] Control sugar cravings — 2 remaining
  - [7f10f31f-5ba4-4be7-a2c0-d4d244f7aa94] Find job openings — 2 remaining
  - [2869fdad-5412-44d6-99a4-bd6ba736139b] Shop smarter for home — 2 remaining
  - [c017b79a-30c7-4f72-90f2-4aff05eea0f9] Control OCD behaviors — 2 remaining
  - [ec0a9b79-05ac-47ea-809c-d9bc10fb730b] Budget home projects — 2 remaining
  - [111adb63-1916-48d4-9599-4b074c10f894] Have healthier hair — 2 remaining
  - [888693d9-7498-410b-ac31-cea63ee12078] Plan for healthcare costs — 2 remaining
