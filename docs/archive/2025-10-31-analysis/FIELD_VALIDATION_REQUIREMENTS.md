# Field Validation Requirements (Aligned with SSOT)
> **Canonical source**: `docs/solution-fields-ssot.md`
>
> This recovery note now mirrors the SSOT so that validation tooling, generators, and audits stay synchronized. Update the SSOT first, then propagate changes here so historical recovery docs remain accurate.

## Universal Rules
- Every category surfaces `time_to_results` plus three additional key metrics defined in the SSOT.
- Array fields (`side_effects` or `challenges`) are strictly limited to categories listed below.
- Form submissions may capture supplemental details (`startup_cost`, `ongoing_cost`, etc.) but only the SSOT-declared display field should render on goal cards.

## Category Patterns (Mirror of SSOT)

| Group | Category | Key Fields | Array Field |
|-------|----------|------------|-------------|
| Dosage | medications | `time_to_results`, `frequency`, `length_of_use`, `cost` | `side_effects` |
|       | supplements_vitamins | `time_to_results`, `frequency`, `length_of_use`, `cost` | `side_effects` |
|       | natural_remedies | `time_to_results`, `frequency`, `length_of_use`, `cost` | `side_effects` |
|       | beauty_skincare | `time_to_results`, `skincare_frequency`, `length_of_use`, `cost` | `side_effects` |
| Practice | meditation_mindfulness | `time_to_results`, `practice_length`, `frequency`, `cost` | `challenges` |
|          | exercise_movement | `time_to_results`, `frequency`, `duration`, `cost` | `challenges` |
|          | habits_routines | `time_to_results`, `time_commitment`, `frequency`, `cost` | `challenges` |
| Session | therapists_counselors | `time_to_results`, `session_frequency`, `session_length`, `cost` | `challenges` |
|         | doctors_specialists | `time_to_results`, `wait_time`, `insurance_coverage`, `cost` | `challenges` |
|         | coaches_mentors | `time_to_results`, `session_frequency`, `session_length`, `cost` | `challenges` |
|         | alternative_practitioners | `time_to_results`, `session_frequency`, `session_length`, `cost` | `side_effects` |
|         | professional_services | `time_to_results`, `session_frequency`, `specialty`, `cost` | `challenges` |
|         | medical_procedures | `time_to_results`, `treatment_frequency`, `wait_time`, `cost` | `side_effects` |
|         | crisis_resources | `time_to_results`, `response_time`, `format`, `cost` | `challenges` |
| Lifestyle | diet_nutrition | `time_to_results`, `weekly_prep_time`, `still_following`, `cost_impact` | `challenges` |
|           | sleep | `time_to_results`, `previous_sleep_hours`, `still_following`, `cost_impact` | `challenges` |
| Purchase | products_devices | `time_to_results`, `ease_of_use`, `product_type`, `cost` | `challenges` |
|          | books_courses | `time_to_results`, `format`, `learning_difficulty`, `cost` | `challenges` |
| App | apps_software | `time_to_results`, `usage_frequency`, `subscription_type`, `cost` | `challenges` |
| Community | groups_communities | `time_to_results`, `meeting_frequency`, `group_size`, `cost` | `challenges` |
|           | support_groups | `time_to_results`, `meeting_frequency`, `format`, `cost` | `challenges` |
| Hobby | hobbies_activities | `time_to_results`, `time_commitment`, `frequency`, `cost` | `challenges` |
| Financial | financial_products | `time_to_results`, `financial_benefit`, `access_time`, `cost_type` | `challenges` |

## Cost Field Behaviour
- Practice and hobby categories capture `startup_cost` + `ongoing_cost`, derive a display `cost`, and tag a `cost_type` for downstream filtering (`components/organisms/solutions/forms/PracticeForm.tsx:241`).
- `financial_products` exposes `cost_type` directly because that classification, not an amount, is what users need on-card (`components/goal/GoalPageClient.tsx:391`).
- Aggregation retains detailed cost fields so AI or human data can be merged without losing granularity (`lib/services/solution-aggregator.ts:63`).

## Guardrails for Validation Scripts
- Always validate against `CATEGORY_FIELD_CONFIG` and `CATEGORY_COST_MAPPING`—they are re-exported for generator tooling (`lib/config/solution-fields.ts:7`, `lib/config/solution-dropdown-options.ts:904`).
- Side-effect arrays are limited to the six categories listed above; generators must not populate them elsewhere.
- If the SSOT changes, rerun `scripts/audit-category-alignment.ts` before regenerating AI data.
