# Claude Web Full Pipeline Test: 4 Goals End-to-End

## Objective

Run the COMPLETE WWFM solution generation pipeline on 4 test goals, exactly as if we were running this for real production. This includes:

1. ✅ Solution generation (ALREADY DONE - see `generated-solutions-test-run.json`)
2. ⏳ Field distribution generation (NEEDED)
3. ⏳ Database insertion to Supabase (NEEDED)
4. ⏳ Validation of inserted data (NEEDED)

## Test Goals (Already Generated)

You have 40 solutions in `generated-solutions-test-run.json` for these 4 goals:

1. **Reduce anxiety** (56e2801e-0d78-4abd-a795-869e5b780ae7) - 10 solutions
2. **Get over dating anxiety** (c826834a-bf7e-45d4-9888-7526b8d6cba2) - 10 solutions
3. **Lift heavier weights** (1be300b4-6945-45c0-946e-934f1443053e) - 10 solutions
4. **Land dream job** (a660050e-780c-44c8-be6a-1cfdfeaaf82d) - 10 solutions

---

## Phase 1: Generate Field Distributions (NEW WORK)

For EACH of the 40 solutions, generate field distributions using the prompts in:
**`/Users/jackandrews/Desktop/wwfm-platform/scripts/claude-web-generator/prompts/field-generation.ts`**

### Required Fields by Category

Each solution needs distributions for its category-specific fields. Reference **CATEGORY_CONFIG** in:
`/Users/jackandrews/Desktop/wwfm-platform/components/goal/GoalPageClient.tsx` (lines 56-407)

### Critical Field Generation Rules

1. **5-8 options required** (minimum 4, never single value at 100%)
2. **Percentages must sum to exactly 100%**
3. **Evidence-based distributions** (from medical literature, clinical studies, user research)
4. **NO mechanistic templates** (avoid 25/25/25/25 or 40/30/20/10)
5. **Exact dropdown values** (match form options exactly - check `FORM_DROPDOWN_OPTIONS_REFERENCE.md`)

### Example: Sertraline (medications category)

**Required keyFields**: `time_to_results`, `frequency`, `length_of_use`, `cost`
**Required arrayField**: `side_effects`

**Output Format**:
```json
{
  "solution_id": "uuid-here",
  "goal_id": "56e2801e-0d78-4abd-a795-869e5b780ae7",
  "aggregated_fields": {
    "time_to_results": {
      "mode": "2-4 weeks",
      "values": [
        {"value": "2-4 weeks", "count": 40, "percentage": 40, "source": "research"},
        {"value": "4-8 weeks", "count": 30, "percentage": 30, "source": "studies"},
        {"value": "1-2 weeks", "count": 15, "percentage": 15, "source": "research"},
        {"value": "2-3 months", "count": 10, "percentage": 10, "source": "studies"},
        {"value": "8-12 weeks", "count": 5, "percentage": 5, "source": "research"}
      ],
      "totalReports": 100,
      "dataSource": "ai_research"
    },
    "frequency": {
      "mode": "Once daily",
      "values": [
        {"value": "Once daily", "count": 70, "percentage": 70, "source": "research"},
        {"value": "Twice daily", "count": 25, "percentage": 25, "source": "studies"},
        {"value": "Every other day", "count": 5, "percentage": 5, "source": "research"}
      ],
      "totalReports": 100,
      "dataSource": "ai_research"
    },
    "side_effects": {
      "mode": "Nausea",
      "values": [
        {"value": "Nausea", "count": 35, "percentage": 35, "source": "research"},
        {"value": "Headache", "count": 25, "percentage": 25, "source": "studies"},
        {"value": "Sleep changes", "count": 20, "percentage": 20, "source": "research"},
        {"value": "Digestive issues", "count": 12, "percentage": 12, "source": "studies"},
        {"value": "Fatigue", "count": 8, "percentage": 8, "source": "research"}
      ],
      "totalReports": 100,
      "dataSource": "ai_research"
    }
  }
}
```

### Validation Checklist (Run After Each Solution)

