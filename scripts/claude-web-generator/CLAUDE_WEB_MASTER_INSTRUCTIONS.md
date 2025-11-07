# WWFM Solution Generation - Master Instructions for Claude Web

## 🎯 MISSION

Generate **10 high-quality, evidence-based solutions** for each assigned goal following WWFM's complete quality pipeline.

---

## 🚨 CRITICAL PRINCIPLES (NON-NEGOTIABLE)

### 1. Evidence-Based Generation (NOT Mechanistic)

**ALL data must come from your training data** - medical literature, clinical studies, user research, consumer reports.

❌ **NEVER**:
- Generate random percentages
- Use equal splits (25/25/25/25)
- Use mechanistic sequences (40/30/20/10, 35/30/25/10)
- Create programmatic templates

✅ **ALWAYS**:
- Recall actual patterns from training data
- Cite evidence sources (research, studies, clinical_trials)
- Generate realistic distributions (most common: 35-50%, rare: 5-10%)
- Base on how people ACTUALLY experience this solution for THIS goal

### 2. Specificity Requirement

Solutions must be **googleable, specific implementations with brand names**.

❌ **TOO GENERIC**:
- "meditation" → ✅ "Headspace App"
- "therapy" → ✅ "BetterHelp online CBT"
- "antidepressants" → ✅ "Sertraline (Zoloft)"
- "vitamins" → ✅ "Nature Made Vitamin D3 2000 IU"

✅ **SPECIFIC ENOUGH**:
- Named apps: "Headspace", "MyFitnessPal", "YNAB"
- Named programs: "Couch to 5K", "Starting Strength"
- Medications with generic: "Sertraline (Zoloft)", "Lexapro (Escitalopram)"
- Books with author: "Atomic Habits by James Clear"
- Specific practices: "Hatha yoga", "4-7-8 breathing", "Morning Pages"

### 3. First-Person Naming

Title solutions **exactly as a real user would record them** - no generic descriptors.

❌ **WRONG**:
- "Prescription antidepressant (Sertraline)"
- "Therapy program like CBT"
- "Yoga practice (Hatha)"
- "I tried Headspace"

✅ **CORRECT**:
- "Sertraline (Zoloft)"
- "CBT with licensed therapist"
- "Hatha yoga"
- "Headspace App"

---

## 📋 COMPLETE WORKFLOW

### STEP 1: Generate Solutions

**Read**: `/Users/jackandrews/Desktop/wwfm-platform/scripts/claude-web-generator/prompts/rich-solution-prompt.ts`

**Task**: Generate 10 solutions following ALL rules in that file.

**Additional Critical Rules** (supplement to rich-solution-prompt.ts):

#### A. Category Selection Checklist

Before assigning category, verify:

1. **Is this a pharmaceutical/medical product?** → `medications`
   - Requires prescription or FDA-approved
   - Has dosage and form (tablet, capsule, etc.)
   - Example: "Sertraline", "Propranolol", "Lexapro"

2. **Is this an OTC supplement?** → `supplements_vitamins`
   - Over-the-counter vitamins, minerals, herbs
   - Has amount and unit (200mg, 2000 IU, etc.)
   - Example: "Vitamin D3 2000 IU", "Magnesium Glycinate"

3. **Is this a licensed professional service?** → `therapists_counselors`, `doctors_specialists`, `coaches_mentors`
   - Requires licensed practitioner
   - Session-based with frequency
   - Example: "CBT with licensed therapist", "Career coaching"

4. **Is this a software application?** → `apps_software`
   - Digital tool, website, or mobile app
   - Has subscription or free model
   - Example: "Headspace", "MyFitnessPal", "LinkedIn Premium"

**Common Miscategorization to AVOID**:
- ❌ "Nicotine Replacement Therapy" → habits_routines
  - ✅ CORRECT: medications (pharmaceutical product with dosage)
- ❌ "The Acne.org Regimen" → habits_routines
  - ✅ CORRECT: beauty_skincare (product line you purchase)
- ❌ "Daily Stoic Journal" → habits_routines
  - ✅ CORRECT: books_courses (physical book product)

#### B. Effectiveness Rating Rules

**Generic solutions (no brand/program) = Maximum 4.0**
- Examples: "CBT with therapist", "Progressive Muscle Relaxation", "Journaling"
- Why: Quality varies, not specific enough for higher rating

**Specific solutions (has brand/program/dosage) = Can exceed 4.0**
- Examples: "Headspace App", "Sertraline 50mg", "Starting Strength program"
- Why: Specific implementation with consistent quality, can cite evidence

