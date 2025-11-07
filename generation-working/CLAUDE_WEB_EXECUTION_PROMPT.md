# Claude Web Execution Instructions: "Reduce Anxiety" Goal

## 🎯 Your Mission

Execute the **complete WWFM solution generation pipeline** for a single goal, generating high-quality solutions and inserting them directly into the production database.

---

## 📋 Goal Information

**Goal ID**: `56e2801e-0d78-4abd-a795-869e5b780ae7`
**Goal Title**: Reduce anxiety
**Goal Description**: Calm my anxiety
**Arena**: Feeling & Emotion
**Arena Solution Range**: 15-50 solutions (typical: 35)

---

## 📖 Master Instructions

**Read and follow ALL instructions in this file**:
`/Users/jackandrews/Desktop/wwfm-platform/scripts/claude-web-generator/CLAUDE_WEB_MASTER_INSTRUCTIONS.md`

This file contains the complete 6-step pipeline:
- STEP 0: Determine solution count (assess goal scope)
- STEP 1: Generate solutions
- STEP 2: Validate solutions
- STEP 3: Generate field distributions
- STEP 4: Insert into Supabase database
- STEP 5: Validate insertion

---

## 🔑 Database Access

**Database**: Production WWFM database (wqxkhxdbxdtpuvuvgirx.supabase.co)

**Connection Guide**: `/home/user/wwfm-platform/generation-working/SUPABASE_CONNECTION_GUIDE.md`

**FIRST: Test your connection** by running:
```bash
bash /home/user/wwfm-platform/generation-working/test-connection.sh
```
This will verify database access and confirm the goal is ready (0 existing solutions).

**Three Access Methods** (in order of preference):

1. **Supabase REST API** (via curl) - RECOMMENDED for Claude Web
   - Direct HTTP calls to Supabase REST API
   - No dependencies required
   - See connection guide for curl examples

2. **PostgreSQL Direct** (via psql)
   - Direct database connection
   - Connection string in guide
   - Good fallback if REST API has issues

3. **Supabase MCP Tools** (if configured)
   - `mcp__supabase__execute_sql`
   - `mcp__supabase__list_tables`
   - May not be available in all environments

**If all methods fail**: Generate solution data as JSON files for manual insertion

---

## ⚠️ Critical Requirements

### 1. Solution Count Assessment (STEP 0)

Before generating solutions, you MUST independently assess this goal and determine the appropriate solution count using the classification system in the master instructions.

**Your Task**:
1. Read the STEP 0 criteria in the master instructions
2. Classify "Reduce anxiety" as niche, typical, or broad
3. Determine the appropriate solution count within the arena range (15-50)
4. Provide your rationale

**Do NOT use any predetermined count** - use your own assessment based on:
- Goal scope and breadth
- Population affected
- Number of evidence-based solution categories available
- Research literature available

**Your Assessment Output Format**:
```json
{
  "classification": "niche|typical|broad",
  "target_count": <your determined number 15-50>,
  "rationale": "<your explanation for why this count is appropriate>"
}
```

### 2. Quality Standards (STEP 1-2)

Every solution must pass:
- ✅ **Laugh Test**: Would you naturally say this to a friend? (no "like", "such as", generic prefixes)
- ✅ **Specificity**: Googleable brand/program names (not categories)
- ✅ **Evidence-Based Rating**: 3.0-5.0 with research-backed rationale
- ✅ **Correct Category**: 23 categories available, choose most specific
- ✅ **Generic Rating Cap**: Generic solutions ≤4.0, specific can exceed 4.0

### 3. Field Distributions (STEP 3)

Every field must have:
- ✅ **5-8 options** (minimum 4, never single 100%)
- ✅ **Percentages sum to exactly 100%** (validate after EACH field!)
- ✅ **Evidence-based patterns**: Realistic distributions from AI training data (medical literature, clinical studies, user research)
- ✅ **NO mechanistic templates**: No 25/25/25/25 or 40/30/20/10 sequences
- ✅ **Exact dropdown values**: Match form dropdowns exactly (case-sensitive)

**Mandatory Inline Validation**:
After generating EACH field distribution, verify:
```
sum(all_percentages) == 100
```
If not 100%, regenerate that field before proceeding.

