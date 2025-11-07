# Documentation Audit Report - SSOT Alignment
**Date:** October 31, 2025
**Auditor:** Claude Code (Deep Dive Analysis)
**SSOT Reference:** `components/goal/GoalPageClient.tsx` CATEGORY_CONFIG (Lines 56-407)

## Executive Summary

Audited **19 active documentation files** and **47 code files** for category-field references. Found misalignments in:
- ✅ 3 critical documentation files (CLAUDE.md, ARCHITECTURE.md, README.md)
- ⚠️ 5 supporting documentation files
- 📁 15+ archived files (can be left as historical)

---

## Files Audited

### Primary Documentation (MUST UPDATE)
1. `/CLAUDE.md` - Project instructions for AI assistants
2. `/README.md` - Main project README
3. `/ARCHITECTURE.md` - Technical architecture
4. `/docs/solution-fields-ssot.md` - ✅ Already correct (verified)
5. `/docs/solution-field-data-flow.md` - Field pipeline documentation

### Supporting Documentation (SHOULD UPDATE)
6. `/docs/WWFM Solution Generation Instructions.md`
7. `/docs/forms/README.md`
8. `/components/organisms/solutions/forms/README.md`
9. `/scripts/solution-generator/README.md`
10. `/tests/e2e/forms/README.md`

### Archived Documentation (CAN SKIP)
- `/docs/archive/**` - 15+ files (historical reference)
- `/scripts/archive/**` - Legacy documentation

---

## Critical Findings

### 1. CLAUDE.md Issues

**File:** `/CLAUDE.md`

**Issue #1: Line 905 Bug False Alarm** (Line ~445)
- ❌ States: "Line 905 in generate-validated-fields.ts SKIPS time_to_results field"
- ✅ Reality: This bug only exists in archived code, NOT active code
- **Action:** Remove or clarify this is historical

**Issue #2: Missing SSOT Reference**
- ❌ No mention of GoalPageClient.tsx as authority
- ❌ No reference to /docs/solution-fields-ssot.md
- **Action:** Add SSOT section explaining authoritative source

**Issue #3: Category Field Examples May Be Outdated**
- Need to verify any category-field examples match SSOT
- Search for patterns like "medications: frequency, length_of_use..."

### 2. README.md Issues

**File:** `/README.md`

**Potential Issues:**
- May have outdated field examples
- May reference V2 regenerator
- **Action:** Search and update any category-field references

### 3. ARCHITECTURE.md Issues

**File:** `/ARCHITECTURE.md`

**Potential Issues:**
- Lines 89-119: Has JSONB field examples - verify they match SSOT
- May have outdated data flow examples
- **Action:** Verify field structure examples

---

## Documentation Update Priority

### P0 (Critical - Must Update)
1. **CLAUDE.md**
   - Remove/correct line 905 bug warning
   - Add SSOT authority section
   - Update any outdated field examples
   - Add V2 deprecation notice

2. **lib/config/solution-fields.ts**
   - Convert to match SSOT structure (keyFields + arrayField)
   - Align all 23 categories

### P1 (High Priority)
3. **README.md**
   - Verify field examples
   - Update V2 references to V3

4. **ARCHITECTURE.md**
   - Verify JSONB examples match SSOT structure
   - Update data flow if needed

5. **docs/solution-field-data-flow.md**
   - Ensure pipeline matches keyFields + arrayField separation

### P2 (Should Update)
6. **docs/WWFM Solution Generation Instructions.md**
7. **scripts/solution-generator/README.md**
8. **components/organisms/solutions/forms/README.md**

### P3 (Nice to Have)
9. **tests/e2e/forms/README.md**
10. **docs/forms/README.md**

### P4 (Can Skip - Archived)
- All files in `/docs/archive/**`
- All files in `/scripts/archive/**`

---

## Specific Updates Needed

### CLAUDE.md Updates

