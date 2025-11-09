# Component Map

**Last Updated:** November 8, 2025

This document maps active components vs deprecated/archived components to prevent confusion during development.

---

## 🟢 Active Components

### Browse & Search System

#### `components/templates/HybridBrowse.tsx`
**Status:** ✅ ACTIVE - Primary browse page component
**Used In:** `/app/browse/page.tsx`
**Purpose:** Main browse interface with super-category navigation and goal search
**Key Features:**
- Uses `useGoalSearch` hook for search functionality
- Super-category selection and filtering
- Goal request integration (no-results button)
- Authentication-aware (login prompt vs request form)

**Dependencies:**
- `lib/hooks/useGoalSearch.ts` - Search logic
- `components/molecules/GoalRequestForm.tsx` - Request form modal
- `components/ui/LoginPromptModal.tsx` - Login prompt for anonymous users
- `lib/navigation/super-categories.ts` - Category grouping logic
- `lib/navigation/category-icons.ts` - Icon mapping

---

#### `lib/hooks/useGoalSearch.ts`
**Status:** ✅ ACTIVE - Reusable search hook
**Used In:** `HybridBrowse.tsx`, potentially other components
**Purpose:** Provides goal search functionality with debouncing, caching, and smart scoring
**Returns:**
```typescript
{
  searchQuery: string
  setSearchQuery: (query: string) => void
  isSearching: boolean
  showDropdown: boolean
  setShowDropdown: (show: boolean) => void
  suggestions: SearchSuggestion[]
  clearSearch: () => void
  searchContainerRef: React.RefObject<HTMLDivElement>
}
```

**Key Features:**
- 150ms debounce on search input
- 5-minute search cache
- Smart scoring (exact match > starts with > word match > contains)
- Shows dropdown for no-results case (enables goal request feature)

---

### Goal Request Feature

#### `components/molecules/GoalRequestForm.tsx`
**Status:** ✅ ACTIVE
**Used In:** `HybridBrowse.tsx`
**Purpose:** Modal form for users to request new goals
**Props:**
```typescript
{
  isOpen: boolean
  onClose: () => void
  searchQuery?: string  // Pre-fills title
}
```

**Key Features:**
- Pre-fills title from search query
- Character counters (title: 10-200, description: 20-500)
- Arena selection dropdown
- Email notification opt-in
- Real-time validation
- Mobile-friendly with safe area padding

---

#### `components/admin/GoalRequestReview.tsx`
**Status:** ✅ ACTIVE
**Used In:** `/app/admin/page.tsx`
**Purpose:** Admin interface to review and approve/reject goal requests
**Props:**
```typescript
{
  requests: GoalRequest[]
  categories: Category[]
}
```

**Key Features:**
- Lists pending requests in reverse chronological order
- Shows requester info, arena, description
- Approve button → Opens ApprovalModal
- Reject button → Prompts for reason, updates status
- Empty state when no pending requests

---

#### `components/admin/ApprovalModal.tsx`
**Status:** ✅ ACTIVE
**Used In:** `GoalRequestReview.tsx`
**Purpose:** Modal for approving goal requests with category selection
**Props:**
```typescript
{
  isOpen: boolean
  onClose: () => void
  request: GoalRequest
  categories: Category[]
  onApprove: (requestId, categoryId, adminNotes) => Promise<void>
  isProcessing: boolean
}
```

**Key Features:**
- Auto-filters categories by arena (if request has arena_id)
- Optional admin notes field
- Green-themed approval styling
- Mobile-friendly

---

### Server Actions

#### `app/actions/request-goal.ts`
**Status:** ✅ ACTIVE
**Functions:**
- `requestGoal(data)` - Submit new goal request
- `checkGoalRequestExists(searchQuery)` - Check for existing requests

**Key Features:**
- Rate limiting: 5 requests per user per 24 hours
- Email verification required
- Duplicate detection via database UNIQUE constraint
- Input validation (title 10-200 chars, description 20-500 chars)

---

#### `app/actions/approve-goal-request.ts`
**Status:** ✅ ACTIVE
**Functions:**
- `approveGoalRequest({ requestId, categoryId, adminNotes })` - Approve and create goal
- `rejectGoalRequest({ requestId, reason, adminNotes })` - Reject request

**Key Features:**
- Atomic transactions (create goal + update request)
- Rollback on failure
- Path revalidation after success
- Admin-only (RLS enforced)

---

## 🔴 Archived/Deprecated Components

### `archive/2025-11-deprecated-components/SearchableBrowse.tsx`
**Status:** ❌ DEPRECATED - DO NOT USE
**Replaced By:** `components/templates/HybridBrowse.tsx`
**Archived:** November 8, 2025
**Reason:** Refactored to extract search logic to `useGoalSearch` hook

**Why Deprecated:**
During a refactor to improve separation of concerns, the search logic was extracted from SearchableBrowse into a custom hook (`useGoalSearch`). A new component (`HybridBrowse`) was created that uses this hook, providing better code organization and reusability.

