# Handling AI-Seeded Data in Tests

## Overview

WWFM launches with AI-seeded data to ensure the platform feels "alive" from day one:
- 700+ pre-populated goals
- AI-generated solutions across goals
- Pre-existing effectiveness ratings

This affects our testing strategy.

## Key Considerations

### 1. Test Goal Isolation
- Use a dedicated TEST_GOAL_ID to avoid mixing test data with production/seeded data
- Test goal is clearly marked with meta tags: `['test', 'automated', 'e2e', 'ignore-for-analytics']`

### 2. Solution Existence Scenarios

Our tests must handle two scenarios:

```typescript
// Scenario A: Solution doesn't exist (new solution)
// → Creates new solution
// → Creates variant
// → Links to test goal

// Scenario B: Solution already exists (from AI seeding)
// → Finds existing solution
// → May create new variant or use existing
// → Links to test goal
```

### 3. Cleanup Strategy

The cleanup function is careful to:
- Only delete goal_implementation_links for the TEST_GOAL_ID
- Only delete variants if they're not linked to other goals
- Only delete solutions if they have no remaining variants

This prevents accidentally deleting seeded data that might be shared across goals.

### 4. Test Data Naming

Test solutions use timestamp-based naming:
```typescript
`Test ${category} ${timestamp}`
```

This ensures:
- Uniqueness for each test run
- Easy identification of test data
- No collision with seeded solution names

## Implications for Test Writing

### DO:
- Always use the TEST_GOAL_ID for submissions
- Handle cases where solutions might already exist
- Use unique, timestamped names for test data
- Verify data in the context of the test goal only

### DON'T:
- Don't assume solutions don't exist
- Don't delete data without checking if it's shared
- Don't use production goal IDs
- Don't rely on global solution counts

## Example Test Pattern

```typescript
test('handles existing seeded solution', async ({ page }) => {
  // Solution might already exist from seeding
  const testData = {
    title: 'Vitamin D', // Common solution, likely seeded
    category: 'supplements_vitamins'
  }
  
  // Submit form...
  
  // Verify - check in context of our test goal
  const result = await verifyDataPipeline(testData.title, testData.category)
  expect(result.success).toBe(true)
  
  // The solution might have existed, but we verify:
  // 1. It's now linked to our test goal
  // 2. Our submitted data is in solution_fields
  expect(result.goalLink.goal_id).toBe(process.env.TEST_GOAL_ID)
})
```