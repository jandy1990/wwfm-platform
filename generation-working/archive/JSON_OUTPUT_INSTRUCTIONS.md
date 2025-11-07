# Generate 45 Solutions as JSON

**Task**: Generate all 45 solutions manually as JSON. Output will be validated and inserted into the database separately.

## ⚠️ CRITICAL: No Generator Scripts

**DO NOT write a script to generate distributions.** This task requires:
- ✅ Manual generation using AI knowledge of research literature
- ✅ Evidence-based distributions from clinical studies
- ✅ Thoughtful, varied percentages reflecting real-world usage
- ✅ Each solution individually considered

**Why no scripts?** Scripts produce mechanistic data (equal splits, formulaic patterns). We need realistic, evidence-based distributions that reflect actual research and clinical knowledge.

---

## Output Format

Create a file called `reduce-anxiety-45-solutions.json` with this structure:

```json
{
  "goal_id": "56e2801e-0d78-4abd-a795-869e5b780ae7",
  "goal_title": "Reduce anxiety",
  "classification": "broad",
  "target_count": 45,
  "solutions": [
    {
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
        "frequency": {
          "mode": "Once daily",
          "values": [
            {"value": "Once daily", "count": 60, "percentage": 60, "source": "research"},
            {"value": "Twice daily", "count": 25, "percentage": 25, "source": "research"},
            {"value": "As needed", "count": 10, "percentage": 10, "source": "studies"},
            {"value": "Every other day", "count": 5, "percentage": 5, "source": "research"}
          ],
          "totalReports": 100,
          "dataSource": "ai_research"
        },
        "length_of_use": {
          "mode": "6-12 months",
          "values": [
            {"value": "6-12 months", "count": 40, "percentage": 40, "source": "research"},
            {"value": "3-6 months", "count": 30, "percentage": 30, "source": "research"},
            {"value": "1-2 years", "count": 20, "percentage": 20, "source": "studies"},
            {"value": "Less than 3 months", "count": 10, "percentage": 10, "source": "research"}
          ],
          "totalReports": 100,
          "dataSource": "ai_research"
        },
        "cost": {
          "mode": "$20-$50/month",
          "values": [
            {"value": "$20-$50/month", "count": 45, "percentage": 45, "source": "research"},
            {"value": "$10-$20/month", "count": 30, "percentage": 30, "source": "research"},
            {"value": "$50-$100/month", "count": 15, "percentage": 15, "source": "studies"},
            {"value": "Less than $10/month", "count": 10, "percentage": 10, "source": "research"}
          ],
          "totalReports": 100,
          "dataSource": "ai_research"
        },
        "side_effects": {
          "mode": "Nausea",
          "values": [
            {"value": "Nausea", "count": 35, "percentage": 35, "source": "research"},
            {"value": "Headache", "count": 25, "percentage": 25, "source": "research"},
            {"value": "Insomnia", "count": 20, "percentage": 20, "source": "studies"},
            {"value": "Fatigue", "count": 15, "percentage": 15, "source": "studies"},
            {"value": "Sexual side effects", "count": 5, "percentage": 5, "source": "research"}
          ],
          "totalReports": 100,
          "dataSource": "ai_research"
        }
      }
    },
    {
      "title": "Zoloft",
      "description": "...",
      "solution_category": "medications",
      "avg_effectiveness": 4.4,
      "aggregated_fields": { ... }
    }
    // ... 43 more solutions
  ]
}
```

---

## Critical Requirements

1. **All 45 solutions** - Complete generation following your STEP 0 assessment
2. **All percentages sum to 100%** for each field
3. **5-8 distribution options** per field (no single values at 100%)
4. **Correct category fields** - Check `FORM_DROPDOWN_OPTIONS_REFERENCE.md`
5. **Valid dropdown values** - Match exact format from reference
6. **Evidence-based distributions** - From research/studies, not mechanistic
7. **Quality validation** - Pass all STEP 2 checks (Laugh Test, Evidence-Based, etc.)

---

## Category Field Requirements

Each category needs specific fields. Examples:

**medications**: `time_to_results`, `frequency`, `length_of_use`, `cost`, `side_effects`
**therapists_counselors**: `time_to_results`, `session_frequency`, `session_length`, `cost`
**apps_software**: `time_to_results`, `usage_frequency`, `subscription_type`, `cost`
**meditation_mindfulness**: `time_to_results`, `practice_length`, `frequency`, `cost`
**exercise_movement**: `time_to_results`, `frequency`, `duration`, `cost`

See `/home/user/wwfm-platform/docs/solution-fields-ssot.md` for all 23 categories.

---

## Output File

Save your complete JSON to:
`/home/user/wwfm-platform/generation-working/reduce-anxiety-45-solutions.json`

Once you've generated this file, I'll:
1. Validate all 45 solutions
2. Check all percentage sums = 100%
3. Verify dropdown values
4. Insert into Supabase using MCP access
5. Confirm successful insertion

Proceed with generating all 45 solutions following the complete pipeline (STEP 0 through STEP 4).