The `/browse` page was updated to use `HybridBrowse` instead of `SearchableBrowse`, but the old file was never deleted, leading to confusion.

**History:**
- Original component: SearchableBrowse.tsx (search logic embedded)
- Refactor: Created useGoalSearch.ts hook + HybridBrowse.tsx component
- Migration: Updated /browse/page.tsx to import HybridBrowse
- Cleanup: SearchableBrowse.tsx archived November 2025

**Lesson Learned:**
When refactoring components, always delete or archive the old version immediately to prevent confusion. Update all documentation references at the same time.

**References:**
- Archive README: `/archive/2025-11-deprecated-components/README.md`
- Handover doc: `/ADDGOALHANDOVER.md` (updated to reference HybridBrowse)

---

## 🗺️ Component Usage Map

### Browse Page Flow
```
/app/browse/page.tsx
  └─→ components/templates/HybridBrowse.tsx (ACTIVE)
       ├─→ lib/hooks/useGoalSearch.ts (search logic)
       ├─→ components/molecules/GoalRequestForm.tsx (modal)
       ├─→ components/ui/LoginPromptModal.tsx (modal)
       ├─→ lib/navigation/super-categories.ts (grouping)
       └─→ lib/navigation/category-icons.ts (icons)
```

### Goal Request Flow
```
User searches → No results found
  └─→ HybridBrowse shows "Request this goal" button
       ├─→ Anonymous user clicks
       │    └─→ LoginPromptModal appears
       │         └─→ Redirects to /login
       │
       └─→ Authenticated user clicks
            └─→ GoalRequestForm opens (search query pre-filled)
                 └─→ Calls app/actions/request-goal.ts
                      └─→ Saves to goal_suggestions table
```

### Admin Review Flow
```
/app/admin/page.tsx
  └─→ Fetches pending goal_suggestions
       └─→ components/admin/GoalRequestReview.tsx
            ├─→ Admin clicks "Approve"
            │    └─→ components/admin/ApprovalModal.tsx
            │         └─→ Calls app/actions/approve-goal-request.ts
            │              └─→ Creates goal + updates request status
            │
            └─→ Admin clicks "Reject"
                 └─→ Prompts for reason
                      └─→ Calls app/actions/approve-goal-request.ts
                           └─→ Updates request status to 'rejected'
```

---

## 📋 Quick Reference: What to Use When

| Task | Component/Hook to Use | Status |
|------|----------------------|--------|
| Browse page interface | `HybridBrowse.tsx` | ✅ Active |
| Goal search functionality | `useGoalSearch` hook | ✅ Active |
| Request new goal (user) | `GoalRequestForm.tsx` | ✅ Active |
| Review requests (admin) | `GoalRequestReview.tsx` | ✅ Active |
| Approve request (admin) | `ApprovalModal.tsx` | ✅ Active |
| Submit goal request (backend) | `request-goal.ts` action | ✅ Active |
| Approve/reject (backend) | `approve-goal-request.ts` action | ✅ Active |
| ~~Browse with search~~ | ~~SearchableBrowse.tsx~~ | ❌ Deprecated |

---

## 🔍 How to Check Component Status

1. **Check this document first** - The source of truth for active vs archived components
2. **Check file location:**
   - `archive/` directory = deprecated/archived
   - `components/` directory = potentially active (verify in this doc)
3. **Check for deprecation markers:**
   - JSDoc `@deprecated` comments
   - Archive README files
4. **Check actual usage:**
   - Use global search to find imports
   - If only found in archive, it's deprecated
5. **Check git history:**
   - When was it last modified?
   - Was it moved to archive?

---

## 🚨 Preventing Future Component Confusion

### When Creating New Components:
1. **Document immediately** - Add to this COMPONENT_MAP.md
2. **Clear naming** - Use descriptive names that indicate purpose
3. **Single source of truth** - Don't duplicate functionality

### When Refactoring Components:
1. **Delete or archive old version** - Don't leave orphaned files
2. **Update all references** - Search codebase for imports
3. **Update documentation** - This file, ARCHITECTURE.md, handover docs, etc.
4. **Add deprecation markers** - JSDoc comments if keeping temporarily
5. **Create archive README** - Explain why component was deprecated

### When Searching for Components:
1. **Check this map first** - Don't assume filename = active
2. **Verify imports** - Search where component is actually used
3. **Check archive** - Look for moved components
4. **Ask if unsure** - Update this doc if you discover discrepancies

---

## 📝 Maintenance

**Who Updates This:**
- Any developer who creates, deprecates, or refactors components
- Code reviewers should verify this is updated in PRs

**When to Update:**
- Creating new browse/search/form/admin components
- Deprecating or archiving existing components
- Discovering undocumented components

**How to Update:**
- Add new components to "Active Components" section
- Move deprecated to "Archived/Deprecated Components" section
- Update usage map if flow changes
- Update quick reference table

---

**End of Component Map**
