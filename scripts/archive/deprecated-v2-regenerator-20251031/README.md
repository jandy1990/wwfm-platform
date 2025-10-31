# Deprecated V2 Field Regenerator

**Archived:** October 31, 2025
**Reason:** Critical SSOT misalignment
**Replacement:** `scripts/generate-validated-fields-v3.ts`

---

## Why This Was Deprecated

The V2 field regenerator had **10 critical issues** that made it unsuitable for production use:

### 1. Wrong Category-Field Mappings (CRITICAL)

V2 used hardcoded mappings (lines 44-77) that didn't match the SSOT:

**SSOT Authority:** `components/goal/GoalPageClient.tsx` CATEGORY_CONFIG (Lines 56-407)

**Example Errors:**

| Category | V2 Hardcoded | SSOT keyFields | Issue |
|----------|--------------|----------------|-------|
| doctors_specialists | session_frequency, wait_time, cost, time_to_results | time_to_results, wait_time, insurance_coverage, cost | ❌ Has session_frequency, missing insurance_coverage |
| exercise_movement | frequency, cost, time_to_results | time_to_results, frequency, duration, cost | ❌ Missing duration |
| professional_services | session_frequency, session_length, cost, time_to_results | time_to_results, session_frequency, specialty, cost | ❌ Has session_length, missing specialty |
| support_groups | meeting_frequency, group_size, cost, time_to_results | time_to_results, meeting_frequency, format, cost | ❌ Has group_size, missing format |
| financial_products | financial_benefit, access_time, cost, time_to_results | time_to_results, financial_benefit, access_time, cost_type | ❌ Has cost, missing cost_type |

### 2. Structural Mismatch (CRITICAL)

**SSOT Structure:**
```typescript
medications: {
  keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],  // 4 display fields
  arrayField: 'side_effects'  // 1 array field (pills)
}
```

**V2 Structure:**
```typescript
medications: ['frequency', 'length_of_use', 'cost', 'time_to_results', 'side_effects']
// ❌ Flat list mixes display fields with array fields
// ❌ No separation between keyFields and arrayField
```

### 3. Auto-Fix Logic Masked Quality Issues (HIGH)

V2 had auto-fix logic (lines 320-362) that "corrected" invalid data:
- Converted string fields to distributions
- Mapped invalid dropdown values
- Fixed case mismatches

**Problem:** This masked underlying prompt/generation issues instead of fixing root causes.

### 4. Duplicated Code (HIGH)

V2 duplicated:
- Dropdown validation (vs using shared libs)
- Category mappings (vs using CATEGORY_FIELD_CONFIG)
- Value mapping logic (vs using value-mapper.ts)

**Result:** V2 drifted out of sync with shared libraries improvements.

### 5. Hardcoded Dropdown Values (MEDIUM)

V2 Lines 80-203: Hardcoded dropdown arrays

**Problem:** If actual form dropdowns changed, V2 didn't update automatically.

---

## Migration Guide

**If you have scripts calling V2:**

```bash
# OLD (V2 - deprecated):
tsx scripts/generate-validated-fields-v2.ts --goal-id=<uuid>

# NEW (V3 - use this):
tsx scripts/generate-validated-fields-v3.ts --goal-id=<uuid>
```

**V3 Advantages:**
- ✅ Aligned to SSOT (GoalPageClient.tsx)
- ✅ Uses shared libraries (`lib/ai-generation/fields/`)
- ✅ Proper keyFields + arrayField separation
- ✅ Better error handling with retries
- ✅ State management for resumption
- ✅ Backup system for data safety
- ✅ No hardcoded mappings

**V3 Options:**
```bash
tsx scripts/generate-validated-fields-v3.ts \
  --goal-id=<uuid> \
  --solution-limit 10 \              # Limit processing
  --field-filter cost,time_to_results \  # Specific fields only
  --dry-run \                        # Preview without changes
  --force-regenerate \               # Regenerate all
  --resume \                         # Resume from checkpoint
  --verbose                          # Detailed output
```

---

## Files in This Archive

1. **generate-validated-fields-v2.ts** - The deprecated regenerator
   - Lines 44-77: Hardcoded wrong field mappings
   - Lines 80-203: Hardcoded dropdown values
   - Lines 320-362: Auto-fix logic
   - **DO NOT USE**

---

## Historical Context

V2 was created before the SSOT document (`docs/solution-fields-ssot.md`) was established. At the time, there was no single authoritative source for category-field mappings, so V2 used best-guess hardcoded values.

**Timeline:**
- Sept 2025: V2 created with hardcoded mappings
- Sept 30, 2025: SSOT document created, GoalPageClient.tsx established as authority
- Oct 2025: V3 created using shared libraries aligned to SSOT
- Oct 31, 2025: V2 deprecated after deep-dive analysis revealed critical divergence

---

## Related Files Also Archived

None yet - this is the only V2-specific file.

If you find other scripts referencing V2, please archive them here and update this README.

---

## Questions?

If you need to understand WHY V2 was deprecated or what the specific issues were:

1. Read the deprecation notice in the file header
2. See `/reports/ssot-divergence-report-2025-10-31.md` for complete analysis
3. Compare V2's hardcoded mappings (lines 44-77) vs SSOT (`docs/solution-fields-ssot.md`)

For current field regeneration needs, use **V3** exclusively.
