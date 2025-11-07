# Flexible Solution Count System

**Implemented**: 2025-11-07
**Status**: Ready for testing

---

## Summary

Replaced fixed 10-solution limit with intelligent, arena-based flexible count system that generates 10-50 solutions based on goal scope.

## Implementation

### 1. Arena-Based Ranges (config.ts)

Added `SOLUTION_COUNT_RANGES` with min/typical/max values for all 13 arenas:

| Arena | Min | Typical | Max | Rationale |
|-------|-----|---------|-----|-----------|
| Feeling & Emotion | 15 | 35 | **50** | Highest variety - mental health has extensive evidence-based solutions |
| Physical Health | 12 | 30 | **45** | High variety - medical + lifestyle approaches |
| Beauty & Wellness | 12 | 25 | 35 | Moderate-high - cosmetic + health approaches |
| Personal Growth | 15 | 30 | 40 | High variety - psychological + practical |
| Life Direction | 15 | 30 | 40 | High variety - career, purpose, identity |
| Relationships | 15 | 30 | 40 | High variety - therapy, books, practices |
| Socialising | 12 | 25 | 35 | Moderate-high variety |
| Work & Career | 12 | 25 | 35 | Moderate-high variety |
| Finances | 12 | 25 | 35 | Moderate variety |
| House & Home | 10 | 20 | 30 | Moderate variety |
| Technology | 10 | 20 | 30 | Lower variety - more niche |
| Community | 10 | 20 | 30 | Lower variety - more niche |
| Creativity | 10 | 20 | 30 | Lower variety - specialized skills |

### 2. Classification System (STEP 0)

Added new **STEP 0** to workflow that asks Claude to classify goals:

#### NICHE (min to mid-range)
- Specific medical conditions with limited treatments
- Specialized skills or hobbies
- Rare demographics
- **Examples**: "Deal with tinnitus", "Learn pottery", "Cover gray hair"
- **Range**: 10-18 solutions (depending on arena)

#### TYPICAL (mid to typical value)
- Common challenges with moderate variety
- Specific but affects many people
- **Examples**: "Improve credit score", "Stop nail biting", "Build home workout habit"
- **Range**: 18-30 solutions (depending on arena)

#### BROAD (typical to max)
- Major life challenges affecting millions
- Extensive evidence-based solutions across many categories
- **Examples**: "Reduce anxiety", "Sleep better", "Lose weight"
- **Range**: 35-50 solutions (depending on arena)

### 3. Required Output Format

Claude must provide assessment before generating:

```json
{
  "classification": "broad",
  "target_count": 48,
  "rationale": "Reduce anxiety is a major mental health challenge affecting millions globally. Has extensive evidence base across medications, therapy, apps, books, habits, meditation, exercise, and supplements - justifying high solution count."
}
```

Then generates exactly `target_count` solutions.

---

## Test Case: "Reduce Anxiety"

### Goal Metadata
- **Goal ID**: `56e2801e-0d78-4abd-a795-869e5b780ae7`
- **Title**: "Reduce anxiety"
- **Description**: "Calm my anxiety"
- **Arena**: Feeling & Emotion

### Arena Range
- **Min**: 15 solutions
- **Typical**: 35 solutions
- **Max**: 50 solutions

### Expected Classification: BROAD

**Why BROAD?**
1. **Major life challenge**: Anxiety affects ~40M adults in US alone (18% of population)
2. **Multiple solution categories**:
   - Medications (SSRIs, benzodiazepines, beta-blockers)
   - Therapy (CBT, EMDR, psychotherapy)
   - Apps (Headspace, Calm, BetterHelp)
   - Books (Anxiety Toolkit, Dare, DARE Response)
   - Meditation/mindfulness practices
   - Exercise (yoga, cardio, strength training)
   - Supplements (magnesium, L-theanine, ashwagandha)
   - Lifestyle (sleep hygiene, diet, caffeine reduction)
   - Products (weighted blankets, aromatherapy)
   - Habits (journaling, breathing exercises, grounding techniques)

