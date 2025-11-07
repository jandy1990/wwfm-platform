# Claude Web Test Run: Generate Solutions for 4 Goals

You are tasked with generating high-quality solutions for 4 diverse goals to validate the WWFM solution generation system before scaling to 200 goals.

## Test Goals

Generate **10 solutions per goal** for these 4 goals:

### Goal 1: Reduce anxiety
- **Arena**: feeling-emotion
- **Description**: Calm my anxiety
- **Goal ID**: 56e2801e-0d78-4abd-a795-869e5b780ae7

### Goal 2: Get over dating anxiety
- **Arena**: relationships
- **Description**: Get over dating anxiety
- **Goal ID**: c826834a-bf7e-45d4-9888-7526b8d6cba2

### Goal 3: Lift heavier weights
- **Arena**: physical-health
- **Description**: 🏋️ Lift heavier weights
- **Goal ID**: 1be300b4-6945-45c0-946e-934f1443053e

### Goal 4: Land dream job
- **Arena**: work-career
- **Description**: Land dream job
- **Goal ID**: a660050e-780c-44c8-be6a-1cfdfeaaf82d

## Your Task

For EACH of the 4 goals above:

1. **Read the generation prompt**: `/Users/jackandrews/Desktop/wwfm-platform/scripts/claude-web-generator/prompts/rich-solution-prompt.ts`
2. **Generate 10 solutions** following ALL rules in the prompt
3. **Self-validate** each solution against the quality checklist
4. **Output format**: JSON array of 10 solutions per goal

## Critical Rules (Zero Tolerance)

### Title Rules:
1. ❌ NEVER use: "like", "such as", "e.g.", "for example", "including"
2. ❌ NEVER prepend generic descriptors: "Prescription X", "Therapy Y"
3. ❌ NEVER use conversational framing: "I tried", "I used"
4. ✅ BRANDS REQUIRED: Products need brand names ("Hatch Restore" not "white noise machine")
5. ✅ PARENTHESES: Only for medications ("Ambien (Zolpidem)"), NOT for specs ("(15-20 lbs)")
6. ✅ Pass the friend test: "Would I say this naturally?"

### Rating Rules:
- **Generic solutions (no brand) = Max 4.0**
  - Examples: "CBT", "Weighted blanket", "Yoga", "Meditation"
- **Specific solutions (has brand/program) = Can exceed 4.0**
  - Examples: "Sleepio", "YnM Weighted Blanket", "Melatonin 3mg"
- **Test**: Can you buy/sign up for THIS EXACT thing?
  - ❌ No → Generic → 4.0 max
  - ✅ Yes → Specific → 4.5+ OK

### Duplication Rules:
- Maximum 2 solutions per core concept
- If you already generated "Headspace" → Don't add "Headspace" again
- If you already generated 2 meditation solutions → No more meditation

### Category Rules:
- **Therapy category** requires: specific provider, program name, OR "with licensed therapist"
- ❌ Wrong: "Cognitive Behavioral Therapy" (therapy type)
- ✅ Right: "Sleepio CBT-I program" (specific program)
- ✅ Right: "CBT with licensed therapist" (has qualification)

## Output Format

For each goal, output:

```json
{
  "goal_id": "uuid",
  "goal_title": "Goal name",
  "solutions": [
    {
      "title": "Solution Name",
      "description": "1-2 sentence description",
      "category": "exact_category_string",
      "effectiveness": 3.0-5.0,
      "effectiveness_rationale": "Evidence-based explanation",
      "variants": []
    }
  ],
  "validation_summary": {
    "total": 10,
    "laugh_test_passes": 10,
    "generic_rating_violations": 0,
    "brand_name_compliance": 10,
    "duplicate_count": 0
  }
}
```

## Validation Checklist (Run After Generation)

For EACH goal's 10 solutions, verify:

- [ ] All titles pass friend test (natural, no banned patterns)
- [ ] All products have brand names
- [ ] No parentheses used for specs (only for medication generic names)
- [ ] Generic solutions rated ≤4.0
- [ ] Specific solutions can exceed 4.0 if evidence supports
- [ ] No more than 2 solutions per concept
- [ ] All categories are exact strings from category list
- [ ] All effectiveness rationales cite evidence

## Success Criteria

**Target**: 10/10 solutions pass validation for ALL 4 goals

If any solutions fail validation:
1. Report which solutions failed and why
2. Regenerate failed solutions
3. Re-validate

## Files to Reference

**Generation Prompt** (has all rules + examples):
`/Users/jackandrews/Desktop/wwfm-platform/scripts/claude-web-generator/prompts/rich-solution-prompt.ts`

**Validation Rules** (for self-checking):
`/Users/jackandrews/Desktop/wwfm-platform/scripts/claude-web-generator/prompts/validation-prompts.ts`

**Category Field Mappings** (required fields per category):
`/Users/jackandrews/Desktop/wwfm-platform/lib/config/solution-fields.ts`

## Expected Output

You should produce 4 JSON objects (one per goal), each containing:
- 10 validated solutions
- Validation summary showing 100% pass rate
- Any issues encountered and how you fixed them

**Estimated time**: 20-30 minutes for 4 goals (40 solutions total)

---

## Quick Start

1. Read the rich-solution-prompt.ts file to understand all rules
2. For Goal 1 (Reduce anxiety), generate 10 solutions
3. Self-validate all 10 solutions
4. If all pass, move to Goal 2
5. Repeat for all 4 goals
6. Report final results

**GO!**
