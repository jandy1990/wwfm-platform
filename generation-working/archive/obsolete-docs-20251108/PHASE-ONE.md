# Phase One: Generate Solution List

**Run once per goal**

Generate a complete list of solution titles and categories. Phase Two batches will fill in the details.

---

## Input

You will receive: `goal-info.json`

Contains the goal information (id, title, arena, solution count range).

---

## Your Task

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

**Think through categories**:
- medications, therapists_counselors, apps_software
- supplements_vitamins, exercise_movement, meditation_mindfulness
- books_courses, habits_routines, natural_remedies
- products_devices, groups_communities, etc.

**Choose specific solutions**:
- ✅ Specific: "Lexapro", "Cognitive Behavioral Therapy", "Headspace"
- ❌ Generic: "SSRIs", "therapy", "meditation apps"

**Ensure diversity**:
- Multiple categories represented
- Mix of approaches (medical, therapeutic, lifestyle, etc.)

**Quality checks**:
- ✅ Evidence-based for this goal
- ✅ Pass "laugh test" (real, credible solutions)
- ✅ No duplicates
- ✅ Specific implementations, not categories

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
