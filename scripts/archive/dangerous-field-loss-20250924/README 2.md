⚠️ DANGER: DO NOT USE THESE SCRIPTS

These scripts cause field loss by only returning transformed fields
instead of preserving all existing fields.

## Problem Identified
The transformSolutionFields() function only returns fields that match FIELD_MAPPINGS,
discarding all other fields during database updates.

## Impact
- Lost startup_cost/ongoing_cost fields on ~200 solutions
- Violated core principle of preserving detailed field breakdowns
- Required recovery from ai_snapshot backup

## Scripts Archived
- `fix-ai-data-quality-final.ts` - Main transformation script that caused data loss
- `migrate-schema-preserve-fields.ts` - Schema migration with incomplete preservation
- `remove-fallback-data.ts` - Potential field deletion script

## Safe Replacements
Use scripts in `/scripts/safe/` instead:
- `transform-preserve-all.ts` - Safe transformation with field preservation
- `recover-from-snapshot.ts` - Recovery script for damaged solutions

## Key Lesson
ALWAYS use field preservation pattern:
```typescript
// WRONG - loses fields
solution_fields = transformedFields

// RIGHT - preserves fields
solution_fields = { ...existingFields, ...transformedFields }
```

Archived: September 24, 2025