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
- STEP 6: Report summary

---

## 🔑 Database Access

You have access to Supabase MCP tools via the connection already configured in this project.

**Database**: Production WWFM database (wqxkhxdbxdtpuvuvgirx.supabase.co)

**Required MCP Tools**:
- `mcp__supabase__execute_sql` - For database insertions and queries
- `mcp__supabase__list_tables` - To verify schema if needed

**Environment Variables**: Already configured in `.env.local` (you have access)

---

## ⚠️ Critical Requirements

### 1. Solution Count Assessment (STEP 0)

Before generating solutions, you MUST assess this goal and determine the appropriate solution count.

**Expected Classification**: BROAD
**Expected Count**: 45-50 solutions

**Why**: "Reduce anxiety" is a major mental health challenge affecting millions globally. It has extensive evidence-based solutions across multiple categories:
- Medications (SSRIs, benzodiazepines, beta blockers)
- Therapy (CBT, ACT, DBT, EMDR)
- Apps & Software (Headspace, Calm, BetterHelp)
- Meditation & Mindfulness practices
- Exercise & Movement
- Books & Courses
- Supplements & Vitamins
- Natural Remedies
- Habits & Routines
- Products & Devices

**Your Assessment Output**:
```json
{
  "classification": "broad",
  "target_count": 45-50,
  "rationale": "Major mental health challenge affecting millions with extensive evidence-based solutions across 10+ categories. Medications, therapy, apps, meditation, exercise, books, supplements all have strong research support for anxiety reduction."
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

## 📊 Expected Output (STEP 6)

After completing all steps, provide this summary:

```markdown
## Generation Complete: Reduce Anxiety

### STEP 0: Solution Count Assessment
- Classification: broad
- Target Count: [your decision 45-50]
- Rationale: [your explanation]

### STEP 1-2: Solution Generation & Validation
- Solutions Generated: [exact count]
- Categories Used: [list of categories]
- Laugh Test Pass: [count]/[total]
- Evidence Check Pass: [count]/[total]
- Category Check Pass: [count]/[total]

### STEP 3: Field Distribution Generation
- Total Fields Generated: [count]
- Avg Options per Field: [number]
- Percentage Sum Errors: 0 (all validated inline)

### STEP 4: Database Insertion
- Solutions Inserted: [count]
- Variants Created: [count]
- Goal-Solution Links: [count]
- Duplicates Skipped: [count if any]

### STEP 5: Validation Results
✅ Solution count matches target: [count]
✅ All percentage sums = 100%
✅ All required fields present
✅ No duplicate solutions

### Quality Metrics
- Avg Effectiveness: [number]
- Generic Rating Violations: 0
- Mechanistic Patterns: 0
- Field Quality: High (5-8 options, evidence-based)

### Sample Solutions (Top 5 by Effectiveness)
1. [Title] - [Effectiveness]⭐ - [Category]
2. [Title] - [Effectiveness]⭐ - [Category]
3. [Title] - [Effectiveness]⭐ - [Category]
4. [Title] - [Effectiveness]⭐ - [Category]
5. [Title] - [Effectiveness]⭐ - [Category]

### Database IDs
[List first 10 solution IDs for verification]
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
