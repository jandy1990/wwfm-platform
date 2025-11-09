# Deprecated Components Archive

**Date:** November 8, 2025
**Reason:** Code cleanup and refactoring

## Components in this archive

### SearchableBrowse.tsx

**Status:** ❌ DEPRECATED - Not used anywhere in the app

**Replaced by:**
- `components/templates/HybridBrowse.tsx` - Main browse page component
- `lib/hooks/useGoalSearch.ts` - Search logic extracted to reusable hook

**Why deprecated:**
During a refactor to improve separation of concerns, the search logic was extracted from SearchableBrowse into a custom hook (`useGoalSearch`). A new component (`HybridBrowse`) was created that uses this hook, providing better code organization and reusability.

The `/browse` page was updated to use `HybridBrowse` instead of `SearchableBrowse`, but the old file was never deleted, leading to confusion.

**History:**
- Original component: SearchableBrowse.tsx (search logic embedded)
- Refactor: Created useGoalSearch.ts hook + HybridBrowse.tsx component
- Migration: Updated /browse/page.tsx to import HybridBrowse
- Cleanup: SearchableBrowse.tsx archived November 2025

**Lesson learned:**
When refactoring components, always delete or archive the old version immediately to prevent confusion. Update all documentation references at the same time.

## How to prevent this in the future

1. **Delete immediately:** When replacing a component, delete or archive the old one in the same PR
2. **Update docs:** Search for all references to the old component in documentation
3. **Add deprecation markers:** If keeping temporarily, add clear `@deprecated` JSDoc comments
4. **Create component map:** Maintain a `docs/COMPONENT_MAP.md` showing active vs archived components
5. **Code review:** Check for unused imports and unreferenced files

## Related documentation

- [Component Map](/docs/COMPONENT_MAP.md) - Active component reference
- [ADDGOALHANDOVER.md](/ADDGOALHANDOVER.md) - Updated to reference correct components
