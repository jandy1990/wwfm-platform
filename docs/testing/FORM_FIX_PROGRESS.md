# FORM_FIX_PROGRESS.md – Manual QA & Regression Status (October 2025)

> Tracks manual validation across the nine solution forms and supporting flows. Keep this file updated after each QA cycle.

## Legend
- ✅ Completed this cycle
- 🔄 In progress / partially verified
- ❌ Not yet verified

## Core Form Walkthroughs
| Form Template | Scenario | Status | Notes |
| --- | --- | --- | --- |
| AppForm | Submit "Headspace (Test)" against Reduce Anxiety goal | ✅ | Verified March 2025 playbook; regression check 2025-10-03 passes. |
| DosageForm | Submit "Prozac (Test)" (20mg tablet) | ✅ | Confirmed variant creation + rating cleanup. |
| DosageForm | Submit "Vitamin D (Test)" (1000 IU capsule) | ✅ | Validates IU unit path. |
| SessionForm | Crisis resources (Warm line) | 🔄 | Automation flaky; manual check blocked on fast-refresh reload. |
| SessionForm | Therapists (CBT Therapy) | ✅ | Confirmed field capture + retrospective creation. |
| PracticeForm | Running (Test) | ✅ | Manual smoke 2025-10-02. |
| PurchaseForm | Fitbit (Test) | ✅ | Confirms cost range dropdown. |
| CommunityForm | Anxiety Support Group (Test) | ✅ | New persona walkthrough below. |
| LifestyleForm | Mediterranean Diet (Test) | ✅ | Checks cost impact fields. |
| HobbyForm | Painting (Test) | 🔄 | Pending visual QA for new card layout. |
| FinancialForm | High Yield Savings (Test) | 🔄 | Awaiting interest-rate copy updates (see release checklist).

## Persona Walkthroughs
1. **First-time Seeker** – Discover goal via browse, read solution cards, attempt form but exit before submission. ✅ (verified 2025-10-03)
2. **Returning Contributor** – Signs in, submits new solution, reviews mailbox reminder. ✅
3. **Crisis Mode** – Uses search auto-suggest, tries crisis hotline submission. 🔄 (blocked by automation flake; manual check scheduled)
4. **Data Steward** – Admin persona ensuring aggregated fields display; relies on manual SQL spot checks. 🔄

## Known Manual Gaps
- Mobile Safari regression not executed (requires BrowserStack booking).
- Vision accessibility audit pending (coordinate with design). 
- Crisis resources multi-step reliability tracked in `TEST_FAILURES_HANDOFF.md` (see Phase 8). 

## Next QA Window
- Schedule full manual sweep once crisis_resources stability patch lands.
- Add screenshots of successful persona runs to `/docs/testing/archive/manual-runs/`.

