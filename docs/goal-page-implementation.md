# Goal Page Implementation Guide

> **Consolidated guide for implementing the WWFM goal page**  
> Last updated: December 2024  
> Combines vision, technical approach, and progress tracking

## 📐 Vision & Design

The goal page is the heart of WWFM - where users discover solutions that actually worked for specific life challenges. It balances information density with visual clarity, making it easy to scan solutions while providing transparency about user-generated data.

### Key Design Principles

1. **🎯 Solutions First** - Visible within 2 seconds of page load
2. **📊 Transparent UGC** - Show that data comes from real people
3. **🔄 Progressive Disclosure** - Simple view for scanning, detailed for research
4. **💫 Frictionless Contribution** - Rating happens in-context

### Page Structure

```
┌─────────────────────────────────────────────┐
│ First-time Banner (dismissible)             │
├─────────────────────────────────────────────┤
│ Gradient Header                             │
│ - Goal title with emoji                     │
│ - Stats (55 solutions, 832 ratings)         │
│ - Tabs: What Worked | Community Discussion  │
├─────────────────────────────────────────────┤
│ Related Goals Menu (Amazon-style)           │
│ "People also worked on: ..."                │
├─────────────────────────────────────────────┤
│ Sticky Controls Bar                         │
│ [55 solutions] [Most Effective ▼] [All ▼]  │
│                              [Simple|Detail] │
├─────────────────────────────────────────────┤
│ Solution Cards                              │
│ - Simple view by default                    │
│ - Click to toggle individual cards          │
│ - Hover to rate (desktop)                   │
│ - Swipe to rate (mobile)                    │
└─────────────────────────────────────────────┘

[FAB: + Share What Worked]
```

### Solution Card States

#### Simple View (Default)
- Solution title + rating on same row
- Variant info: "Most effective: 200mg capsule (4.5★)"
- Brief description
- 3 key fields in grid (Cost, Side Effects, Time)
- "View all X options" button

#### Detailed View (Expanded)
- All simple view content PLUS:
- Extended description
- Distribution breakdowns with percentages
- Field labels show report counts: "COST (142)"
- Top 3 values + "others X%"
- Side effects section with "add yours" hint

### Mobile Adaptations
- Icon controls: [≡] filters, [👁/👁‍🗨️] view toggle
- Swipe left to reveal rating stars
- Tap 📊 icon for distribution bottom sheet
- Horizontal scroll for related goals
- Stacked layout for solution fields

## 📊 Current Implementation Status

### ✅ Completed Features

1. **Page Structure**
   - Goal page redesign with gradient header
   - Stats display (solution count, total ratings)
   - Amazon-style related goals text menu
   - Clean dropdown controls replacing pill clutter
   - Enhanced FAB for contributions

2. **Basic Interactions**
   - Rating container desktop hover transform
   - Rating submission to database (bug fixed)
   - Solution data fetching and display
   - Category filtering foundation

3. **Data Architecture**
   - Proper variant handling for all solutions
   - JSONB field storage in goal_implementation_links
   - Effectiveness aggregation from ratings

### 🚧 In Progress

1. **View Toggle Implementation**
   - Global Simple/Detailed toggle affects all cards
   - Per-card click to toggle individual view
   - State management for view preferences

2. **Solution Card Polish**
   - Simple vs Detailed view layouts
   - Variant display for medications/supplements
   - Progressive disclosure animations

### ❌ Not Started

1. **Core Interactions**
   - Mobile swipe-to-rate gesture
   - Distribution display in detailed view
   - Side effects "add yours" inline editing
   - Loading skeletons for better UX

2. **Advanced Features**
   - Category multi-select dropdown
   - Sort options (effectiveness, cost, time)
   - Failed solutions section
   - Community discussion tab
   - Email notifications

3. **Mobile-Specific**
   - Bottom sheet for distributions
   - Variant selection modal
   - Touch gesture tutorials

## 🔧 Technical Implementation

### Component Structure

```typescript
/app/goal/[id]/
├── page.tsx              // Server component, data fetching
├── GoalPageClient.tsx    // Main client component
└── /components/
    ├── GoalHeader.tsx
    ├── RelatedGoals.tsx
    ├── StickyControls.tsx
    ├── SolutionCard.tsx
    ├── InteractiveRating.tsx
    └── DistributionSheet.tsx
```

### State Management

```typescript
interface GoalPageState {
  // View controls
  globalView: 'simple' | 'detailed';
  individualCardViews: Record<string, 'simple' | 'detailed'>;
  
  // Filters
  selectedCategories: string[];
  sortBy: 'effectiveness' | 'time' | 'cost' | 'recent';
  
  // Mobile sheets
  activeDistributionSheet: {
    solutionId: string;
    fieldName: string;
  } | null;
  activeVariantSheet: string | null;
  
  // First time user
  showContributionHint: boolean;
}
```

