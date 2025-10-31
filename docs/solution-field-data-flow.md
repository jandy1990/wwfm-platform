# Solution Field Data Flow

This reference captures every touchpoint a solution field travels through — from a user filling out a form, to the data that powers goal pages, to the AI tooling that regenerates distributions. It complements the canonical matrix in `docs/solution-fields-ssot.md`.

## Quick Reference Map
| Stage | Primary Files | Notes |
|-------|---------------|-------|
| Form capture | `components/organisms/solutions/forms/*` | Each template builds a `solutionFields` payload that mirrors the SSOT. Practice/Hobby forms derive `cost`, `cost_type`, `startup_cost`, `ongoing_cost`. |
| Submission pipeline | `app/actions/submit-solution.ts`, `app/actions/update-solution-fields.ts` | Validates with `lib/solutions/solution-field-validator.ts`, persists to `solutions`, `solution_variants`, `ratings`, and `goal_implementation_links`. |
| Aggregation | `lib/services/solution-aggregator.ts` | Aggregates human ratings into `goal_implementation_links.aggregated_fields` using `types/aggregated-fields.ts`. Protects AI data until enough human ratings exist. |
| Display | `components/goal/GoalPageClient.tsx` | Reads `aggregated_fields`, applies `CATEGORY_CONFIG` key fields and array fields, handles composite cost presentation. |
| AI regeneration (V3) | `scripts/generate-validated-fields-v3.ts` + `scripts/field-generation-utils/*` | Uses `CATEGORY_FIELD_CONFIG` and dropdown options from `lib/config/*` to build prompts, validate, deduplicate, and push aligned `aggregated_fields`. |
| Auditing & recovery | `scripts/audit-category-alignment.ts`, `scripts/validate-field-quality.ts`, see CLAUDE.md for quality standards | Scripts confirm config/doc/UI alignment. |

## Detailed Flow
1. **Collection (Frontend)**  
   - Form templates assemble a category-specific object containing required keys plus any supporting fields.  
   - Optional step screens call `updateSolutionFields` to merge additional data (e.g., cost breakdown, failed solutions).

2. **Submission (Server)**  
   - `submitSolution` validates payloads with `validateAndNormalizeSolutionFields`, canonicalising dropdown values and stripping placeholders.  
   - Records are inserted/linked across `solutions`, `solution_variants`, `ratings`, and `goal_implementation_links`.  
   - `updateSolutionFields` re-triggers aggregation flags when follow-up data arrives.

3. **Aggregation (Services)**  
   - `SolutionAggregator.computeAggregates` reads human `ratings.solution_fields`, computes `DistributionData`, writes to `goal_implementation_links.aggregated_fields`, and stamps metadata.  
   - Dual cost fields are preserved (`cost`, `cost_type`, `startup_cost`, `ongoing_cost`) so downstream tooling has full context.

4. **Consumption (Goal Experience)**  
   - `GoalPageClient` maps each category to four key metrics plus the array surface (`CATEGORY_CONFIG`).  
   - Composite helpers merge split cost fields, decorate variants, and manage array pills.  
   - Related scripts (`components/goal/GoalPageClient.tsx`, `components/molecules/NewDistributionField.tsx`) expect the DistributionData shape produced by the aggregator/generator.

5. **Generation Tooling (AI)**  
   - `generate-validated-fields-v3` loops through `goal_implementation_links`, assesses field quality, generates Gemini responses via `prompt-generator.ts`, deduplicates values, validates with `field-validator.ts`, and writes aligned distributions.  
   - Config re-exports from `lib/config/solution-fields.ts` and `lib/config/solution-dropdown-options.ts` ensure the CLI, forms, and UI share the same SSOT.

## Quality Gates
- **Documentation**: `docs/solution-fields-ssot.md` is the authoritative documentation (synced to GoalPageClient.tsx). All configs and validators reference this SSOT.  
- **Scripts**: Run `scripts/audit-category-alignment.ts` after any schema/config tweak to verify forms, SSOT, and generator remain in sync.  
- **Testing**: `npm run quality:audit:fields` (via `scripts/validate-field-quality.ts`) checks generated distributions against dropdown catalogs.

## Maintenance Checklist
1. Change requested → update `docs/solution-fields-ssot.md`.  
2. Sync configs (`lib/config/solution-fields.ts`, dropdown options, form components).  
3. Re-run audit scripts and adjust aggregator/generator if needed.  
4. Regenerate AI data (`scripts/generate-validated-fields-v3.ts`).  
5. Verify goal page rendering and update any supporting documentation.

Keeping this pipeline aligned prevents broken dropdown values, missing fields in goal cards, and noisy regeneration runs.
