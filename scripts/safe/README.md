# Safe Scripts Directory

## ✅ SAFE SCRIPTS - Use These Instead of Archived Dangerous Scripts

These scripts implement the **MANDATORY** field preservation pattern and ensure all data reflects AI training patterns.

### Available Scripts

#### 1. `recover-from-snapshot.ts` (Recovery)
**Purpose**: Restores lost fields from ai_snapshot backup
**Safety**: Preserves ALL existing fields while adding recovered ones
**Usage**: `npx tsx scripts/recovery/recover-from-snapshot.ts`

#### 2. `add-synthesized-fields.ts` (Enhancement)
**Purpose**: Adds cost/cost_type fields to old-schema solutions
**Safety**: Preserves startup_cost/ongoing_cost while adding synthesized fields
**Usage**: `npx tsx scripts/safe/add-synthesized-fields.ts`

#### 3. `transform-preserve-all.ts` (Transformation)
**Purpose**: Replaces mechanistic fallback data with AI training patterns
**Safety**: Preserves ALL fields, only transforms those with mechanistic sources
**Usage**: `npx tsx scripts/safe/transform-preserve-all.ts`

### Field Preservation Pattern (MANDATORY)

```typescript
// ✅ CORRECT - preserves all fields
const updated = { ...existingFields, ...newFields }

// ❌ WRONG - loses fields
const updated = newFields
```

### Data Requirements

All transformations ensure data reflects AI training patterns:
- ✅ Medical literature, clinical studies
- ✅ User research, surveys
- ✅ Evidence-based distributions
- ❌ Equal mathematical splits (mechanistic)
- ❌ Random percentages
- ❌ Smart fallbacks

### Validation

Every script includes:
- Field count validation (before ≤ after)
- Database transaction safety
- Error handling with rollback
- Progress reporting

### Architecture

```
scripts/
├── safe/           # ✅ Use these scripts
│   ├── README.md
│   ├── add-synthesized-fields.ts
│   └── transform-preserve-all.ts
├── recovery/       # ✅ Recovery tools
│   └── recover-from-snapshot.ts
└── archive/        # ⚠️ DO NOT USE
    └── dangerous-field-loss-20250924/
```

## 🚨 Never Use Archived Scripts

The scripts in `scripts/archive/dangerous-field-loss-20250924/` cause data loss by only returning transformed fields instead of preserving all existing fields.

## Success Metrics

- ✅ Zero field loss
- ✅ 100% AI training data patterns
- ✅ Field preservation validation
- ✅ Comprehensive error handling