- [ ] All keyFields present for this category
- [ ] All percentages sum to 100%
- [ ] 5-8 options per field (minimum 4)
- [ ] NO single value at 100%
- [ ] Values match dropdown options exactly
- [ ] Evidence-based distributions (not mechanistic)
- [ ] totalReports = 100 for all fields
- [ ] dataSource = "ai_research" for all fields

---

## Phase 2: Insert Solutions into Supabase

Use the Supabase MCP tools to insert data into the production database.

### Database Structure

**Tables to insert into**:
1. `solutions` - Core solution data
2. `solution_variants` - Dosage variants (only for 4 categories)
3. `goal_implementation_links` - Links solutions to goals with effectiveness + fields

### Step 2.1: Insert Solutions

For each of the 40 solutions:

```typescript
// Use: mcp__supabase__execute_sql

INSERT INTO solutions (
  id,
  title,
  description,
  solution_category,
  created_at,
  updated_at,
  is_approved
) VALUES (
  gen_random_uuid(),
  'Sertraline (Zoloft)',
  'SSRI antidepressant commonly prescribed for generalized anxiety disorder...',
  'medications',
  NOW(),
  NOW(),
  true  -- Auto-approve AI-generated solutions
) RETURNING id;
```

**CRITICAL**: Save the returned `solution_id` for each solution - you'll need it for the next steps!

### Step 2.2: Insert Variants (Only for 4 Categories)

**Only if category is**: `medications`, `supplements_vitamins`, `natural_remedies`, `beauty_skincare`

```typescript
// Use: mcp__supabase__execute_sql

INSERT INTO solution_variants (solution_id, amount, unit, form)
VALUES
  ('solution_id_here', 25, 'mg', 'tablet'),
  ('solution_id_here', 50, 'mg', 'tablet'),
  ('solution_id_here', 100, 'mg', 'tablet');
```

### Step 2.3: Create Goal-Solution Links

For each solution, create a link to its goal with effectiveness data + field distributions:

```typescript
// Use: mcp__supabase__execute_sql

INSERT INTO goal_implementation_links (
  id,
  goal_id,
  solution_id,
  effectiveness,
  effectiveness_rationale,
  aggregated_fields,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '56e2801e-0d78-4abd-a795-869e5b780ae7',  -- goal_id
  'solution_id_from_step_2.1',
  4.3,
  'Multiple RCTs demonstrate 60-70% response rate...',
  '{"time_to_results": {...}, "frequency": {...}, "side_effects": {...}}'::jsonb,
  NOW(),
  NOW()
);
```

**CRITICAL**: The `aggregated_fields` JSONB column must contain the field distributions from Phase 1!

---

## Phase 3: Validate Inserted Data

After inserting all 40 solutions, run these validation queries:

### Validation Query 1: Count Check

```sql
-- Should return 4 rows (one per goal)
SELECT
  g.id,
  g.title,
  COUNT(gil.id) as solution_count
FROM goals g
LEFT JOIN goal_implementation_links gil ON gil.goal_id = g.id
WHERE g.id IN (
  '56e2801e-0d78-4abd-a795-869e5b780ae7',
  'c826834a-bf7e-45d4-9888-7526b8d6cba2',
  '1be300b4-6945-45c0-946e-934f1443053e',
  'a660050e-780c-44c8-be6a-1cfdfeaaf82d'
)
GROUP BY g.id, g.title;
```

**Expected**: Each goal should have exactly 10 solutions (40 total).

### Validation Query 2: Field Quality Check

```sql
-- Check that aggregated_fields are properly populated
SELECT
  s.title,
  s.solution_category,
  gil.effectiveness,
  jsonb_object_keys(gil.aggregated_fields) as field_names,
  jsonb_array_length(gil.aggregated_fields->'side_effects'->'values') as side_effects_option_count,
  (gil.aggregated_fields->'side_effects'->>'dataSource') as data_source
FROM goal_implementation_links gil
JOIN solutions s ON s.id = gil.solution_id
WHERE gil.goal_id = '56e2801e-0d78-4abd-a795-869e5b780ae7'  -- Reduce anxiety goal
  AND s.solution_category = 'medications'
LIMIT 5;
```

