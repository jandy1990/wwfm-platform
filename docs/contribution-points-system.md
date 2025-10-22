# WWFM Contribution Points System

## Philosophy
Contribution points reward users for helping the community discover what works. The system values quality engagement over quantity, encouraging users to share detailed experiences and help others.

## Point Values

### Core Actions (Building the Database)
- **Submit a Solution**: 50 points
  - First-time contribution to a goal
  - Includes all required fields and details
  - Bonus: +25 points if solution gets 5+ helpful votes within 30 days

- **Rate a Solution**: 5 points
  - Base rating (1-5 stars)
  - Helps validate solution effectiveness

- **Detailed Rating**: +3 points (8 total)
  - Includes optional fields (time_to_results, cost, side_effects, etc.)
  - At least 3 optional fields filled

### Community Engagement
- **Write a Discussion Comment**: 10 points
  - Minimum 50 characters
  - Adds context or personal experience

- **Receive Helpful Vote on Comment**: 2 points
  - Someone upvoted your comment
  - Validates quality of contribution

- **Receive Helpful Vote on Solution**: 3 points
  - Someone marked your solution submission as helpful
  - Maximum 50 points per solution (prevents gaming)

### Quality Multipliers
- **Completion Bonus**: 1.5x multiplier
  - Applied when user fills ALL optional fields in a rating
  - Encourages comprehensive data

- **Early Adopter Bonus**: 2x multiplier
  - Applied to first 3 raters of a new solution
  - Rewards helping build initial data

- **Diversity Bonus**: +10 points
  - Rating a solution in a category you've never rated before
  - Encourages exploring different solution types

## Anti-Gaming Measures

### Rate Limiting
- Maximum 100 ratings per day (prevents bulk rating)
- Maximum 20 discussions per day
- Maximum 10 solution submissions per day

### Quality Thresholds
- Solutions with <2 stars don't earn points for submitter
- Comments under 50 characters earn 0 points
- Duplicate submissions (same user, same solution, same goal) earn 0 points

### Decay Prevention
- No point decay over time
- Points are permanent once earned
- Encourages long-term engagement

## Calculation Formula

```typescript
function calculateContributionPoints(userId: string): number {
  let points = 0;

  // Solutions submitted
  const solutions = getUserSolutions(userId);
  points += solutions.count * 50;
  points += solutions.helpfulVotes * 3; // Max 50 per solution

  // Ratings
  const ratings = getUserRatings(userId);
  points += ratings.basic * 5;
  points += ratings.detailed * 8;
  points += ratings.firstThreeRatings * 5; // Early adopter bonus
  points += ratings.newCategories * 10; // Diversity bonus

  // Discussions
  const discussions = getUserDiscussions(userId);
  points += discussions.count * 10;
  points += discussions.helpfulVotes * 2;

  return points;
}
```

## Milestones

- **100 points**: Contributor (5 detailed ratings or 2 solutions)
- **500 points**: Active Member (50 ratings or 10 solutions)
- **1,000 points**: Community Builder (mix of ratings, solutions, discussions)
- **5,000 points**: Expert Contributor (consistent engagement)
- **10,000 points**: Legend (top 1% of contributors)

## Display Format

Points are displayed with:
- Comma separators (e.g., "1,234 points")
- Progress to next milestone
- Rank badge based on tier
- Breakdown available on hover/click

## Implementation

Points are calculated via PostgreSQL function and updated via triggers on:
- `ratings` table (INSERT)
- `solutions` table (INSERT)
- `goal_discussions` table (INSERT)
- `discussion_upvotes` table (INSERT)

Recalculation can be triggered manually via admin function for backfills.

## Future Enhancements

- Weekly leaderboards
- Category-specific point tracking
- Seasonal challenges with bonus points
- Referral bonuses
- Content quality scoring (AI-assisted)