3. **Extensive research**: Thousands of studies, clinical trials, established treatment protocols

### Expected Solution Count: 45-50

**Target**: 48 solutions
- Current baseline: 22 solutions (only 44% of what's justified)
- Database shows similar goals (Channel anger productively) have 121 solutions
- Research supports this volume for such a broad, well-studied topic

### Quality Comparison Test

**BEFORE** (Current 22 solutions):
- Fixed count regardless of goal importance
- Some categories under-represented
- Missing some evidence-based approaches

**AFTER** (Expected 45-50 solutions):
- Comprehensive coverage of all major categories
- Better distribution across medication types, therapy modalities, apps, books
- More specific implementations (e.g., multiple CBT variants, various SSRIs)
- Niche but effective solutions included (EFT tapping, neurofeedback)

**Comparison Metrics**:
1. **Solution Count**: 22 → 48 (2.2x increase)
2. **Category Coverage**: 11 → 15+ categories (broader representation)
3. **Per-Solution Quality**: Should maintain 98.6% pass rate
4. **Field Distribution Quality**: Same standards (5-8 options, 100% sums)
5. **Evidence-Based**: Same rigorous sourcing from training data

---

## Validation

### Automated Checks (Quality Gates)
- ✅ Classification in range (niche/typical/broad)
- ✅ `target_count` within arena min-max
- ✅ Rationale provided (2-3 sentences)
- ✅ Generated exactly `target_count` solutions
- ✅ All per-solution quality checks still pass

### Manual Review
- Does classification feel right for this goal?
- Is solution count justified based on available evidence?
- Are solutions spread across multiple categories?
- Any important solution types missing?

---

## Benefits

### 1. Appropriate Coverage
- Major goals get comprehensive solutions (45-50)
- Niche goals avoid padding (10-15)
- Typical goals balanced (25-30)

### 2. User Experience
- "Reduce anxiety" page shows extensive, credible options
- "Deal with tinnitus" page focused on actual treatments (not filler)
- Better matches user expectations

### 3. Platform Credibility
- Demonstrates deep knowledge of common challenges
- Realistic about niche conditions
- Professional, comprehensive resource

### 4. Scalability
- Works for any new goal automatically
- No manual classification needed
- Adapts to arena patterns

---

## Rollout Plan

### Phase 1: Test Goal ✅ IN PROGRESS
- Goal: "Reduce anxiety"
- Expected: 45-50 solutions
- Compare quality vs current 22 solutions
- Validate system works correctly

### Phase 2: High-Priority Goals (20 goals)
- Major mental health goals (anxiety, depression, stress)
- Weight loss, sleep, focus goals
- Expected: 35-50 solutions each
- Validation: Maintain quality at volume

### Phase 3: Full Platform (257 goals)
- All remaining goals
- Expected distribution:
  - ~50 goals → 40-50 solutions (broad)
  - ~120 goals → 25-35 solutions (typical)
  - ~87 goals → 10-20 solutions (niche)
- Total: ~7,500-9,000 solutions (up from ~6,100)

---

## Success Criteria

✅ **System Works**: Claude generates target_count within range
✅ **Quality Maintained**: 95%+ solutions pass all quality checks
✅ **Appropriate Counts**: Manual review confirms classifications feel right
✅ **Better Coverage**: Major goals have comprehensive solutions
✅ **No Padding**: Niche goals avoid low-quality filler

---

## Next Steps

1. ✅ **Implementation complete** - config.ts + master instructions updated
2. ⏳ **Run test** - Generate solutions for "Reduce anxiety" with flexible count
3. ⏳ **Quality analysis** - Compare 22 current vs 45-50 new solutions
4. ⏳ **Validation** - Confirm system produces appropriate counts
5. ⏳ **Decision** - Proceed to high-priority goals if test passes
