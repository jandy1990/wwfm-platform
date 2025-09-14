# Archived Scripts

This directory contains scripts that were used for historical fixes and debugging but are no longer needed for regular operations.

## duplicate-fix-2024-09/
Scripts used to debug and fix the duplicate dropdown values issue in September 2024.
- **Root cause**: AI solution generator created duplicate values in source data
- **Solution**: Source deduplication + proper value mapping in transfer script
- **Status**: Fixed by `fix-source-data-duplicates.ts` and updated `transfer-ai-distributions-to-aggregated-fields.ts`

## migrations-2024-08/
Scripts used for database migrations and data structure changes in August 2024.
- **Context**: Major refactoring of solution fields and aggregation system
- **Status**: One-time migrations completed
- **Note**: These scripts should not be run again

## Guidelines
- **Don't delete**: Keep for historical reference and rollback scenarios
- **Don't run**: These scripts may conflict with current data structure
- **Documentation**: Each script contains comments explaining its original purpose