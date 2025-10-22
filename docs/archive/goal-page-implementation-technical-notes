# Goal Page Implementation Technical Notes

## Critical Implementation Details Not in Visual Guide

### 1. Distribution Data Structure
```typescript
// This is what the API should return for each solution
interface SolutionWithDistributions {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string; // emoji
  
  // Aggregated effectiveness
  effectiveness: {
    average: number; // 4.2
    count: number;   // 156
  };
  
  // Variants (only for meds/supplements/beauty/natural)
  variants?: Array<{
    id: string;
    variant_name: string; // "200mg capsule"
    effectiveness: number; // 4.5
    is_default: boolean;
  }>;
  
  // Field distributions from solution_fields JSONB
  distributions: {
    [fieldName: string]: {
      mode: string; // Most common value to show in simple view
      values: Array<{
        value: string;
        count: number;
        percentage: number;
      }>;
      totalReports: number;
    }
  };
}
```

### 2. Distribution Calculation Query
```sql
-- Example for calculating distributions from user_ratings
SELECT 
  sf.field_name,
  sf.field_value,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY sf.field_name), 0) as percentage
FROM user_ratings ur
CROSS JOIN LATERAL jsonb_each_text(ur.solution_fields) AS sf(field_name, field_value)
WHERE ur.solution_id = $1
  AND ur.goal_id = $2
GROUP BY sf.field_name, sf.field_value
ORDER BY sf.field_name, count DESC;
```

### 3. State Management Pattern
```typescript
// Goal page state
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
  activeVariantSheet: string | null; // solution ID
  
  // First time user
  showContributionHint: boolean;
}

// View determination logic
const getCardView = (solutionId: string): 'simple' | 'detailed' => {
  if (globalView === 'detailed') return 'detailed';
  return individualCardViews[solutionId] || 'simple';
};
```

### 4. Mobile Swipe Implementation
```typescript
// Using react-swipeable
import { useSwipeable } from 'react-swipeable';

const MobileSolutionCard = ({ solution }) => {
  const [showRating, setShowRating] = useState(false);
  
  const handlers = useSwipeable({
    onSwipedLeft: () => setShowRating(true),
    onSwipedRight: () => setShowRating(false),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });
  
  return (
    <div {...handlers} className="relative">
      {showRating && (
        <div className="absolute inset-0 bg-white z-10 flex items-center justify-center gap-2">
          {[1,2,3,4,5].map(star => (
            <button 
              key={star}
              onClick={() => handleRate(star)}
              className="text-3xl"
            >
              ⭐
            </button>
          ))}
        </div>
      )}
      {/* Rest of card content */}
    </div>
  );
};
```

### 5. Loading & Empty States
```typescript
// Loading skeleton for solution cards
const SolutionSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex gap-3 mb-3">
      <div className="w-8 h-8 bg-gray-200 rounded" />
      <div className="h-6 bg-gray-200 rounded w-32" />
      <div className="ml-auto h-8 bg-gray-200 rounded w-24" />
    </div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
    <div className="grid grid-cols-3 gap-4">
      {[1,2,3].map(i => (
        <div key={i} className="h-10 bg-gray-200 rounded" />
      ))}
    </div>
  </div>
);

// Empty state
const NoSolutions = () => (
  <div className="text-center py-12">
    <p className="text-gray-500 mb-4">No solutions yet for this goal</p>
    <button className="btn-primary">Be the first to share what worked</button>
  </div>
);
```

### 6. Distribution Display Rules
```typescript
const formatDistribution = (distribution: Distribution) => {
  const sorted = distribution.values.sort((a, b) => b.count - a.count);
  
  // Special handling for different sample sizes
  if (distribution.totalReports === 1) {
    return { values: sorted, showPercentages: false };
  }
  
  if (distribution.totalReports <= 3) {
    return { values: sorted, showPercentages: true, showOthers: false };
  }
  
  // Standard case: top 3 + others
  const top3 = sorted.slice(0, 3);
  const others = sorted.slice(3);
  const othersPercent = others.reduce((sum, v) => sum + v.percentage, 0);
  
  return {
    values: top3,
    showPercentages: true,
    showOthers: othersPercent > 0,
    othersPercent
  };
};
```