### 4. Database Insertion (STEP 4)

For each solution, execute this 3-step process:

**Step 4.1: Check for existing solution** (deduplication)
```sql
SELECT s.id, s.title, s.solution_category
FROM solutions s
JOIN solution_variants sv ON sv.solution_id = s.id
JOIN goal_implementation_links gil ON gil.implementation_id = sv.id
WHERE gil.goal_id = '56e2801e-0d78-4abd-a795-869e5b780ae7'
  AND s.solution_category = 'category_you_plan_to_insert';
```

If very similar solution exists → Skip and generate different solution

**Step 4.2: Insert solution record**
```sql
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
  'Solution Title',
  'Solution description...',
  'category_name',
  NOW(),
  NOW(),
  true
) RETURNING id;
```

Save the returned `solution_id` for next steps.

**Step 4.3: Insert variants** (ONLY for medications, supplements_vitamins, natural_remedies, beauty_skincare)
```sql
INSERT INTO solution_variants (solution_id, amount, unit, form)
VALUES
  ('solution_id_from_4.2', 25, 'mg', 'tablet'),
  ('solution_id_from_4.2', 50, 'mg', 'tablet'),
  ('solution_id_from_4.2', 100, 'mg', 'tablet')
RETURNING id;
```

Save the FIRST returned variant_id (use the default/most common dosage).

For non-dosage categories, create a single "Standard" variant:
```sql
INSERT INTO solution_variants (solution_id, variant_name)
VALUES ('solution_id_from_4.2', 'Standard')
RETURNING id;
```

**Step 4.4: Create goal-solution link**
```sql
INSERT INTO goal_implementation_links (
  id,
  goal_id,
  implementation_id,
  avg_effectiveness,
  aggregated_fields,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '56e2801e-0d78-4abd-a795-869e5b780ae7',
  'variant_id_from_4.3',
  4.3,
  '{"time_to_results": {...}, "frequency": {...}}'::jsonb,
  NOW(),
  NOW()
);
```

**CRITICAL**: `aggregated_fields` must contain ALL field distributions from STEP 3 in JSONB format.

### 5. Final Validation (STEP 5)

After inserting all solutions, verify:

```sql
-- Count check (should match target_count from STEP 0)
SELECT COUNT(*) as solution_count
FROM goal_implementation_links
WHERE goal_id = '56e2801e-0d78-4abd-a795-869e5b780ae7';
```

Expected: 45-50 solutions

```sql
-- Percentage sum check (all fields should sum to 100%)
SELECT
  s.title,
  jsonb_object_keys(gil.aggregated_fields) as field_name,
  (
    SELECT SUM((value->>'percentage')::int)
    FROM jsonb_array_elements(
      gil.aggregated_fields->jsonb_object_keys(gil.aggregated_fields)->'values'
    ) AS value
  ) as percentage_sum
FROM goal_implementation_links gil
JOIN solution_variants sv ON sv.id = gil.implementation_id
JOIN solutions s ON s.id = sv.solution_id
WHERE gil.goal_id = '56e2801e-0d78-4abd-a795-869e5b780ae7'
  AND (
    SELECT SUM((value->>'percentage')::int)
    FROM jsonb_array_elements(
      gil.aggregated_fields->jsonb_object_keys(gil.aggregated_fields)->'values'
    ) AS value
  ) != 100;
```

Expected: 0 rows (all sums = 100%)

---

## ✅ Final Confirmation

After completing STEP 5 validation, confirm completion with a simple message:

```
✅ Generation complete for "Reduce anxiety"
- Solutions inserted: [count]
- Classification: [niche/typical/broad]
- All validation queries passed
```

---

## ⏱️ Estimated Time

**2-3 hours** for 45-50 high-quality solutions with complete pipeline execution

---

## 🚀 Ready to Execute

You have everything you need:
1. ✅ Master instructions file location
2. ✅ Goal information and expected classification
3. ✅ Database access via MCP tools
4. ✅ Quality standards and validation requirements
5. ✅ SQL templates for all operations
6. ✅ Final validation queries

**Execute the full pipeline now.** Generate 45-50 evidence-based, high-quality solutions for "Reduce anxiety" and insert them directly into the production database.

Good luck! 🎯