**Expected**:
- `field_names` should show all keyFields for category
- `side_effects_option_count` should be 5-8
- `data_source` should be "ai_research"

### Validation Query 3: Variant Check

```sql
-- Check that medication variants were inserted
SELECT
  s.title,
  COUNT(sv.id) as variant_count,
  json_agg(json_build_object('amount', sv.amount, 'unit', sv.unit, 'form', sv.form)) as variants
FROM solutions s
LEFT JOIN solution_variants sv ON sv.solution_id = s.id
WHERE s.solution_category IN ('medications', 'supplements_vitamins')
  AND s.title IN ('Sertraline (Zoloft)', 'Propranolol (Inderal)', 'Magnesium Glycinate', 'L-Theanine')
GROUP BY s.id, s.title;
```

**Expected**: Each medication/supplement should have 3-5 variants.

### Validation Query 4: Percentage Sum Check

```sql
-- Verify all percentages sum to 100%
WITH field_sums AS (
  SELECT
    s.title,
    s.solution_category,
    (
      SELECT SUM((value->>'percentage')::int)
      FROM jsonb_array_elements(gil.aggregated_fields->'time_to_results'->'values') AS value
    ) as time_to_results_sum,
    (
      SELECT SUM((value->>'percentage')::int)
      FROM jsonb_array_elements(gil.aggregated_fields->'side_effects'->'values') AS value
    ) as side_effects_sum
  FROM goal_implementation_links gil
  JOIN solutions s ON s.id = gil.solution_id
  WHERE gil.goal_id = '56e2801e-0d78-4abd-a795-869e5b780ae7'
)
SELECT *
FROM field_sums
WHERE time_to_results_sum != 100 OR side_effects_sum != 100;
```

**Expected**: Should return 0 rows (all sums = 100%).

---

## Phase 4: Report Results

After completing all phases, provide a summary report:

### Summary Report Template

```markdown
## Full Pipeline Test Results

### Phase 1: Field Generation
- Solutions processed: X/40
- Fields generated per solution: Y average
- Validation failures: Z

### Phase 2: Database Insertion
- Solutions inserted: X/40
- Variants inserted: Y total
- Goal-solution links created: X/40

### Phase 3: Validation Results
- ✅ Count check: X/4 goals have 10 solutions
- ✅ Field quality: X/40 solutions have proper fields
- ✅ Variants: X medications have variants
- ✅ Percentage sums: X/40 solutions sum to 100%

### Issues Found
- List any validation failures
- List any data quality issues
- List any database errors

### Ready for Scale?
- YES/NO with reasoning
```

---

## Reference Files

**Field Generation Prompts**: `/Users/jackandrews/Desktop/wwfm-platform/scripts/claude-web-generator/prompts/field-generation.ts`

**Category Field Mappings**: `/Users/jackandrews/Desktop/wwfm-platform/components/goal/GoalPageClient.tsx` (CATEGORY_CONFIG lines 56-407)

**Dropdown Options Reference**: `/Users/jackandrews/Desktop/wwfm-platform/FORM_DROPDOWN_OPTIONS_REFERENCE.md`

**Array Field Validator**: `/Users/jackandrews/Desktop/wwfm-platform/scripts/claude-web-generator/prompts/validation-prompts.ts`

**Solution Data**: `/Users/jackandrews/Desktop/wwfm-platform/generated-solutions-test-run.json`

---

## Success Criteria

**PASS** if:
- ✅ All 40 solutions inserted into database
- ✅ All field distributions have 5-8 options
- ✅ All percentages sum to 100%
- ✅ All dropdown values match form options
- ✅ No single-value 100% distributions
- ✅ All variants inserted for dosage categories
- ✅ All validation queries return expected results

**FAIL** if:
- ❌ Any solutions missing required fields
- ❌ Any percentage sums != 100%
- ❌ Any single-value 100% distributions
- ❌ Any dropdown value mismatches
- ❌ Any database insertion errors

---

## Estimated Time: 1-2 hours

**GO!** Complete all 4 phases and report back with results.