### 7. Category Filter Multi-Select
```typescript
// Dropdown with checkboxes
const CategoryFilter = ({ categories, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border rounded-md"
      >
        <span>{selected.length === 0 ? 'All Categories' : `${selected.length} selected`}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-1 w-64 bg-white border rounded-md shadow-lg z-20">
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center px-4 py-2 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selected.includes(cat.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selected, cat.id]);
                  } else {
                    onChange(selected.filter(id => id !== cat.id));
                  }
                }}
                className="mr-3"
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 8. Performance Optimizations
```typescript
// Memoize expensive calculations
const memoizedDistributions = useMemo(() => 
  solutions.map(s => ({
    ...s,
    distributions: Object.fromEntries(
      Object.entries(s.distributions).map(([field, dist]) => [
        field,
        formatDistribution(dist)
      ])
    )
  })),
  [solutions]
);

// Virtualize long lists
import { FixedSizeList } from 'react-window';

const SolutionList = ({ solutions }) => {
  if (solutions.length > 50) {
    return (
      <FixedSizeList
        height={window.innerHeight - 200}
        itemCount={solutions.length}
        itemSize={180}
        width="100%"
      >
        {({ index, style }) => (
          <div style={style}>
            <SolutionCard solution={solutions[index]} />
          </div>
        )}
      </FixedSizeList>
    );
  }
  
  // Regular rendering for smaller lists
  return solutions.map(s => <SolutionCard key={s.id} solution={s} />);
};
```

### 9. Animation Details
```css
/* Card hover/tap animations */
.solution-card {
  transition: all 0.2s ease;
}

.solution-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
}

/* Rating transform */
.rating-container .hover-rate {
  transition: opacity 0.2s ease;
}

/* Bottom sheet animations */
.bottom-sheet {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* View toggle animation */
.solution-card.detailed {
  animation: expandIn 0.2s ease forwards;
}

@keyframes expandIn {
  from { opacity: 0.8; }
  to { opacity: 1; }
}
```

### 10. Error Handling
```typescript
// API error handling
const fetchSolutions = async (goalId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_goal_solutions_with_distributions', { goal_id: goalId });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to fetch solutions:', error);
    toast.error('Failed to load solutions. Please try again.');
    return [];
  }
};

// Rating error handling
const handleRate = async (rating: number) => {
  try {
    await rateSolution(solutionId, rating);
    toast.success('Thanks for rating!');
  } catch (error) {
    toast.error('Failed to save rating. Please try again.');
  }
};
```

## Key Integration Points

1. **Supabase RLS**: Ensure policies allow reading aggregated data
2. **Next.js Route**: `/goal/[id]` with proper error boundaries
3. **Tailwind Config**: May need custom colors for distribution percentages
4. **Mobile Detection**: Use `window.matchMedia` or similar for touch-specific features
5. **Analytics**: Track view toggles, rating interactions, distribution views

## Testing Checklist

- [ ] Test with 0, 1, 3, 10, 50+ solutions
- [ ] Test distributions with n=1, n=3, n=100+
- [ ] Test all mobile gestures on actual devices
- [ ] Test category filter with 0, 1, all categories selected
- [ ] Test performance with 200+ solutions
- [ ] Test all loading and error states
- [ ] Test first-time user banner persistence
- [ ] Test variant sheet with 1, 3, 10+ variants

## Notes on Current WWFM Patterns

- Use existing `@/lib/supabase` client utilities
- Follow established error handling patterns
- Maintain consistent loading states across app
- Use existing color variables from globals.css
- Implement proper TypeScript types in `/types`