**Test**: Can you buy/sign up for THIS EXACT thing?
- ❌ No → Generic → 4.0 max
- ✅ Yes → Specific → 4.5+ OK if evidence supports

#### C. Deduplication Rules

Maximum 2 solutions per core concept:
- If you generated "Headspace" → Don't add "Headspace meditation course"
- If you have 2 mindfulness solutions → No more mindfulness
- If you have 2 CBT variations → No more CBT

### STEP 2: Validate Solutions

**Read**: `/Users/jackandrews/Desktop/wwfm-platform/scripts/claude-web-generator/prompts/validation-prompts.ts`

**Task**: For EACH solution, run these validation checks:

#### A. Laugh Test (Friend Test)

Would you confidently tell a friend "this might help you"?

**Check for automatic failures**:
- ❌ Contains "like", "such as", "e.g.", "for example"
- ❌ Contains "I tried", "I used", conversational framing
- ❌ Generic prefix: "Prescription X", "Therapy Y", "App for Z"
- ❌ Single word only: "Yoga", "Meditation", "Exercise"
- ❌ Too verbose or academic

**Example**:
- ❌ FAIL: "Nicotine replacement therapy like Nicoderm CQ"
  - Issues: "like" pattern, generic prefix
  - Fix: "Nicoderm CQ patches"
- ✅ PASS: "Sertraline (Zoloft)"

#### B. Evidence Check

Rating must have rationale citing:
- Clinical trials, RCTs, meta-analyses
- User research, surveys, reviews
- Medical literature, treatment guidelines
- Specific success rates or effect sizes

**Example**:
- ✅ PASS: Rating 4.3, Rationale: "Multiple RCTs show 60-70% response rate. Cochrane review of 27 trials..."
- ❌ FAIL: Rating 4.8, Rationale: "Seems like it would help"

#### C. Category Check

Verify solution is in correct category using checklist from Step 1.

**If ANY validation fails**, fix the solution before proceeding to Step 3.

### STEP 3: Generate Field Distributions

**Read**: `/Users/jackandrews/Desktop/wwfm-platform/scripts/claude-web-generator/prompts/field-generation.ts`

**Task**: For each validated solution, generate distributions for ALL required fields.

#### Critical Field Generation Rules

**⚠️ EVIDENCE-BASED DISTRIBUTIONS - MANDATORY REQUIREMENTS**:

1. **5-8 options REQUIRED** (minimum 4, never single value at 100%)
2. **Percentages MUST sum to exactly 100%** ⚠️ CRITICAL - VALIDATE AFTER EVERY FIELD
3. **NO equal splits** (never 25/25/25/25 or 20/20/20/20/20)
4. **NO mechanistic sequences** (avoid 40/30/20/10 or 35/30/25/10)
5. **Evidence-based pattern**:
   - Most common value: 35-50%
   - Secondary values: 20-30%
   - Less common: 10-15%
   - Rare cases: 5-10%

**MANDATORY VALIDATION STEP**:
After generating each field distribution, IMMEDIATELY verify:
```
sum(all_percentages) == 100
```

**Examples**:
- ✅ 45% + 30% + 15% + 10% = 100% (PASS - proceed)
- ❌ 48% + 35% + 28% + 22% + 8% = 141% (FAIL - regenerate this field)
- ✅ 42% + 28% + 20% + 10% = 100% (PASS - proceed)

**If sum ≠ 100, you MUST regenerate that specific field before proceeding to the next field.**

**If you cannot generate at least 5 values with evidence-based percentages from training data, STOP and explain why.**

#### Deduplication Rules for Fields

**Only collapse EXACT semantic duplicates**:

✅ **Keep as DIFFERENT values**:
- "Daily" ≠ "once daily" (intensity vs frequency)
- "Video call" ≠ "In-person" (medium difference)
- "Morning" ≠ "Evening" (timing difference)

✅ **Collapse as SAME value**:
- "Twice daily (AM/PM)" = "Twice daily" (exact duplicate)
- "Virtual/Online" = "Video call" (exact semantic match)

Before collapsing, ask: **"Would a user see these as meaningfully different?"**

#### Multi-Select Field Math (side_effects, challenges)

**CRITICAL UNDERSTANDING**: For multi-select fields where users can select multiple options:

**Percentage Interpretation**:
- Each percentage represents: **"% of users who experience THIS option"**
- NOT "% probability per individual user"
- Users can experience multiple options simultaneously (overlapping)

**BUT Percentages MUST STILL Sum to 100%**:
```
Example for Tretinoin side_effects:
- 34% experience Dryness
- 25% experience Redness
- 20% experience Peeling
- 16% experience Sun sensitivity
- 5% experience None
= 100% total (represents the user base distribution)
```

