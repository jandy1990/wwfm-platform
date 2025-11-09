# Phase Zero: Start Here

Welcome. You will generate high-quality solutions through a batched process.

---

## Process Overview

**3 Phases**:

1. **Phase One** (run once): Generate solution list → Output: solution-list.json
2. **Phase Two** (run 5-6 times): Generate distributions for ONE BATCH of 5-10 solutions → Output: batch-N.json
3. **Phase Three** (run once): Merge batches, validate, finalize → Output: final-output.json

Each phase execution is **stateless** - all inputs provided upfront, all outputs returned.

---

## Goal Information

You will receive: `/home/user/wwfm-platform/generation-working/goal-info.json`

Contains:
```json
{
  "goal_id": "uuid",
  "goal_title": "Goal name",
  "goal_description": "Description",
  "arena": "Arena name",
  "solution_count_range": {
    "min": 15,
    "max": 50,
    "typical": 35
  }
}
```

---

## Critical Quality Standards

### ⚠️ No Generator Scripts
Generate all data **manually** using your AI knowledge of research literature, clinical evidence, and real-world patterns.

### Quality Rules
- **Evidence-based**: From research/clinical knowledge, not formulas
- **Specific solutions**: "Lexapro" not "SSRIs", "Headspace" not "meditation apps"
- **Realistic distributions**: 5-8 options per field
- **All percentages = 100%**: Validate immediately after each field
- **No mechanistic patterns**: No 25/25/25/25 or 40/30/20/10 splits
- **Exact dropdown values**: Case-sensitive match to reference file

---

## Required Reference Files

Before starting, review:

1. **Category Fields**: `/home/user/wwfm-platform/docs/solution-fields-ssot.md`
   - Shows which fields each category requires

2. **Dropdown Values**: `/home/user/wwfm-platform/FORM_DROPDOWN_OPTIONS_REFERENCE.md`
   - Exact values that form dropdowns accept

3. **Master Instructions** (optional): `/Users/jackandrews/Desktop/wwfm-platform/scripts/claude-web-generator/CLAUDE_WEB_MASTER_INSTRUCTIONS.md`
   - Complete quality pipeline details

---

## Ready?

When you've read this, proceed to **PHASE-ONE.md**
