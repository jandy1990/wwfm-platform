# Retrospective System

**Location:** `/app/retrospective`
**Last Updated:** November 2, 2025

## Overview

The retrospective system measures the **long-term value** of achieved goals, distinguishing between immediate success and lasting impact.

## Purpose

**Key Question:** "Did this solution make a lasting difference in your life?"

Many solutions work short-term but fade. Retrospectives capture which solutions create lasting positive change 6+ months later.

## User Flow

1. **User submits a solution** (rates it as working for their goal)
2. **System schedules follow-up** in `retrospective_schedules` table
3. **6 months later:** Notification appears in mailbox
4. **User clicks link** → Goes to `/retrospective/[id]`
5. **User answers 1-2 questions:**
   - Counterfactual impact (1-5 scale): "If you hadn't achieved this, how different would life be?"
   - Optional: unexpected benefits, wisdom notes
6. **Data aggregates** into `goal_wisdom_scores` table
7. **Display on goal pages** as "Lasting Value: 💎 4.2/5"

## Schedule Types

- **6-month follow-up:** Primary assessment
- **12-month follow-up:** Scheduled after 6-month completion (optional)

## Questions Asked

### Required: Counterfactual Impact (1-5 scale)
"If you hadn't achieved [goal], how different would your life be today?"

**Scale:**
- 1 = No difference - Life would be exactly the same
- 2 = Minor difference - Small improvements would be missing
- 3 = Moderate difference - Notable but not life-changing
- 4 = Major difference - Significantly better quality of life
- 5 = Transformative - Life fundamentally different in meaningful ways

### Optional: Additional Context
- Unexpected benefits that emerged
- Wisdom or insights gained
- Would you still prioritize this goal?

## Display Logic

### When Wisdom Scores Show
- **Shows on goal page** when `total_retrospectives >= 1`
- **Component:** `GoalWisdom` displays lasting value score
- **Visual:** Diamond emoji (💎) with score out of 5
- **Inconsistent display:** Only shows when enough data exists

### Example Display
```
💎 Lasting Value: 4.2/5 (based on 15 people who achieved this 6+ months ago)
```

## Data Storage

### Individual Responses (Private)
**Table:** `goal_retrospectives`
- User's counterfactual impact score (1-5)
- Optional qualitative feedback
- Timestamp of completion
- Links to original rating and goal

### Aggregated Scores (Public)
**Table:** `goal_wisdom_scores`
- `goal_id` - Which goal
- `avg_counterfactual_impact` - Average lasting value score
- `total_retrospectives` - How many responses
- `updated_at` - Last aggregation time

### Schedule Management
**Table:** `retrospective_schedules`
- `rating_id` - Which solution rating triggers this
- `user_id` - Who to follow up with
- `scheduled_for` - When to send (6 months from submission)
- `sent_at` - When mailbox item was created
- `completed_at` - When user completed retrospective

## Implementation Files

- **Retrospective page:** `app/retrospective/[id]/page.tsx`
- **Server actions:** `app/actions/retrospectives.ts` (if exists)
- **Cron job:** Supabase scheduled function
- **Display component:** `components/goal/GoalWisdom.tsx` (if exists)

## Key Design Decisions

| Decision | Reasoning |
|----------|-----------|
| 6-month follow-up | Long enough to assess lasting impact |
| Counterfactual question | Measures true value vs just satisfaction |
| Diamond emoji (💎) | Symbolizes lasting value/wisdom |
| Only show with data | Avoid "no data" confusing users |
| Private responses | Encourage honesty without social pressure |
| Public aggregates | Show community wisdom without compromising privacy |

## Cron Job Configuration

**Schedule:** Daily check for due retrospectives
**Trigger:** Supabase Edge Function or Database Function
**Logic:**
```sql
-- Find schedules due today that haven't been sent
SELECT * FROM retrospective_schedules
WHERE scheduled_for <= NOW()
  AND sent_at IS NULL
```

**Action:** Create mailbox item for each due retrospective

## Known Issues

**To Investigate:**
- [ ] Wisdom scores (💎) showing inconsistently on goal pages - check data availability
- [ ] Determine minimum retrospectives needed for display
- [ ] Verify Supabase cron job is configured and running

## Future Enhancements

- [ ] 12-month follow-ups (after 6-month)
- [ ] Trend analysis (did value increase/decrease over time?)
- [ ] Compare "worked initially" vs "still valuable" rates
- [ ] Qualitative analysis of unexpected benefits
- [ ] "Wisdom library" of collected insights