**Common Mistake to AVOID**:
```
❌ WRONG:
- 48% Dryness
- 35% Redness
- 28% Peeling
- 22% Sun sensitivity
- 8% None
= 141% (FAILS validation - exceeds user base)
```

**Think of it as**: "If we surveyed 100 users, X% would report THIS as their PRIMARY/most notable experience."

#### Category-Specific Critical Instructions

**For medications category**:
```
MEDICATION COST CRITICAL RULE:
Use ONE-TIME purchase costs, NOT monthly recurring costs.

Example thought process:
- "Sertraline 30-day supply typically costs $20-50 at pharmacy"
- ✅ Use range: "$20-50" (one-time purchase)
- ❌ NOT "$10-25/month" (monthly recurring)

Consider: Generic vs brand pricing, insurance vs out-of-pocket
```

**For supplements_vitamins, natural_remedies, beauty_skincare**:
- Must include variants array with dosages
- Format: `{"amount": 200, "unit": "mg", "form": "capsule"}`
- Include 3-5 realistic variants

#### Required Fields by Category

Reference: `/Users/jackandrews/Desktop/wwfm-platform/components/goal/GoalPageClient.tsx` (CATEGORY_CONFIG lines 56-407)

**medications**:
- keyFields: `time_to_results`, `frequency`, `length_of_use`, `cost`
- arrayField: `side_effects`

**exercise_movement**:
- keyFields: `time_to_results`, `frequency`, `duration`, `cost`
- arrayField: `challenges`

**apps_software**:
- keyFields: `time_to_results`, `usage_frequency`, `subscription_type`, `cost`
- arrayField: `challenges`

**therapists_counselors**:
- keyFields: `time_to_results`, `session_frequency`, `session_length`, `cost`
- arrayField: `challenges`

**books_courses**:
- keyFields: `time_to_results`, `format`, `learning_difficulty`, `cost`
- arrayField: `challenges`

*(See full category list in rich-solution-prompt.ts)*

#### Dropdown Options Reference

**CRITICAL**: Values must match EXACT dropdown options (case-sensitive).

**Common fields**:

```
time_to_results:
["Immediately", "Within days", "1-2 weeks", "3-4 weeks", "1-2 months", "3-6 months", "6+ months"]

frequency (medications/supplements):
["Daily", "Twice daily", "Three times daily", "Every other day", "Weekly", "As needed"]

cost:
["Free/No cost", "Under $20", "$20-50", "$50-100", "$100-250", "$250-500", "Over $500"]

session_frequency:
["Weekly", "Bi-weekly", "Monthly", "Every few months", "As needed"]

side_effects (medications):
["None", "Nausea", "Headache", "Dizziness", "Drowsiness", "Insomnia", "Digestive issues",
 "Weight changes", "Sexual side effects", "Fatigue", "Dry mouth", "Increased anxiety (initially)"]

challenges (practices/apps):
["Time commitment", "Motivation", "Consistency", "Cost", "Access/availability",
 "Learning curve", "Physical limitations", "Lack of support", "Results take time"]
```

**Full dropdown reference**: `/Users/jackandrews/Desktop/wwfm-platform/FORM_DROPDOWN_OPTIONS_REFERENCE.md`

### STEP 4: Insert Solutions into Supabase

**Use MCP Tools**: `mcp__supabase__execute_sql`

For each validated solution with field distributions, insert directly into the production database.

#### 4.0: Check for Existing Solutions (Deduplication)

Before inserting, check if a similar solution already exists for this goal:

```sql
SELECT
  s.id,
  s.title,
  s.solution_category
FROM solutions s
JOIN goal_implementation_links gil ON gil.solution_id = s.id
WHERE gil.goal_id = 'your_goal_id'
  AND s.solution_category = 'category_you_plan_to_insert';
```

**If you find a very similar solution** (same concept, just different wording):
- ✅ **SKIP insertion** - we already have this solution for this goal
- 🔄 **Generate a different solution** to maintain variety

**Example**:
- Found: "Headspace meditation app" → Skip inserting "Headspace App"
- Found: "Sertraline" → Skip inserting "Sertraline (Zoloft)"
- Found: "CBT therapy" → OK to insert "CBT with licensed therapist" (more specific)