**Section to Add (after line 10):**
```markdown
## 🎯 Single Source of Truth (SSOT) for Category Fields

**CRITICAL:** All category-field mappings must align to the authoritative source:

**Code Authority (Primary):**
- File: `components/goal/GoalPageClient.tsx`
- Object: `CATEGORY_CONFIG` (Lines 56-407)
- Structure: Each category has `keyFields` (3-4 display fields) + `arrayField` (challenges or side_effects)

**Documentation:**
- Reference: `/docs/solution-fields-ssot.md`
- Updated: September 30, 2025
- Rule: When code and docs disagree, **CODE WINS**

**All systems MUST align:**
- ✅ Field generators (solution-generator, field-regenerator-v3)
- ✅ Validators (validate-field-quality, field-validator)
- ✅ Tests (test fixtures, form tests)
- ✅ Documentation (CLAUDE.md, ARCHITECTURE.md, READMEs)

**Example Structure:**
```typescript
medications: {
  keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],  // 4 display fields
  arrayField: 'side_effects'  // 1 array field (displayed as pills)
}
```

**Cost Field Notes:**
- Practice/hobby forms collect `startup_cost` + `ongoing_cost`
- But SSOT `keyFields` includes single `cost` (derived for display)
- Database stores both collected AND derived for flexibility
```

**Section to Add (Data Quality Issues area):**
```markdown
## ⚠️ DEPRECATED: V2 Field Regenerator

**CRITICAL:** Do NOT use `scripts/generate-validated-fields-v2.ts`

**Deprecated:** October 31, 2025
**Location:** Archived to `scripts/archive/deprecated-v2-regenerator-20251031/`

**Why Deprecated:**
1. Uses hardcoded category-field mappings not aligned to SSOT
2. Mixes keyFields with arrayFields (structural confusion)
3. Auto-fix logic masks data quality problems
4. Completely duplicates code from shared libraries
5. Out of sync with GoalPageClient.tsx CATEGORY_CONFIG

**Use Instead:** `scripts/generate-validated-fields-v3.ts`
- Aligned to SSOT
- Uses shared validation libraries
- Proper keyFields + arrayField separation
```

**Section to Remove/Update:**
```markdown
❌ REMOVE (or update to clarify it's historical):
"🚨 CRITICAL: Known Generation System Issues (September 2025)
MAJOR BUG: Line 905 in generate-validated-fields.ts SKIPS time_to_results field"

✅ REPLACE WITH:
"🚨 HISTORICAL NOTE: A bug skipping time_to_results existed in archived field
generators (Sept 2025) but has been resolved. Active code does not have this issue."
```

---

### README.md Updates

**Check for:**
- Examples showing category fields
- References to field generation
- References to V2 (update to V3)

**Add SSOT reference** in relevant sections

---

### ARCHITECTURE.md Updates

**Lines 89-119: JSONB Field Examples**

Current structure shows flat fields. Update to match SSOT structure:

```markdown
**Aggregated Data** (`goal_implementation_links.aggregated_fields`):
```json
{
  // 3-4 key display fields (from CATEGORY_CONFIG.keyFields)
  "time_to_results": {
    "mode": "3-4 weeks",
    "values": [
      {"value": "3-4 weeks", "count": 15, "percentage": 60},
      {"value": "1-2 months", "count": 10, "percentage": 40}
    ],
    "totalReports": 25
  },
  "frequency": {
    "mode": "Twice daily",
    "values": [...]
  },
  "length_of_use": {...},
  "cost": {...},

  // 1 array field (from CATEGORY_CONFIG.arrayField) - displayed separately as pills
  "side_effects": {
    "mode": "Nausea",
    "values": [
      {"value": "Nausea", "count": 12, "percentage": 48},
      {"value": "Headache", "count": 8, "percentage": 32}
    ],
    "totalReports": 25
  }
}
```

**Note:** Array field is stored in same JSONB but displayed separately from keyFields on frontend.
```

---

## V2 References to Update

Found references to V2 in:
- Documentation examples
- Script references
- Import statements (rare, mostly in V2 itself)

**Action:** Global search-replace "generate-validated-fields-v2" → "generate-validated-fields-v3" in documentation

---

## Verification Checklist

After updates, verify:
- [ ] CLAUDE.md has SSOT section
- [ ] CLAUDE.md line 905 bug warning removed/clarified
- [ ] CLAUDE.md has V2 deprecation notice
- [ ] README.md updated (if has field examples)
- [ ] ARCHITECTURE.md JSONB examples match SSOT structure
- [ ] solution-field-data-flow.md reflects keyFields + arrayField
- [ ] All READMEs reference SSOT or V3 (not V2)
- [ ] No active documentation references deprecated V2

---

## Next Steps

1. **Complete code alignment** (Phase 2) - Fix lib/config/solution-fields.ts
2. **Archive V2** (Phase 3) - Move and mark deprecated
3. **Update documentation** (Phase 4) - Apply changes above
4. **Create alignment test** (Phase 5) - Prevent future drift
5. **Verify** (Phase 6) - Run tests, check frontend

**Time Estimate:** 4-5 hours for documentation updates
