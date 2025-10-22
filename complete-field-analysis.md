# Complete Field Analysis (Aligned with SSOT)
> **Source of truth**: `docs/solution-fields-ssot.md`
>
> This document is a quick-reference mirror of the canonical solution-field matrix. Always update the SSOT first, then mirror changes here if a compact summary is still needed.

## Category-to-Field Matrix
_All groupings and field names come directly from the SSOT. Array fields are shown on the right when present._

### Dosage Forms
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| medications | `time_to_results` | `frequency` | `length_of_use` | `cost` | `side_effects` |
| supplements_vitamins | `time_to_results` | `frequency` | `length_of_use` | `cost` | `side_effects` |
| natural_remedies | `time_to_results` | `frequency` | `length_of_use` | `cost` | `side_effects` |
| beauty_skincare | `time_to_results` | `skincare_frequency` | `length_of_use` | `cost` | `side_effects` |

### Practice Forms
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| meditation_mindfulness | `time_to_results` | `practice_length` | `frequency` | `cost` | `challenges` |
| exercise_movement | `time_to_results` | `frequency` | `duration` | `cost` | `challenges` |
| habits_routines | `time_to_results` | `time_commitment` | `frequency` | `cost` | `challenges` |

### Session Forms
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| therapists_counselors | `time_to_results` | `session_frequency` | `session_length` | `cost` | `challenges` |
| doctors_specialists | `time_to_results` | `wait_time` | `insurance_coverage` | `cost` | `challenges` |
| coaches_mentors | `time_to_results` | `session_frequency` | `session_length` | `cost` | `challenges` |
| alternative_practitioners | `time_to_results` | `session_frequency` | `session_length` | `cost` | `side_effects` |
| professional_services | `time_to_results` | `session_frequency` | `specialty` | `cost` | `challenges` |
| medical_procedures | `time_to_results` | `session_frequency` | `wait_time` | `cost` | `side_effects` |
| crisis_resources | `time_to_results` | `response_time` | `format` | `cost` | `challenges` |

### Lifestyle Forms
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| diet_nutrition | `time_to_results` | `weekly_prep_time` | `still_following` | `cost` | `challenges` |
| sleep | `time_to_results` | `previous_sleep_hours` | `still_following` | `cost` | `challenges` |

**⚠️ NOTE**: Field name is `cost` but UI label shows "Cost Impact" for these lifestyle categories

### Purchase Forms
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| products_devices | `time_to_results` | `ease_of_use` | `product_type` | `cost` | `challenges` |
| books_courses | `time_to_results` | `format` | `learning_difficulty` | `cost` | `challenges` |

### App Form
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| apps_software | `time_to_results` | `usage_frequency` | `subscription_type` | `cost` | `challenges` |

### Community Forms
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| groups_communities | `time_to_results` | `meeting_frequency` | `group_size` | `cost` | `challenges` |
| support_groups | `time_to_results` | `meeting_frequency` | `format` | `cost` | `challenges` |

### Hobby Form
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| hobbies_activities | `time_to_results` | `time_commitment` | `frequency` | `cost` | `challenges` |

### Financial Form
| Category | Field 1 | Field 2 | Field 3 | Field 4 | Array Field |
|----------|---------|---------|---------|---------|-------------|
| financial_products | `time_to_results` | `financial_benefit` | `access_time` | `cost_type` | `challenges` |

## Cost Handling Notes
- Form submissions for practice and hobby categories capture `startup_cost` and `ongoing_cost`, derive a primary `cost`, and label a `cost_type` for filtering (`components/organisms/solutions/forms/PracticeForm.tsx:241`).
- Aggregation preserves all cost variants (`lib/services/solution-aggregator.ts:63`).
- The goal page displays a single cost metric built from those detailed fields, while still exposing `cost_type` where relevant (e.g. financial products) (`components/goal/GoalPageClient.tsx:535`).

If any inconsistency is spotted, update the SSOT, regenerate this mirror, and audit dependent tooling (forms, generator, aggregator) in the same pass.