#### 4.1: Insert Solution Record

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
  'Sertraline (Zoloft)',
  'SSRI antidepressant commonly prescribed for generalized anxiety disorder and panic disorder',
  'medications',
  NOW(),
  NOW(),
  true
) RETURNING id;
```

**CRITICAL**: Save the returned `solution_id` - you'll need it for steps 4.2 and 4.3!

#### 4.2: Insert Variants (Only 4 Categories)

**ONLY if category is**: `medications`, `supplements_vitamins`, `natural_remedies`, `beauty_skincare`

```sql
INSERT INTO solution_variants (solution_id, amount, unit, form)
VALUES
  ('solution_id_from_4.1', 25, 'mg', 'tablet'),
  ('solution_id_from_4.1', 50, 'mg', 'tablet'),
  ('solution_id_from_4.1', 100, 'mg', 'tablet');
```

**Skip this step** for all other categories (they don't use variants).

#### 4.3: Create Goal-Solution Link

This links the solution to the goal with effectiveness rating + field distributions:

```sql
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
  'goal_id_from_assignment',
  'solution_id_from_4.1',
  4.3,
  'Multiple RCTs demonstrate 60-70% response rate for generalized anxiety with SSRIs. Cochrane review of 27 trials showed significant improvement over placebo with moderate effect size.',
  '{"time_to_results": {"mode": "3-4 weeks", "values": [{"value": "3-4 weeks", "count": 45, "percentage": 45, "source": "research"}, {"value": "1-2 weeks", "count": 30, "percentage": 30, "source": "studies"}], "totalReports": 100, "dataSource": "ai_training_data"}}'::jsonb,
  NOW(),
  NOW()
);
```

**CRITICAL**: The `aggregated_fields` JSONB column must contain ALL field distributions from Step 3.

#### 4.4: Verify Insertion

After each solution insertion, run a quick verification query:

```sql
SELECT
  s.title,
  s.solution_category,
  COUNT(sv.id) as variant_count,
  gil.effectiveness,
  jsonb_object_keys(gil.aggregated_fields) as field_names
FROM solutions s
LEFT JOIN solution_variants sv ON sv.solution_id = s.id
JOIN goal_implementation_links gil ON gil.solution_id = s.id
WHERE s.id = 'solution_id_from_4.1'
GROUP BY s.id, s.title, s.solution_category, gil.effectiveness, gil.aggregated_fields;
```

**Expected**:
- Title matches what you inserted
- Variant count = 3-5 (if dosage category) or 0 (if not)
- All required field names present

### STEP 5: Final Validation

After inserting ALL 10 solutions, run these validation queries:

#### Count Check
```sql
SELECT
  g.title,
  COUNT(gil.id) as solution_count
FROM goals g
LEFT JOIN goal_implementation_links gil ON gil.goal_id = g.id
WHERE g.id = 'your_goal_id'
GROUP BY g.id, g.title;
```
**Expected**: Should return exactly 10 solutions.

#### Percentage Sum Check
```sql
WITH field_sums AS (
  SELECT
    s.title,
    s.solution_category,
    jsonb_object_keys(gil.aggregated_fields) as field_name,
    (
      SELECT SUM((value->>'percentage')::int)
      FROM jsonb_array_elements(
        gil.aggregated_fields->jsonb_object_keys(gil.aggregated_fields)->'values'
      ) AS value
    ) as percentage_sum
  FROM goal_implementation_links gil
  JOIN solutions s ON s.id = gil.solution_id
  WHERE gil.goal_id = 'your_goal_id'
)
SELECT *
FROM field_sums
WHERE percentage_sum != 100;
```
**Expected**: Should return 0 rows (all fields sum to 100%).

### STEP 6: Output Summary Report

After completing database insertion and validation, provide a summary:

```markdown
## Generation Complete for [Goal Name]

### Solutions Inserted
- Total: 10/10
- Categories: [list categories used]
- Variants: X medications/supplements with Y total variants

### Validation Results
✅ All 10 solutions inserted successfully
✅ All field distributions have 5-8 options
✅ All percentages sum to 100%
✅ All variants inserted for dosage categories

### Quality Metrics
- Average effectiveness: X.X
- Evidence-based rationale: 10/10
- Laugh test pass: 10/10
- Category accuracy: 10/10

