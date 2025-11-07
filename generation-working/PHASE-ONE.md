# Phase One: Generate Solution List

**Run once per goal**

Generate a complete list of solution titles and categories. Phase Two batches will fill in the details.

---

## Input

You will receive TWO files:

1. **`goal-info.json`** - Goal information (id, title, arena, solution count range)
2. **`existing-solutions-reference.json`** - Solutions already in database

The existing-solutions-reference.json contains:
```json
{
  "existing_solutions": [
    {"title": "Cognitive Behavioral Therapy", "solution_id": "...", "in_current_goal": true, "solution_category": "therapists_counselors"},
    {"title": "Lexapro", "solution_id": "...", "in_current_goal": false, "solution_category": "medications"}
  ],
  "gaps_to_fill": ["Need specific meditation apps", "Missing anxiety medications"],
  "target_new_count": 23
}
```

---

## Your Task

### Step 0: Review Existing Solutions (5 min)

**CRITICAL**: Read existing-solutions-reference.json FIRST

1. Note all solutions in `existing_solutions` array
2. **DO NOT recreate any of these solutions**
3. Focus on filling `gaps_to_fill`
4. Your target count = `target_new_count` (NOT the total)

**Example**:
- Total goal needs: 45 solutions
- Already exists: 22 solutions
- Your target: 23 NEW solutions

### Step 1: Classify Goal Scope (5 min)

Assess whether this goal is **niche**, **typical**, or **broad**:

- **Niche**: Specific condition, limited evidence-based treatments
  - Target: Lower third of range
  - Example: "Deal with tinnitus" → 15-20 solutions

- **Typical**: Common challenge, moderate solution variety
  - Target: Near typical value
  - Example: "Improve credit score" → 30-35 solutions

- **Broad**: Major challenge affecting millions, extensive evidence base
  - Target: Upper third approaching max
  - Example: "Reduce anxiety" → 40-50 solutions

**Consider**:
- Population size affected
- Diversity of solution categories available
- Research literature available

### Step 2: Determine Target Count (2 min)

Based on classification, choose a specific number within the min-max range.

### Step 3: Generate Solution Titles (15-20 min)

Using your knowledge of effective solutions for this goal:

**CRITICAL DEDUPLICATION RULES**:
1. **Check existing-solutions-reference.json FIRST**
2. **DO NOT include any solution from existing_solutions array**
3. **Focus on filling gaps_to_fill**

**Title Specificity Rules**:

✅ **GOOD Examples**:
- "Lexapro (escitalopram)" - specific medication with generic name
- "Headspace" - specific branded app
- "4-7-8 Breathing Technique" - specific technique with method
- "The Anxiety and Phobia Workbook by Edmund Bourne" - specific book with author
- "StrongLifts 5x5" - specific program name

❌ **BAD Examples - Too Generic**:
- "SSRIs" - category, not specific medication
- "Meditation apps" - category, not specific app
- "Deep breathing" - too vague, no specific technique
- "Running" - too generic, need specific program/method
- "Strength training" - too vague, need specific program

**Category Name Stripping Rules**:

✅ **GOOD - Clean Titles**:
- "Cognitive Behavioral Therapy" (NOT "CBT with licensed therapist")
- "Lexapro" (NOT "Lexapro medication")
- "Headspace" (NOT "Headspace meditation app")
- "Psychiatrist" (NOT "Psychiatrist for medication management")

❌ **BAD - Redundant Category Names**:
- "CBT with licensed therapist" (category already known: therapists_counselors)
- "Psychiatrist for medication management" (redundant - that's what psychiatrists do)
- "Running or jogging routine" (over-specified - just "Couch to 5K" or specific program)

**Think through categories**:
- medications, therapists_counselors, apps_software
- supplements_vitamins, exercise_movement, meditation_mindfulness
- books_courses, habits_routines, natural_remedies
- products_devices, groups_communities, etc.

**Ensure diversity**:
- Multiple categories represented
- Mix of approaches (medical, therapeutic, lifestyle, etc.)

**Quality checks**:
- ✅ Evidence-based for this goal
- ✅ Pass "laugh test" (real, credible solutions)
- ✅ No duplicates (check against existing_solutions)
- ✅ Specific implementations (not categories or generic terms)
- ✅ No category names in title (they're redundant)

---

## Output

Create JSON file with this exact structure:

```json
{
  "goal_id": "56e2801e-0d78-4abd-a795-869e5b780ae7",
  "goal_title": "Reduce anxiety",
  "classification": "broad",
  "target_count": 45,
  "solutions": [
    {
      "index": 1,
      "title": "Lexapro",
      "solution_category": "medications"
    },
    {
      "index": 2,
      "title": "Cognitive Behavioral Therapy with licensed therapist",
      "solution_category": "therapists_counselors"
    },
    {
      "index": 3,
      "title": "Headspace",
      "solution_category": "apps_software"
    }
    // Continue for ALL solutions (45 in this example)
  ]
}
```

**Critical**:
- Include sequential `index` (1, 2, 3, ..., 45)
- All target_count solutions included
- No gaps in numbering

---

## Batching Plan

After generating the list, suggest batch groups:

**For 45 solutions**:
- Batch 1: Solutions 1-10
- Batch 2: Solutions 11-20
- Batch 3: Solutions 21-30
- Batch 4: Solutions 31-40
- Batch 5: Solutions 41-45

**For other counts**:
- Batches of 8-10 solutions each
- Final batch can be smaller (5-7 solutions)

---

## Completion

Output the complete JSON and report:

```
✅ Phase One Complete

Goal: {goal_title}
Classification: {niche/typical/broad}
Total solutions: {target_count}

Suggested batches:
- Batch 1: Solutions 1-10
- Batch 2: Solutions 11-20
...

Next: Execute Phase Two for each batch
```

---

**Save your output** - The user will provide this solution-list.json as input to Phase Two.
