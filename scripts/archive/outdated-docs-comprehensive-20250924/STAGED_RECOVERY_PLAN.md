# 📋 STAGED DATA RECOVERY PLAN

## Current Data Issues (September 24, 2025)

We have THREE distinct categories of data issues that require different approaches:

### 🔴 Category 1: Damaged Solutions (848 records)
- **Identification**: `updated_at >= '2025-09-23'` AND have `ai_snapshot`
- **Problem**: Data quality degraded by flawed transformation scripts
- **Solution**: Restore from `ai_snapshot` backup
- **Script**: `scripts/recovery/restore-from-ai-snapshot.ts`
- **Priority**: HIGH - These had good data that's now broken

### 🔴 Category 2: Critical Missing Fields (2,143 records)
- **Identification**: Solutions missing REQUIRED fields for their category
- **Problems Found**:
  - 781 medication/supplement solutions missing dosage_amount and dosage_frequency (100%!)
  - 903 solutions missing challenges field across categories
  - Various solutions missing other category-specific required fields
- **Solution**: Add missing required fields with evidence-based data
- **Script**: To be created - `scripts/add-missing-required-fields.ts`
- **Priority**: CRITICAL - These solutions are incomplete and unusable

### 🟡 Category 3: Mechanistic Fallback Solutions (~4,000 records)
- **Identification**: Have `solution_fields` with `source: 'equal_fallback'` or `'smart_fallback'`
- **Problem**: Source labels violate AI training data requirements
- **Solution**: Fix source labels ONLY, preserve all data
- **Script**: `scripts/safe/fix-source-labels-only.ts`
- **Priority**: MEDIUM - Data is correct, labels are wrong

### 🟠 Category 4: Empty Solutions (459 records)
- **Identification**: `solution_fields = {}` or NULL, no `ai_snapshot`
- **Problem**: Never had data generated
- **Top Categories**: supplements_vitamins (159), books_courses (83), exercise_movement (81)
- **Solution**: Generate initial evidence-based data
- **Script**: `scripts/generate-initial-data.ts` (to be created)
- **Priority**: LOW - Never had data, can wait

---

## 📊 Stage-by-Stage Recovery Plan

### STAGE 1: Recover Damaged Solutions ✅
**Goal**: Restore the 848 solutions damaged yesterday

```bash
# 1. Analyze what we'll recover (DRY RUN)
npx tsx scripts/recovery/restore-from-ai-snapshot.ts --dry-run

# 2. Test on anxiety goal first
npx tsx scripts/recovery/restore-from-ai-snapshot.ts --test-goal --dry-run
npx tsx scripts/recovery/restore-from-ai-snapshot.ts --test-goal

# 3. Verify results
# Check: http://localhost:3000/goal/56e2801e-0d78-4abd-a795-869e5b780ae7

# 4. Full recovery if test passes
npx tsx scripts/recovery/restore-from-ai-snapshot.ts
```

**Success Criteria**:
- Data variety restored (5-8 options per field)
- All percentages present
- Valid form dropdown options
- Frontend displays correctly

---

### STAGE 2: Add Missing Required Fields 🆘
**Goal**: Fix 2,143 solutions with critical missing fields

```bash
# 1. Create script to add missing required fields
# Focus on dosage fields for medications/supplements (781 solutions)
# And challenges field for other categories (903 solutions)

# 2. Test on small batch first
npx tsx scripts/add-missing-required-fields.ts --category medications --limit 10 --dry-run
npx tsx scripts/add-missing-required-fields.ts --category medications --limit 10

# 3. Process by field type
npx tsx scripts/add-missing-required-fields.ts --field dosage_amount --limit 500
npx tsx scripts/add-missing-required-fields.ts --field dosage_frequency --limit 500
npx tsx scripts/add-missing-required-fields.ts --field challenges --limit 500

# 4. Verify field addition (no overwriting existing data)
```

**Success Criteria**:
- All 781 medication/supplement solutions have dosage_amount and dosage_frequency
- All 903 solutions have challenges field
- Evidence-based data patterns match category requirements
- NO existing data overwritten

---

### STAGE 3: Fix Source Labels 🏷️
**Goal**: Fix ~4,000 solutions with mechanistic sources

```bash
# 1. Analyze solutions needing label fixes (DRY RUN)
npx tsx scripts/safe/fix-source-labels-only.ts --dry-run

# 2. Test on single goal
npx tsx scripts/safe/fix-source-labels-only.ts --test-goal --dry-run
npx tsx scripts/safe/fix-source-labels-only.ts --test-goal

# 3. Verify only labels changed (data preserved)
# Query database to confirm values/percentages unchanged

# 4. Process remaining solutions
npx tsx scripts/safe/fix-source-labels-only.ts --limit 1000  # Batch 1
npx tsx scripts/safe/fix-source-labels-only.ts --limit 1000 --offset 1000  # Batch 2
# Continue in batches...
```

**Success Criteria**:
- Source labels changed from `equal_fallback` → `research`
- Source labels changed from `smart_fallback` → `studies`
- ALL values, counts, percentages UNCHANGED
- Zero field loss

---

### STAGE 4: Generate Initial Data 🆕
**Goal**: Create data for 459 empty solutions

