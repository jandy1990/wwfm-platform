# Targeted Improvement Strategy for Claude Web

**Context**: After testing bulk regeneration, we found AI quality has a ceiling. Instead of regenerating 220 goals, focus Claude Web on **specific high-value gaps**.

---

## Current Platform Status

**Overall Coverage**: 99.6% (227/228 goals have solutions)

**Distribution**:
- 0 solutions: 1 goal (0.4%)
- 1-5 solutions: 1 goal (0.4%)
- 6-10 solutions: 6 goals (2.3%)
- 11-15 solutions: 20 goals (7.8%)
- 16-20 solutions: 93 goals (36.2%)
- 21-30 solutions: 107 goals (41.6%)
- 30+ solutions: 29 goals (11.3%)

---

## Priority Targets (24 goals needing solutions)

### Tier 1: Critical Gaps (0-10 solutions) - 8 goals

| Goal | Arena | Current Count | Target | Priority |
|------|-------|---------------|--------|----------|
| **Reduce anxiety** | Feeling & Emotion | 0 | 45 | 🔴 CRITICAL |
| **Use skills for good** | Community | 1 | 20 | 🔴 CRITICAL |
| **Bounce back from firing** | Work & Career | 6 | 20 | 🟡 HIGH |
| **Reduce screen time** | Technology & Modern Life | 7 | 25 | 🟡 HIGH |
| **Practice meditation** | Personal Growth | 9 | 25 | 🟡 HIGH |
| **Support youth programs** | Community | 10 | 20 | 🟡 HIGH |
| **Think more positively** | Personal Growth | 10 | 25 | 🟡 HIGH |
| **Stop yo-yo dieting** | Physical Health | 10 | 25 | 🟡 HIGH |

### Tier 2: Low Coverage (11-14 solutions) - 16 goals

Fill to minimum threshold of 20 solutions each.

---

## Recommended Approach: Selective Fill

Instead of bulk regeneration, use Claude Web for **targeted gap filling**:

### For Each Goal:

**1. Analyze Current Solutions (5 min)**
```bash
# Query existing solutions for this goal
SELECT s.title, s.solution_category, gil.avg_effectiveness
FROM goal_implementation_links gil
JOIN solution_variants sv ON gil.implementation_id = sv.id
JOIN solutions s ON sv.solution_id = s.id
WHERE gil.goal_id = '<goal_id>'
ORDER BY s.solution_category;
```

**2. Identify Category Gaps**
- Which categories are missing? (e.g., no apps, no books, no medications)
- Which categories are underrepresented? (< 2 solutions)

**3. Generate Specific Additions (NOT full regeneration)**
- Ask Claude Web for: "Generate 10 additional solutions for [goal] focusing on [missing categories]"
- Ensure deduplication against existing solutions
- Focus on filling identified gaps

**4. Validation & Insertion**
- Validate titles (no generic terms)
- Run deduplication check
- Insert only if quality meets bar

---

## Estimated Effort

**Tier 1 (8 goals)**:
- Average gap: 15 solutions each
- Total additions: ~120 solutions
- Time: 8 hours (1 hour per goal)

**Tier 2 (16 goals)**:
- Average gap: 6 solutions each
- Total additions: ~100 solutions
- Time: 8 hours (30 min per goal)

**Total**: ~220 new solutions in 16 hours (vs 220 hours for bulk regeneration)

---

## Alternative: Even More Targeted

**Focus on the worst gaps only:**

1. **Reduce anxiety** (0 → 45 solutions) - 2 hours
2. **Use skills for good** (1 → 20 solutions) - 1 hour
3. **Bounce back from firing** (6 → 20 solutions) - 1 hour
4. **Reduce screen time** (7 → 25 solutions) - 1 hour
5. **Practice meditation** (9 → 25 solutions) - 1 hour

**Total**: 5 goals, ~100 new solutions, 6 hours

This gives you:
- 100% goal coverage (all goals have solutions)
- Better distribution (no goal < 20 solutions in priority arenas)
- Focused quality control
- Efficient use of free credits

---

## Quality Standards (CRITICAL)

**Before asking Claude Web to generate:**

✅ Provide existing-solutions-reference.json (deduplication)
✅ Identify specific category gaps to fill
✅ Set target count (e.g., "add 15 solutions")
✅ Emphasize: NO descriptions, specific titles only

**After Claude Web generates:**

✅ Validate titles (no generic terms)
✅ Check for duplicates against database
✅ Verify field distributions (5-8 options, percentages sum to 100%)
✅ Spot-check quality (realistic patterns)

---

## Recommendation

**Start with Tier 1, Goal 1-3:**

1. **Reduce anxiety** (biggest gap, most popular topic)
2. **Use skills for good** (only 1 solution - unacceptable)
3. **Bounce back from firing** (relevant to many users)

If quality is good and process works smoothly, continue. If quality issues persist, **stop and launch with existing data**.

Remember: **Real user data > better AI data**. The goal is to have enough solutions to launch, not perfect AI-generated coverage.