### Database IDs
[List solution_id for each inserted solution for reference]
```

---

## ✅ QUALITY GATES CHECKLIST

Before outputting JSON, verify ALL solutions pass:

### Solution-Level Checks
- [ ] Title passes friend test (no "like", "such as", generic prefixes)
- [ ] Has specific brand/program/method name (not category)
- [ ] Effectiveness 3.0-5.0 with evidence-based rationale
- [ ] Correct category (use checklist)
- [ ] Generic solutions ≤4.0, specific can exceed 4.0
- [ ] Max 2 solutions per concept

### Field-Level Checks (For EACH field)
- [ ] 5-8 options (minimum 4, never single 100%)
- [ ] **⚠️ CRITICAL: Percentages sum to exactly 100%** (verify math: 45+30+15+10=100)
- [ ] NO equal splits (25/25/25/25)
- [ ] NO mechanistic sequences (40/30/20/10)
- [ ] Values match dropdown options EXACTLY (case-sensitive)
- [ ] Most common value: 35-50%
- [ ] Evidence-based pattern (not random)
- [ ] Valid sources (research, studies, clinical_trials)
- [ ] totalReports = 100
- [ ] dataSource = "ai_training_data"
- [ ] **Re-verify percentage sum before moving to next field**

### Variant Checks (If dosage category)
- [ ] 3-5 variants with realistic amounts
- [ ] Correct units (mg, mcg, IU, g, ml)
- [ ] Correct forms (tablet, capsule, liquid, cream, etc.)

---

## 🎓 EXAMPLES OF PASS vs FAIL

### Example 1: Solution Title

❌ **FAIL**:
```json
{
  "title": "Prescription antidepressant like Sertraline (Zoloft)",
  "category": "medications"
}
```
Issues: "like" pattern, generic descriptor "Prescription antidepressant"

✅ **PASS**:
```json
{
  "title": "Sertraline (Zoloft)",
  "category": "medications"
}
```

### Example 2: Evidence-Based Field Distribution

❌ **FAIL - Mechanistic**:
```json
{
  "time_to_results": {
    "values": [
      {"value": "1-2 weeks", "percentage": 25},
      {"value": "3-4 weeks", "percentage": 25},
      {"value": "1-2 months", "percentage": 25},
      {"value": "3-6 months", "percentage": 25}
    ]
  }
}
```
Issue: Equal 25% splits - clearly programmatic

❌ **FAIL - Percentage Sum Error**:
```json
{
  "side_effects": {
    "values": [
      {"value": "Dryness", "percentage": 48},
      {"value": "Redness", "percentage": 35},
      {"value": "Peeling", "percentage": 28},
      {"value": "Sun sensitivity", "percentage": 22},
      {"value": "None", "percentage": 8}
    ]
  }
}
```
Issue: 48+35+28+22+8 = 141% (NOT 100%)

✅ **PASS - Evidence-Based**:
```json
{
  "time_to_results": {
    "mode": "3-4 weeks",
    "values": [
      {"value": "3-4 weeks", "count": 45, "percentage": 45, "source": "research"},
      {"value": "1-2 weeks", "count": 30, "percentage": 30, "source": "clinical_trials"},
      {"value": "6-8 weeks", "count": 15, "percentage": 15, "source": "studies"},
      {"value": "2-3 months", "count": 10, "percentage": 10, "source": "medical_literature"}
    ],
    "totalReports": 100,
    "dataSource": "ai_training_data"
  }
}
```
Why: Realistic distribution (45+30+15+10=100%) based on SSRI clinical patterns

### Example 3: Category Selection

❌ **FAIL - Miscategorized**:
```json
{
  "title": "Nicotine replacement patches",
  "description": "FDA-approved patches that deliver nicotine transdermally",
  "category": "habits_routines"
}
```
Issue: Medical product with dosage → should be medications

✅ **PASS - Correct Category**:
```json
{
  "title": "Nicoderm CQ patches",
  "description": "FDA-approved nicotine patches that deliver 21mg, 14mg, or 7mg doses transdermally",
  "category": "medications",
  "variants": [
    {"amount": 21, "unit": "mg", "form": "patch"},
    {"amount": 14, "unit": "mg", "form": "patch"},
    {"amount": 7, "unit": "mg", "form": "patch"}
  ]
}
```

---

## 🚀 READY TO GENERATE

You now have complete instructions. For your assigned goal(s), complete the **FULL PIPELINE**:

1. **Generate** 10 high-quality solutions (Step 1)
2. **Validate** each solution (Step 2)
3. **Generate field distributions** for each (Step 3)
4. **Insert into Supabase** using MCP tools (Step 4)
5. **Validate database insertion** (Step 5)
6. **Report summary** (Step 6)

**Remember**:
- Evidence-based (NOT mechanistic)
- Specific (NOT generic categories)
- Laugh test (friend test)
- 5-8 options per field
- Exact dropdown compliance
- Insert directly into production database
- Validate after insertion
- Quality over speed

**Your $1000 budget allows for thorough, high-quality generation. Use it!**

**This is NOT a dry run - you are inserting real data into production!**
