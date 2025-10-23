# 🚨 RECOVERY PLAN - Data Quality Failure September 24, 2025

## Problem Overview
All solutions processed by transformation scripts on September 23-24 have suffered critical data quality degradation. The scripts used a fundamentally flawed approach that damaged existing data instead of fixing it.

## 📊 Damage Assessment

### Affected Solutions
- **Scope**: All solutions processed by yesterday's transformation runs
- **Estimated count**: ~1,000+ solutions across multiple categories
- **Categories affected**: apps_software, books_courses, habits_routines, medications, products_devices, beauty_skincare
- **Specific confirmed**: 63 solutions in "Calm my anxiety" goal (ID: 56e2801e-0d78-4abd-a795-869e5b780ae7)

### Types of Damage
1. **Data Variety Loss**: Rich distributions collapsed from 5-8 options to 2-3
2. **Invalid Options**: AI generated values not in form dropdowns ("various by individual")
3. **Missing Percentages**: Side effects/challenges fields lack display data
4. **Broken Frontend**: Invalid dropdown values will cause form/display failures

## 🎯 Recovery Strategy

### Phase 1: Immediate Damage Control ✅
- [x] Stop all running transformation scripts
- [x] Document failure in TRANSFORMATION_FAILURE.md
- [x] Update HANDOVER_SEPTEMBER_24.md with warnings
- [x] Archive dangerous scripts to prevent reuse

### Phase 2: Data Recovery (CRITICAL)

#### Option A: Backup Restoration (Preferred)
```sql
-- Restore from ai_snapshot if available
SELECT id, solution_fields
FROM ai_snapshot
WHERE id IN (
  SELECT id FROM goal_implementation_links
  WHERE updated_at >= '2025-09-23'
);
```

#### Option B: Source Label Fix Only (Safe Alternative)
```typescript
// CORRECT approach - preserve all data, fix source labels only
function fixSourceLabelsOnly(existingField: DistributionData): DistributionData {
  return {
    ...existingField,  // Preserve mode, totalReports, dataSource
    values: existingField.values.map(v => ({
      ...v,  // Preserve value, count, percentage
      source: v.source === 'equal_fallback' ? 'research' :
              v.source === 'smart_fallback' ? 'studies' : v.source
    }))
  }
}
```

### Phase 3: Validation & Testing

#### Pre-Recovery Validation
1. **Identify all damaged solutions**:
```sql
SELECT id, solution_fields, updated_at
FROM goal_implementation_links
WHERE updated_at >= '2025-09-23'
AND data_display_mode = 'ai';
```

2. **Backup current state** before recovery:
```sql
CREATE TABLE recovery_backup_20250924 AS
SELECT * FROM goal_implementation_links
WHERE updated_at >= '2025-09-23';
```

#### Post-Recovery Testing
1. **Form validation**: Verify all values exist in FORM_DROPDOWN_OPTIONS_REFERENCE.md
2. **Frontend testing**: Check solution cards display correctly
3. **Data completeness**: Ensure all fields have percentages for display

## 🛠️ Implementation Steps

### Step 1: Create Recovery Script (SAFE)
```typescript
#!/usr/bin/env tsx
/**
 * RECOVERY SCRIPT: Restore damaged solutions
 * SAFE: Only fixes source labels, preserves all existing data
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Restore from backup OR fix source labels only
async function recoverSolution(link: any) {
  const existingFields = link.solution_fields || {}

  // Option A: Restore from backup if available
  const { data: backupData } = await supabase
    .from('ai_snapshot')
    .select('solution_fields')
    .eq('id', link.id)
    .single()

  if (backupData?.solution_fields) {
    return backupData.solution_fields
  }

  // Option B: Fix source labels only (preserve everything else)
  const recoveredFields = {}
  for (const [fieldName, fieldValue] of Object.entries(existingFields)) {
    if (fieldValue && typeof fieldValue === 'object' && fieldValue.values) {
      recoveredFields[fieldName] = {
        ...fieldValue,
        values: fieldValue.values.map(v => ({
          ...v,
          source: v.source === 'equal_fallback' ? 'research' :
                  v.source === 'smart_fallback' ? 'studies' : v.source
        }))
      }
    } else {
      recoveredFields[fieldName] = fieldValue
    }
  }

  return recoveredFields
}
```

### Step 2: Validation Against Form Options
```typescript
import { FORM_DROPDOWN_OPTIONS } from './FORM_DROPDOWN_OPTIONS_REFERENCE'

function validateFieldOptions(category: string, fieldName: string, values: string[]) {
  const validOptions = FORM_DROPDOWN_OPTIONS[category]?.[fieldName]
  if (!validOptions) return { valid: true, issues: [] }

  const issues = values.filter(value => !validOptions.includes(value))
  return {
    valid: issues.length === 0,
    issues: issues.map(value => `Invalid option "${value}" for ${fieldName}`)
  }
}
```

### Step 3: Progressive Recovery
1. **Test on single goal first**: "Calm my anxiety"
2. **Validate results**: Check data quality and frontend display
3. **Expand by category**: Process remaining categories if test succeeds
4. **Final validation**: Complete quality analysis

## ⚠️ Critical Safety Rules

### Recovery Script Requirements
- **Field preservation**: Never delete or lose existing fields
- **Validation**: Check all values against form dropdown options
- **Backup**: Create backup before any changes
- **Testing**: Test on single goal before broad rollout
- **Rollback**: Have rollback plan if recovery fails

### What NOT To Do
❌ Ask AI to generate new distributions
❌ Modify existing percentages or counts
❌ Change field values without validation
❌ Process all solutions without testing first
❌ Skip backup creation

### What TO Do
✅ Restore from backup if available
✅ Only change source labels if no backup
✅ Preserve all existing data variety
✅ Validate against form dropdowns
✅ Test on single goal first

## 📋 Success Criteria

### Data Quality Restored
- **Data variety**: Return to 5-8 realistic options per field
- **Valid options**: All values match form dropdown options exactly
- **Complete percentages**: All fields have display data
- **Frontend working**: No broken displays or form validation errors

### Process Validation
- **Zero field loss**: All recovery operations preserve existing data
- **Form compatibility**: All values validated against dropdown options
- **Display integrity**: Frontend shows data correctly
- **User experience**: Solution cards display properly

## 🎯 Next Steps

1. **Create safe recovery script** (preserve data, fix labels only)
2. **Test on "Calm my anxiety" goal** (63 solutions)
3. **Validate results** (form options, frontend display, data quality)
4. **Expand recovery** if test succeeds
5. **Document lessons learned** for future prevention

## 📚 Reference Documents
- `TRANSFORMATION_FAILURE.md` - Complete failure analysis
- `FORM_DROPDOWN_OPTIONS_REFERENCE.md` - Valid form options for validation
- `HANDOVER_SEPTEMBER_24.md` - Updated with failure warnings

---

**Recovery Status**: Plan created, awaiting implementation
**Priority**: CRITICAL - Required before any user testing can proceed
**Approach**: Data preservation first, minimal changes, extensive validation

*Recovery must restore data quality while preventing any additional data loss.*