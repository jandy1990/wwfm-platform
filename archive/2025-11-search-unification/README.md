# Search Components Archive (November 9, 2025)

## What Was Archived

This directory contains search components that were deprecated and replaced during the search standardization effort.

### Archived Components

1. **HeaderSearch.tsx** - Desktop navigation search dropdown
2. **MobileSearchModal.tsx** - Mobile full-screen search modal

## Why They Were Archived

These components were replaced by **UnifiedSearchBar.tsx** (`components/organisms/UnifiedSearchBar.tsx`) which:

- Consolidates desktop and mobile search into a single component
- Uses shared utilities (useSearchDebounce, useSearchCache, calculateSearchScore)
- Adds goal request functionality to all search contexts
- Reduces code duplication by ~40%
- Maintains consistent UX across all search implementations

## Replacement

**Old usage:**
```typescript
import HeaderSearch from '@/components/organisms/HeaderSearch'
import MobileSearchModal from '@/components/organisms/MobileSearchModal'

// Desktop
<HeaderSearch className="hidden md:block ml-8" />

// Mobile
<MobileSearchModal
  isOpen={showMobileSearch}
  onClose={() => setShowMobileSearch(false)}
/>
```

**New usage:**
```typescript
import UnifiedSearchBar from '@/components/organisms/UnifiedSearchBar'

// Desktop
<UnifiedSearchBar variant="desktop" />

// Mobile
<UnifiedSearchBar
  variant="mobile"
  isOpen={showMobileSearch}
  onClose={() => setShowMobileSearch(false)}
/>
```

## DO NOT USE THESE FILES

⚠️ **These components are no longer maintained and should NOT be used in new or existing code.**

If you need search functionality, use **UnifiedSearchBar** instead.

## Related Changes

- Created shared utilities:
  - `lib/hooks/useSearchDebounce.ts`
  - `lib/hooks/useSearchCache.ts`
  - `lib/utils/searchScoring.ts`
- Updated `useGoalSearch` hook to use shared utilities
- Added goal request feature to all search implementations
- Updated Header component to use UnifiedSearchBar

## Migration Date

November 9, 2025

## Related Documentation

- `/docs/architecture/search-implementations.md` - Search architecture overview
- `ARCHITECTURE.md` - General system architecture
