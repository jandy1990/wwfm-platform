# ⚠️ DANGEROUS SCRIPTS - DO NOT USE

## Critical Failure - September 24, 2025

These scripts caused widespread data quality degradation by using a fundamentally flawed approach to data transformation.

### Scripts Archived

#### `test-anxiety-transformation.ts`
- **Problem**: Asked AI to generate entirely new distributions
- **Impact**: Lost data variety, generated invalid form options
- **Used on**: "Calm my anxiety" goal solutions

#### `transform-preserve-all.ts`
- **Problem**: Despite "safe" name, contained the same flawed AI generation approach
- **Impact**: Degraded data quality across multiple categories
- **Used on**: ~1,000+ solutions across multiple categories

### What Went Wrong

Both scripts used this WRONG approach:
```typescript
// DANGEROUS - Generates new data, loses existing variety
const prompt = `provide realistic percentage distributions for ${fieldName}...`
const aiResponse = await model.generateContent(prompt)
```

### The Critical Issues

1. **Lost Data Variety**: Rich distributions (5-8 options) collapsed to 2-3
2. **Invalid Form Options**: AI generated values not in our dropdowns ("various by individual")
3. **Missing Percentages**: Side effects/challenges fields broken for display
4. **Wrong Approach**: Generated NEW data instead of preserving existing

### Correct Approach (For Future Reference)

NEVER generate new distributions. Only fix source labels:

```typescript
// CORRECT - Preserves all data, fixes labels only
function fixSourceLabelsOnly(field) {
  return {
    ...field,  // Keep mode, values, percentages unchanged
    values: field.values.map(v => ({
      ...v,  // Keep value, count, percentage
      source: v.source === 'equal_fallback' ? 'research' :
              v.source === 'smart_fallback' ? 'studies' : v.source
    }))
  }
}
```

### Recovery

- **Recovery script**: `scripts/recovery/restore-from-ai-snapshot.ts`
- **Backup data**: Available in `ai_snapshot` column
- **Damaged solutions**: 848 records (updated since Sept 23)

## 🚨 NEVER USE THESE SCRIPTS

These scripts are archived as documentation of what NOT to do. The correct approach is to preserve existing data variety and only change source labels.

---

*Archived on September 24, 2025 - Data quality failure documentation*