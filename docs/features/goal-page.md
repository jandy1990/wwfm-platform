# Goal Page Features Documentation

> **Purpose**: High-level reference for AI developers working on WWFM's most valuable page  
> **Last Updated**: January 2025  
> **Primary Component**: `/components/goal/GoalPageClient.tsx`  
> **Page Route**: `/app/goal/[id]/page.tsx`

## Overview

The goal page is where users make critical decisions about which solutions to try for their life challenges. It's the core value delivery mechanism of WWFM, presenting crowdsourced effectiveness data in an accessible, actionable format.

**Core Value Proposition**: Users can quickly see what actually worked for others facing the same challenge, with real effectiveness ratings and prevalence data.

## Architecture Overview

```
┌─────────────────────────────────────┐
│        Goal Page (SSR)              │
│  /app/goal/[id]/page.tsx           │
└────────────┬───────────────────────┘
             │ Props
┌────────────▼───────────────────────┐
│    GoalPageClient (Client)         │  ← Main orchestrator
│  Interactive features & state      │
└────────────┬───────────────────────┘
             │ Renders
┌────────────▼───────────────────────┐
│    Solution Cards & Features       │
│  - RatingDisplay/SwipeableRating  │
│  - DistributionField              │
│  - VariantSheet                   │
└────────────────────────────────────┘
```

## Core Features

### 1. Solution Display System
**Purpose**: Present solutions in order of effectiveness with progressive disclosure

- **Simple View** (default): Shows essential metrics only
- **Detailed View**: Full distribution breakdowns
- **Card Toggle**: Click anywhere on card to switch views
- **Category Styling**: Visual differentiation via icons/colors

**Key Files**:
- Component config: `CATEGORY_CONFIG` in `GoalPageClient.tsx`
- Solution fetching: `/lib/solutions/goal-solutions.ts`

### 2. Interactive Rating System
**Purpose**: Collect user effectiveness ratings to improve data quality

- **Desktop**: Hover to reveal 5-star rating
- **Mobile**: Swipe left on cards
- **Variant-Specific**: Ratings tied to specific versions (e.g., "10mg" vs "20mg")
- **Sort Locking**: Preserves context after user rates

**Key Components**:
- `/components/organisms/solutions/SwipeableRating.tsx`
- `/components/molecules/RatingDisplay.tsx`

### 3. Distribution & Prevalence
**Purpose**: Show consensus and variation in user experiences

- **Prevalence Data**: "65% report results in 1-2 weeks"
- **Consensus Indicators**: Visual strength bars
- **Array Fields**: Side effects/challenges with occurrence percentages

**Data Source**: `ai_field_distributions` table
**Components**: 
- `/components/molecules/NewDistributionField.tsx`
- `/components/molecules/SimplifiedMetricField.tsx`

### 4. Filtering & Sorting
**Purpose**: Help users find relevant solutions quickly

**Sort Options**:
- Most Effective (default)
- Quickest Results
- Lowest Cost
- Most Recent

**Filters**:
- Multi-select category dropdown
- Shows counts per category

**Implementation**: Client-side filtering/sorting in `GoalPageClient.tsx`

### 5. Solution Variants
**Purpose**: Handle different versions of the same solution

Only 4 categories use variants:
- `medications` (different dosages)
- `supplements_vitamins` (forms: capsule/liquid)
- `natural_remedies` (preparations: tea/tincture)
- `beauty_skincare` (concentrations: 0.1%/0.5%)

**Mobile**: Bottom sheet via `VariantSheet` component
**Desktop**: Inline expansion

### 6. Contribution Flow
**Purpose**: Enable users to add their experiences

- **Floating CTA**: "Share What Worked" button
- **Auto-categorization**: `/lib/solutions/categorization.ts`
- **Form System**: 9 templates for 23 categories (1 implemented)

**Entry Points**:
- Floating button (bottom right)
- CTA section (bottom of page)
- "Add yours" on array fields

## User Journey

```
1. Land on Goal Page
   ↓
2. See Solutions Ranked by Effectiveness
   ↓
3. Toggle Simple/Detailed View
   ↓
4. Filter by Category (optional)
   ↓
5. Rate Solutions They've Tried
   ↓
6. View Variants (if applicable)
   ↓
7. Contribute Their Experience
```

## Data Flow

```
Supabase Tables:
├── goals
├── solutions
├── solution_variants
├── goal_implementation_links (effectiveness + JSONB fields)
└── ai_field_distributions (prevalence data)
           ↓
    Server Component
    (Fetches all data)
           ↓
    GoalPageClient
    (Manages state)
           ↓
    UI Components
    (Display + interact)
```

## State Management Patterns

1. **View Mode**: Global toggle + individual card overrides
2. **Filters**: Client-side with useMemo optimization
3. **Ratings**: Optimistic updates with server sync
4. **Sort Lock**: Prevents reordering after user interaction

## Mobile Optimizations

- **Swipe Gestures**: For rating solutions
- **Bottom Sheets**: For variants and distributions
- **2-Column Grid**: Responsive field layout
- **Touch Targets**: 44px minimum for accessibility

## Enhancement Opportunities

### Missing Features (High Impact)
1. **Solution Comparison**: Side-by-side comparison tool
2. **Personal Tracking**: "I'm trying this" with reminders
3. **Success Stories**: Detailed user testimonials
4. **Contraindications**: "Don't try X if Y"
5. **Combination Data**: What works together

### Data Enhancements
1. **Time-based Effectiveness**: How ratings change over time
2. **Demographic Breakdowns**: Effectiveness by age/gender (privacy-conscious)
3. **Failure Analysis**: Why solutions didn't work
4. **Alternative Suggestions**: "If X didn't work, try Y"

### UX Improvements
1. **Guided Mode**: Step-by-step solution selection
2. **Export/Save**: Personal solution plans
3. **Progress Indicators**: Show data confidence levels
4. **Smart Defaults**: Personalized based on history

### Technical Improvements
1. **Real-time Updates**: Live effectiveness changes
2. **Offline Support**: PWA capabilities
3. **Performance**: Virtual scrolling for 100+ solutions
4. **Analytics**: Detailed interaction tracking

## Related Documentation

- **Architecture**: `/ARCHITECTURE.md`
- **Database Schema**: `/docs/database/schema.md`
- **Form System**: `/docs/forms/README.md`
- **Component Guide**: `/components/README.md` (if exists)

## Implementation Notes

1. **Effectiveness Calculation**: Stored at goal-solution level, not solution level
2. **Variant Handling**: Most categories use single "Standard" variant
3. **JSONB Fields**: Flexible storage for category-specific data
4. **Sort Behavior**: Disabled after rating to preserve context
5. **Progressive Disclosure**: Default to simple view for clarity

## Common Pitfalls

1. **Rating Foreign Keys**: Must use `variant.id`, not `solution.id`
2. **Distribution Data**: May be missing for new solutions
3. **Category Config**: Must have exactly 4 keyFields
4. **Mobile Sheets**: Ensure proper cleanup on unmount

---

**Next Steps**: When implementing new features, consider the goal page's role as the primary decision-making interface. Every addition should help users find effective solutions faster or contribute their experiences more easily.