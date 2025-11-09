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
- side_effects (array field)

**QUICK ARRAY FIELD REFERENCE**:
- **side_effects**: medications, supplements_vitamins, natural_remedies, beauty_skincare, alternative_practitioners, medical_procedures
- **challenges**: all other categories

#### Step 3: Generate Effectiveness ONLY (1 min)

⚠️ **DO NOT GENERATE DESCRIPTIONS** - User doesn't want them

Write ONLY:
- **avg_effectiveness**: 4.0-4.8 rating based on evidence

**Example**:
```json
{
  "title": "Lexapro (escitalopram)",
  "avg_effectiveness": 4.3
}
```

**Note**: Description field is NOT needed. Focus all effort on quality field distributions.

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

**COMPLETE EXAMPLE - Lexapro time_to_results**:
```json
{
  "mode": "3-4 weeks",
  "values": [
    {"value": "3-4 weeks", "count": 38, "percentage": 38, "source": "research"},
    {"value": "1-2 weeks", "count": 25, "percentage": 25, "source": "research"},
    {"value": "1-2 months", "count": 22, "percentage": 22, "source": "research"},
    {"value": "Within days", "count": 8, "percentage": 8, "source": "studies"},
    {"value": "3-6 months", "count": 5, "percentage": 5, "source": "studies"},
    {"value": "Still evaluating", "count": 2, "percentage": 2, "source": "research"}
  ],
  "totalReports": 100,
  "dataSource": "ai_research"
}
```
*Note: 38+25+22+8+5+2 = 100% ✓*

**Critical quality checks per field**:
- ✅ Percentages sum to exactly 100%
- ✅ 5-8 options (no single value at 100%)
- ✅ Evidence-based patterns (not 25/25/25/25)
- ✅ Valid dropdown values
- ✅ Realistic variety

**COMMON FIELD PATTERNS**:
- **cost**: Use exact dropdown values like "$10-25/month", "$25-50/month"
- **time_to_results**: Start with mode (most common), distribute realistically
- **frequency**: Most categories use "Daily", "3-4 times per week", "1-2 times per week"
- **Think**: Start with most common (30-50%), then add decreasing percentages

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
      "title": "Cognitive Behavioral Therapy",
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

## Mid-Batch Validation (RECOMMENDED)

**After every 2-3 solutions**, quick check:

1. **Percentage validation**: Spot-check last few fields sum to 100%
2. **Field count**: Each solution should have 5 fields (4 display + 1 array)
3. **Save progress**: Consider saving batch JSON incrementally

**Why**: Catches errors early rather than discovering issues after all 10 solutions.

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

**Per batch (10 solutions)**: 15-20 minutes (faster after first batch)

**Why faster than expected**:
- First batch: ~20-25 min (learning the patterns)
- Subsequent batches: ~15 min (familiar with format)
- Total for 45 solutions: ~2-3 hours (not 10-20 hours!)

**Tips for speed**:
- Copy/paste field structure from previous solutions
- Keep FORM_DROPDOWN_OPTIONS_REFERENCE.md open
- Use text editor with JSON validation
- Validate percentages as you go (not at end)

---

**Save your output** - The user will collect all batch files for Phase Three.
