# Phase Two: Generate Batch Distributions

**Run once per batch** (repeatable)

Generate complete field distributions for ONE BATCH of 5-10 solutions.

---

## Input

You will receive TWO inputs:

### 1. Solution List (`solution-list.json`)
The complete list from Phase One with all solution titles and categories.

### 2. Batch Range
Which solutions to work on in this execution.

**Example**: "Generate distributions for solutions 1-10"

---

## Your Task

Work through each solution in the specified range (e.g., indices 1-10).

### For Each Solution

#### Step 1: Load Solution Info (1 min)

From solution-list.json, get the solution at this index:
```json
{
  "index": 5,
  "title": "Lexapro",
  "solution_category": "medications"
}
```

#### Step 2: Look Up Required Fields (2 min)

Check `/home/user/wwfm-platform/docs/solution-fields-ssot.md` for this category's fields.

**Example for medications**:
- time_to_results
- frequency
- length_of_use
- cost
- side_effects

#### Step 3: Generate Description & Effectiveness (3 min)

Write:
- **description**: 2-3 sentences explaining this solution
- **avg_effectiveness**: 4.0-4.8 rating based on evidence

#### Step 4: Generate Field Distributions (15-20 min per solution)

For EACH required field:

**Process**:
1. Think through realistic options based on research/clinical knowledge
2. Create 5-8 distribution options with evidence-based percentages
3. **Validate immediately**: Do percentages sum to 100%?
4. Use exact dropdown values from `FORM_DROPDOWN_OPTIONS_REFERENCE.md`

**Format**:
```json
{
  "mode": "Most common value",
  "values": [
    {"value": "2-4 weeks", "count": 35, "percentage": 35, "source": "research"},
    {"value": "1-2 months", "count": 30, "percentage": 30, "source": "research"},
    {"value": "1-2 weeks", "count": 20, "percentage": 20, "source": "studies"},
    {"value": "3-6 months", "count": 10, "percentage": 10, "source": "studies"},
    {"value": "Less than 1 week", "count": 5, "percentage": 5, "source": "research"}
  ],
  "totalReports": 100,
  "dataSource": "ai_research"
}
```

**Critical quality checks per field**:
- ✅ Percentages sum to exactly 100%
- ✅ 5-8 options (no single value at 100%)
- ✅ Evidence-based patterns (not 25/25/25/25)
- ✅ Valid dropdown values
- ✅ Realistic variety

---

## Output

Create JSON file for this batch:

```json
{
  "batch_number": 1,
  "batch_range": "1-10",
  "goal_id": "56e2801e-0d78-4abd-a795-869e5b780ae7",
  "goal_title": "Reduce anxiety",
  "solutions": [
    {
      "index": 1,
      "title": "Lexapro",
      "description": "FDA-approved SSRI (escitalopram) for generalized anxiety disorder and panic disorder. Selective serotonin reuptake inhibitor that helps regulate mood by increasing serotonin levels.",
      "solution_category": "medications",
      "avg_effectiveness": 4.5,
      "aggregated_fields": {
        "time_to_results": {
          "mode": "2-4 weeks",
          "values": [
            {"value": "2-4 weeks", "count": 35, "percentage": 35, "source": "research"},
            {"value": "1-2 months", "count": 30, "percentage": 30, "source": "research"},
            {"value": "1-2 weeks", "count": 20, "percentage": 20, "source": "studies"},
            {"value": "3-6 months", "count": 10, "percentage": 10, "source": "studies"},
            {"value": "Less than 1 week", "count": 5, "percentage": 5, "source": "research"}
          ],
          "totalReports": 100,
          "dataSource": "ai_research"
        },
        "frequency": { ... },
        "length_of_use": { ... },
        "cost": { ... },
        "side_effects": { ... }
      }
    },
    {
      "index": 2,
      "title": "Cognitive Behavioral Therapy with licensed therapist",
      "description": "...",
      "solution_category": "therapists_counselors",
      "avg_effectiveness": 4.6,
      "aggregated_fields": {
        "time_to_results": { ... },
        "session_frequency": { ... },
        "session_length": { ... },
        "cost": { ... }
      }
    }
    // Continue for all solutions in batch (1-10)
  ]
}
```

**File naming**: `batch-1.json`, `batch-2.json`, etc.

---

## Completion

After generating all solutions in the batch, report:

```
✅ Phase Two Complete - Batch {N}

Solutions {start}-{end}: {count} solutions
- All field distributions generated
- All percentages validated (sum = 100%)
- All category fields included

Output: batch-{N}.json
```

**Example**:
```
✅ Phase Two Complete - Batch 1

Solutions 1-10: 10 solutions
- All field distributions generated
- All percentages validated (sum = 100%)
- All category fields included

Output: batch-1.json

Next: Execute Phase Two for Batch 2 (solutions 11-20)
```

---

## Time Estimate

**Per batch (8-10 solutions)**: 2-4 hours

Focus on quality over speed. Take breaks between batches.

---

**Save your output** - The user will collect all batch files for Phase Three.