```bash
# 1. Create generation script with evidence-based distributions
# Uses patterns from scripts/evidence-based-distributions.ts

# 2. Test on small batch by category
npx tsx scripts/generate-initial-data.ts --category supplements_vitamins --limit 10 --dry-run
npx tsx scripts/generate-initial-data.ts --category supplements_vitamins --limit 10

# 3. Verify generated data quality
# - Check variety (5-8 options per field)
# - Validate against form dropdowns
# - Test frontend display

# 4. Process by category
npx tsx scripts/generate-initial-data.ts --category supplements_vitamins  # 159 solutions
npx tsx scripts/generate-initial-data.ts --category books_courses  # 83 solutions
npx tsx scripts/generate-initial-data.ts --category exercise_movement  # 81 solutions
# Continue with remaining categories...
```

**Success Criteria**:
- Evidence-based distributions (not equal splits)
- Valid form dropdown options
- Proper DistributionData format
- Frontend displays correctly

---

## 🎯 Execution Timeline

### Day 1: Recovery (TODAY - Critical)
- [ ] Morning: Stage 1 - Recover 848 damaged solutions
- [ ] Afternoon: Verify recovery success
- [ ] Document results

### Day 2: Critical Missing Fields
- [ ] Morning: Stage 2 - Create script to add missing required fields
- [ ] Afternoon: Add dosage fields to 781 medication/supplement solutions
- [ ] Verify no existing data overwritten

### Day 3: Label Fixes & Generation
- [ ] Morning: Stage 3 - Fix source labels (~4,000 solutions)
- [ ] Afternoon: Stage 4 - Generate initial data for 459 empty solutions
- [ ] Final quality check

---

## 📋 Progress Tracking

### Stage 1: Recovery ✅ COMPLETE
- [x] Dry run analysis complete (848 solutions identified)
- [x] Test on anxiety goal (limited recovery potential - only 16 solutions)
- [x] Full recovery executed successfully
- [x] **RESULTS: 847/848 solutions restored with rich data variety**
- [x] Verification: 895 solutions updated today
- [x] Results documented

### Stage 2: Missing Fields ⏳
- [ ] Script created (add-missing-required-fields.ts)
- [ ] Test batch processed (10 medications)
- [ ] Dosage fields added (781 solutions)
- [ ] Challenges field added (903 solutions)
- [ ] Other missing fields identified and added
- [ ] Validation complete - no data overwritten

### Stage 3: Label Fixes ⏳
- [ ] Script verified (preserves data)
- [ ] Test batch processed
- [ ] Batch 1 (1,000 solutions)
- [ ] Batch 2 (1,000 solutions)
- [ ] Batch 3 (1,000 solutions)
- [ ] Batch 4 (remaining)
- [ ] Final verification

### Stage 4: Initial Generation ⏳
- [ ] Script created with evidence patterns
- [ ] supplements_vitamins (159)
- [ ] books_courses (83)
- [ ] exercise_movement (81)
- [ ] habits_routines (41)
- [ ] products_devices (39)
- [ ] Others (56)
- [ ] Quality validation

---

## ⚠️ Critical Safety Rules

### For ALL Stages:
1. **Always dry-run first**
2. **Test on single goal/small batch**
3. **Verify results before proceeding**
4. **Never overwrite without backup**
5. **Preserve ALL existing data**

### Stage-Specific Rules:

**Stage 1 (Recovery)**:
- Only restore if `ai_snapshot` exists
- Validate data variety after restore
- Check frontend display

**Stage 2 (Labels)**:
- ONLY change source labels
- NEVER modify values/counts/percentages
- Validate field count unchanged

**Stage 3 (Generation)**:
- Use evidence-based distributions
- Match form dropdown options exactly
- Never overwrite existing data

---

## 📊 Validation Queries

### Check damaged solutions
```sql
SELECT COUNT(*), solution_category
FROM goal_implementation_links gil
JOIN solution_variants sv ON gil.solution_variant_id = sv.id
JOIN solutions s ON sv.solution_id = s.id
WHERE gil.updated_at >= '2025-09-23'
  AND gil.ai_snapshot IS NOT NULL
GROUP BY solution_category;
```

### Check empty solutions
```sql
SELECT COUNT(*), solution_category
FROM goal_implementation_links gil
JOIN solution_variants sv ON gil.solution_variant_id = sv.id
JOIN solutions s ON sv.solution_id = s.id
WHERE (gil.solution_fields = '{}' OR gil.solution_fields IS NULL)
  AND gil.data_display_mode = 'ai'
GROUP BY solution_category;
```

### Check mechanistic fallbacks
```sql
SELECT COUNT(*)
FROM goal_implementation_links
WHERE solution_fields::text LIKE '%equal_fallback%'
   OR solution_fields::text LIKE '%smart_fallback%';
```

---

## 🚀 Next Steps

1. **COMPLETED**: Stage 1 (Recovery) - 847/848 solutions restored ✅
2. **CRITICAL NEXT**: Stage 2 (Add Missing Fields) - 2,143 solutions need required fields
3. **Tomorrow**: Stage 3 (Label Fixes) - Fix source labels for ~4,000 solutions
4. **Day 3**: Stage 4 (Initial Generation) - Create data for 459 empty solutions

**Remember**: Quality over speed. Test thoroughly at each stage.

---

*Last Updated: September 24, 2025*
*Status: Stage 1 Ready to Execute*