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

## ⚠️ CRITICAL: Manual Generation Only

**DO NOT write a generator script.** Generate all solutions manually using your AI knowledge of:
- Research literature on anxiety treatments
- Clinical evidence and studies
- Real-world usage patterns
- Evidence-based distribution data

Scripts produce mechanistic/formulaic data. We need thoughtful, evidence-based generation for each solution.

---

## 📖 Master Instructions

**Read and follow ALL instructions in this file**:
`/Users/jackandrews/Desktop/wwfm-platform/scripts/claude-web-generator/CLAUDE_WEB_MASTER_INSTRUCTIONS.md`

Follow the pipeline through STEP 3, then output as JSON:
- STEP 0: Determine solution count (assess goal scope)
- STEP 1: Generate solutions
- STEP 2: Validate solutions
- STEP 3: Generate field distributions
- OUTPUT: Save all solutions as JSON file

---

## 🔑 Output Format

**Generate all solutions as JSON** and save to:
`/home/user/wwfm-platform/generation-working/reduce-anxiety-45-solutions.json`

The JSON will be inserted into the database separately. See `/home/user/wwfm-platform/generation-working/JSON_OUTPUT_INSTRUCTIONS.md` for complete format specification.

---

## ⚠️ Critical Requirements

### 1. Solution Count Assessment (STEP 0)

Before generating solutions, you MUST independently assess this goal and determine the appropriate solution count using the classification system in the master instructions.

**Your Task**:
1. Read the STEP 0 criteria in the master instructions
2. Classify "Reduce anxiety" as niche, typical, or broad
3. Determine the appropriate solution count within the arena range (15-50)
4. Provide your rationale

**Do NOT use any predetermined count** - use your own assessment based on:
- Goal scope and breadth
- Population affected
- Number of evidence-based solution categories available
- Research literature available

**Your Assessment Output Format**:
```json
{
  "classification": "niche|typical|broad",
  "target_count": <your determined number 15-50>,
  "rationale": "<your explanation for why this count is appropriate>"
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

### 4. Output JSON File

Save all solutions to:
`/home/user/wwfm-platform/generation-working/reduce-anxiety-45-solutions.json`

Format specification in: `/home/user/wwfm-platform/generation-working/JSON_OUTPUT_INSTRUCTIONS.md`

**Required structure:**
```json
{
  "goal_id": "56e2801e-0d78-4abd-a795-869e5b780ae7",
  "goal_title": "Reduce anxiety",
  "classification": "broad|typical|niche",
  "target_count": 45,
  "solutions": [
    {
      "title": "Solution Name",
      "description": "...",
      "solution_category": "category_name",
      "avg_effectiveness": 4.5,
      "aggregated_fields": { ... }
    }
  ]
}
```

**Final checklist:**
- ✅ All percentages sum to 100% for each field
- ✅ 5-8 distribution options per field
- ✅ All dropdown values match `FORM_DROPDOWN_OPTIONS_REFERENCE.md`
- ✅ Correct category fields for each solution
- ✅ All 45 solutions included

---

## ✅ Completion

When finished, confirm you've saved the JSON file to:
`/home/user/wwfm-platform/generation-working/reduce-anxiety-45-solutions.json`

The file will be validated and inserted into the database separately.