### View Logic

```typescript
// Determine card view (global overrides individual)
const getCardView = (cardId: string): 'simple' | 'detailed' => {
  if (globalView === 'detailed') return 'detailed';
  return individualCardViews[cardId] || 'simple';
};

// Toggle individual card
const toggleCardView = (cardId: string) => {
  setIndividualCardViews(prev => ({
    ...prev,
    [cardId]: prev[cardId] === 'simple' ? 'detailed' : 'simple'
  }));
};
```

### Distribution Display

```typescript
interface Distribution {
  values: Array<{
    value: string;
    count: number;
    percentage: number;
  }>;
  totalReports: number;
}

// Format for display
const formatDistribution = (dist: Distribution) => {
  const sorted = dist.values.sort((a, b) => b.count - a.count);
  
  // Special cases
  if (dist.totalReports === 1) return { values: sorted, showPercentages: false };
  if (dist.totalReports <= 3) return { values: sorted, showOthers: false };
  
  // Standard: top 3 + others
  const top3 = sorted.slice(0, 3);
  const othersPercent = sorted.slice(3).reduce((sum, v) => sum + v.percentage, 0);
  
  return { values: top3, othersPercent, showPercentages: true };
};
```

### Mobile Implementation

```typescript
// Swipe to rate
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedLeft: () => setShowRating(true),
  onSwipedRight: () => setShowRating(false),
  trackMouse: false // Mobile only
});

// Bottom sheet for distributions
const DistributionSheet = ({ field, data, isOpen, onClose }) => (
  <div className={`bottom-sheet ${isOpen ? 'active' : ''}`}>
    <div className="sheet-handle" />
    <h3>{field}</h3>
    {/* Bar chart visualization */}
  </div>
);
```

## 📋 Implementation Checklist

### Phase 1: Core Features (Priority)
- [ ] **View Toggle System**
  - [ ] Global toggle implementation
  - [ ] Per-card toggle on click
  - [ ] Persist preference in localStorage
  - [ ] Smooth transitions between views

- [ ] **Mobile Swipe-to-Rate**
  - [ ] Install react-swipeable
  - [ ] Implement swipe gesture handler
  - [ ] Visual swipe hint on first visit
  - [ ] Haptic feedback on rate

- [ ] **Distribution Display**
  - [ ] Calculate distributions from ratings
  - [ ] Format top 3 + others logic
  - [ ] Show report counts in labels
  - [ ] Mobile bottom sheet component

### Phase 2: Polish (Next Sprint)
- [ ] **Loading States**
  - [ ] Solution card skeletons
  - [ ] Smooth transitions
  - [ ] Optimistic updates

- [ ] **Category Filter**
  - [ ] Multi-select dropdown UI
  - [ ] Filter logic implementation
  - [ ] Count badges per category

- [ ] **Sort Options**
  - [ ] Implement sort algorithms
  - [ ] Persist sort preference
  - [ ] Sort indicator UI

### Phase 3: Advanced Features
- [ ] **Failed Solutions**
  - [ ] Separate section/tab
  - [ ] Different visual treatment
  - [ ] "Why didn't it work" data

- [ ] **Community Tab**
  - [ ] Discussion thread UI
  - [ ] Comment system
  - [ ] Moderation tools

- [ ] **Analytics**
  - [ ] View tracking
  - [ ] Interaction metrics
  - [ ] Contribution funnel

## 🎯 Next Steps

1. **Immediate Priority**: Implement view toggle system
   - This unlocks the core UX improvement
   - Test on both desktop and mobile
   - Ensure smooth performance with 50+ cards

2. **Follow Up**: Mobile swipe-to-rate
   - Critical for mobile contribution
   - Add tutorial for first-time users
   - Test on various devices

3. **Then**: Distribution displays
   - Brings transparency to the platform
   - Shows the value of aggregated data
   - Encourages more contributions

## 🐛 Common Issues & Solutions

### Performance with Many Cards
- Implement virtual scrolling for 50+ solutions
- Lazy load detailed view content
- Memoize expensive calculations

### Mobile Gesture Conflicts
- Prevent scroll while swiping for rating
- Clear visual indicators for swipeable areas
- Fallback to tap if swipe fails

### Distribution Data Edge Cases
- Handle n=1 (no percentages)
- Handle n≤3 (show all values)
- Handle missing data gracefully

## 📚 Related Documentation

- [Database Schema](/docs/database/schema.md) - Understanding data structure
- [Form Templates](/docs/forms/README.md) - For contribution flow
- [ARCHITECTURE.md](/ARCHITECTURE.md) - System patterns

---

**Remember**: The goal page is where users find hope. Every interaction should reinforce that real people found real solutions that actually worked.