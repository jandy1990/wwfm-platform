# Common Pitfalls to Avoid

Quick reference for mistakes to watch out for during generation.

---

## ❌ Generic Solution Names

**Wrong**: "SSRIs", "Therapy", "Meditation apps"
**Right**: "Lexapro", "Cognitive Behavioral Therapy with licensed therapist", "Headspace"

**Why**: Generic solutions vary widely in quality and effectiveness. We want specific implementations users can actually try.

---

## ❌ Mechanical Percentage Splits

**Wrong**: 25/25/25/25 or 40/30/20/10
**Right**: 38/25/22/8/5/2 or 42/28/18/8/4

**Why**: Real-world data is never perfectly distributed. Evidence-based patterns show skewed distributions.

---

## ❌ Forgetting Percentage Validation

**Wrong**: Moving on without checking sums
**Right**: After each field, verify: 38+25+22+8+5+2 = 100 ✓

**Why**: Database will accept invalid data, but frontend will display incorrectly.

---

## ❌ Wrong Array Field

**Wrong**: Using `challenges` for medications
**Right**:
- `side_effects`: medications, supplements, natural_remedies, beauty_skincare, alternative_practitioners, medical_procedures
- `challenges`: all other categories

**Why**: Frontend expects specific array field names per category. Wrong field = data won't display.

---

## ❌ Mixing Up Frequency Field Names

**Wrong**: Using `frequency` for meditation category
**Right**:
- `frequency`: medications, supplements, natural_remedies, exercise, hobbies
- `session_frequency`: therapists, coaches, alternative_practitioners
- `usage_frequency`: apps, products
- `practice_frequency`: meditation (not practice_length!)

**Why**: Each category has specific field names. Check solution-fields-ssot.md.

---

## ❌ Using Incorrect Dropdown Values

**Wrong**: "weekly" (lowercase)
**Right**: "Weekly" (exact case match)

**Why**: Form dropdowns are case-sensitive. "weekly" won't match "Weekly" and form will show empty.

---

## ❌ Single Value at 100%

**Wrong**: {"value": "Daily", "percentage": 100}
**Right**: Multiple options with varied percentages

**Why**: No solution is 100% uniform. Always show realistic variety (5-8 options).

---

## ❌ Missing Mode Value

**Wrong**: Forgetting to set `"mode": "..."`
**Right**: Always include mode (most common value)

**Why**: Frontend uses mode for quick display. Missing mode = degraded UX.

---

## ❌ Skipping Mid-Batch Validation

**Wrong**: Generating all 10 solutions then checking
**Right**: Validate after each solution or every 2-3 solutions

**Why**: Catches errors early. Fixing 1 solution is easier than fixing 10.

---

## ❌ Not Using Exact Dropdown Values

**Wrong**: "$10-$25/month" (added dollar signs where dropdown doesn't have them)
**Right**: "$10-25/month" (exact match to FORM_DROPDOWN_OPTIONS_REFERENCE.md)

**Why**: Frontend validation will fail if value doesn't exactly match dropdown.

---

## Quick Pre-Submission Checklist

Before marking batch complete:

✅ All solution titles are specific (not generic)
✅ All percentage sums = 100% (checked every field)
✅ All solutions have 5-8 options per field
✅ Correct array field used (side_effects vs challenges)
✅ Mode value set for every field
✅ Dropdown values exactly match reference file
✅ Evidence-based distributions (not mechanical)
✅ All required category fields present
