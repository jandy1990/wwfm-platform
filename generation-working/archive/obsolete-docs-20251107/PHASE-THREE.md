# Phase Three: Merge & Validate

**Run once after all batches are complete**

Merge all batch files, validate completeness and quality, produce final output.

---

## Input

You will receive ALL batch files:
- `batch-1.json`
- `batch-2.json`
- `batch-3.json`
- `batch-4.json`
- `batch-5.json`
- etc.

---

## Your Task

### Step 1: Merge Batches (5 min)

Combine all batch files into a single solutions array:

1. Extract `solutions` array from each batch file
2. Combine in order (batch-1, batch-2, batch-3, etc.)
3. Verify index sequence is correct (1, 2, 3, ..., no gaps)

**⚡ EFFICIENCY TIP**: Use parallel tool calls wherever possible
- Read all 5 batch files in ONE message with 5 Read tool calls
- Run validation scripts concurrently
- This significantly speeds up Phase Three

### Step 2: Count Validation (2 min)

Check that total solutions matches target_count from Phase One.

**Report**:
- Expected: {target_count} solutions
- Found: {actual_count} solutions
- Status: ✅ Match / ❌ Mismatch

If mismatch, identify which solutions are missing by index.

### Step 3: Percentage Validation (10-15 min)

For EACH solution, for EACH field:
- ✅ Percentages sum to exactly 100%
- ✅ 5-8 distribution options present
- ✅ No single value at 100%

**If any field fails**:
- Report which solution (index + title)
- Report which field
- Report the percentage sum
- Fix it before proceeding

### Step 4: Category Field Validation (10 min)

For EACH solution, verify it has ALL required fields for its category:
- Check against `/home/user/wwfm-platform/docs/solution-fields-ssot.md`
- Ensure no missing fields
- Ensure no unexpected extra fields

**If any missing fields**:
- Report which solution (index + title)
- Report which fields are missing
- Add them with proper distributions before proceeding

### Step 5: Dropdown Value Validation (10 min)

Spot-check 10-15 random field values against `FORM_DROPDOWN_OPTIONS_REFERENCE.md`:
- Verify exact case match
- Verify value exists in dropdown options for that field

**If any invalid values found**:
- Report which solution, which field, which value
- Fix to match dropdown exactly

### Step 6: Category Distribution Check (5 min)

Review solution categories:
- List how many solutions in each category
- Verify reasonable diversity (not all one category)
- Note if any important categories are missing

---

## Final Output

Create the final JSON file:

```json
{
  "goal_id": "56e2801e-0d78-4abd-a795-869e5b780ae7",
  "goal_title": "Reduce anxiety",
  "classification": "broad",
  "target_count": 45,
  "actual_count": 45,
  "validation_summary": {
    "count_check": {
      "passed": true,
      "expected": 45,
      "actual": 45
    },
    "percentage_check": {
      "passed": true,
      "total_fields_checked": 225,
      "fields_with_errors": []
    },
    "category_fields_check": {
      "passed": true,
      "solutions_with_missing_fields": []
    },
    "dropdown_values_check": {
      "passed": true,
      "invalid_values": []
    }
  },
  "category_distribution": {
    "medications": 8,
    "therapists_counselors": 6,
    "apps_software": 5,
    "supplements_vitamins": 6,
    "exercise_movement": 5,
    "meditation_mindfulness": 5,
    "books_courses": 5,
    "habits_routines": 3,
    "natural_remedies": 2
  },
  "solutions": [
    {
      "index": 1,
      "title": "Lexapro",
      "description": "FDA-approved SSRI (escitalopram) for generalized anxiety disorder and panic disorder.",
      "solution_category": "medications",
      "avg_effectiveness": 4.5,
      "aggregated_fields": {
        "time_to_results": {
          "mode": "2-4 weeks",
          "values": [
            {"value": "2-4 weeks", "count": 35, "percentage": 35, "source": "research"},
            {"value": "1-2 months", "count": 30, "percentage": 30, "source": "research"}
          ],
          "totalReports": 100,
          "dataSource": "ai_research"
        },
        "frequency": { ... },
        "length_of_use": { ... },
        "cost": { ... },
        "side_effects": { ... }
      }
    }
    // All remaining solutions...
  ]
}
```

**File name**: `final-output.json`

**Critical**: The `aggregated_fields` is already in JSONB format ready for database insertion.

---

## Completion Report

Provide a comprehensive summary:

```
✅ Phase Three Complete

=== Summary ===
Goal: {goal_title}
Classification: {classification}
Solutions generated: {actual_count}/{target_count}

=== Validation Results ===
✅ Count matches target
✅ All percentages sum to 100%
✅ All category fields present
✅ Dropdown values valid
✅ No duplicate indices

=== Category Distribution ===
medications: 8 solutions
therapists_counselors: 6 solutions
apps_software: 5 solutions
supplements_vitamins: 6 solutions
exercise_movement: 5 solutions
meditation_mindfulness: 5 solutions
books_courses: 5 solutions
habits_routines: 3 solutions
natural_remedies: 2 solutions

Total: 45 solutions across 9 categories

=== Output ===
File: final-output.json
Ready for database insertion

=== All Phases Complete ===
The solution generation pipeline is finished.
Final output is validated and ready.
```

---

## Done!

All phases complete. The final JSON file is ready for database insertion by the user.
