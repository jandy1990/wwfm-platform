# AI-to-Human Transition Testing Guide

## Overview

This guide covers the comprehensive testing program for the AI-to-Human Data Transition system. The testing suite validates the complete transition flow from AI-generated effectiveness data to community-verified human data.

## Test Infrastructure

### 1. Test Data Seeding Script
**File**: `scripts/test-transition-seeding.ts`

Creates controlled test scenarios:
- Fresh AI solutions (0 human ratings)
- Pre-transition solutions (9/10 ratings)
- At-threshold solutions (10 ratings)
- Already transitioned solutions (human mode)

```bash
# Run the seeding script
npx tsx scripts/test-transition-seeding.ts
```

### 2. End-to-End Tests
**File**: `tests/e2e/ai-to-human-transition.spec.ts`

Playwright tests for UI validation:
- DataSourceBadge display states
- Pre-transition warnings
- Transition animations
- Data consistency across UI

```bash
# Run E2E tests
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3001 npx playwright test tests/e2e/ai-to-human-transition.spec.ts --project=chromium
```

### 3. Integration Tests
**File**: `tests/integration/transition-flow.test.ts`

Backend logic validation:
- Database function testing
- Transition threshold logic
- Data preservation during transitions
- Queue processing

```bash
# Run integration tests (requires Jest)
npm test tests/integration/transition-flow.test.ts
```

### 4. Load Testing Script
**File**: `scripts/test-transition-load.ts`

Performance and concurrency testing:
- Concurrent rating submissions
- Race condition prevention
- System performance under load
- Advisory lock effectiveness

```bash
# Run load tests
npx tsx scripts/test-transition-load.ts
```

## Test Scenarios

### Scenario A: Fresh AI Solution
- **State**: 0 human ratings
- **Expected**: "AI-Generated 🤖" badge
- **Test**: Badge display, tooltip messages

### Scenario B: Pre-Transition State
- **State**: 9 human ratings (threshold = 10)
- **Expected**: "AI-Generated 🤖 (9/10)" progress
- **Test**: Pre-transition warning on hover

### Scenario C: Transition Trigger
- **State**: Adding 10th rating
- **Expected**: Transition animation, mode switch
- **Test**: Animation display, data consistency

### Scenario D: Post-Transition
- **State**: 10+ human ratings
- **Expected**: "Community Verified ✓ (X users)"
- **Test**: Human mode display, preserved data

## Key Test Data

The seeding script creates test data stored in `tests/fixtures/transition-test-data.json`:

```json
{
  "scenarios": [
    {
      "name": "Fresh AI Solution (0 ratings)",
      "goalId": "...",
      "variantId": "...",
      "expectedHumanCount": 0,
      "expectedMode": "ai"
    }
    // ... more scenarios
  ],
  "testUserId": "e22feb1a-e617-4c8d-9747-0fb958068e1d"
}
```

## Running All Tests

### Complete Test Suite
```bash
# 1. Seed test data
npx tsx scripts/test-transition-seeding.ts

# 2. Run integration tests
npm test tests/integration/

# 3. Run E2E tests
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3001 npx playwright test tests/e2e/ai-to-human-transition.spec.ts

# 4. Run load tests
npx tsx scripts/test-transition-load.ts
```

### Quick Validation
```bash
# Start dev server
PORT=3001 npm run dev

# In another terminal, run E2E tests only
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3001 npx playwright test tests/e2e/ai-to-human-transition.spec.ts --reporter=list --project=chromium
```

## Performance Benchmarks

### Expected Performance
- **Rating submission**: < 1000ms response time
- **Transition execution**: < 500ms
- **UI update**: Immediate (no lag window)
- **Success rate**: > 95% under normal load

### Load Test Metrics
- **Concurrent users**: Up to 50 simultaneous ratings
- **Race condition prevention**: 100% effective
- **Advisory locks**: Prevent duplicate transitions
- **Queue processing**: < 5 seconds for aggregation

## Test Environment Setup

### Prerequisites
1. **Test User**: `test@wwfm-platform.com` must exist in Supabase Auth
2. **Environment**: `.env.local` with Supabase credentials
3. **Dev Server**: Running on port 3001
4. **Clean State**: No existing test ratings

### Database State
The tests use real Supabase database operations:
- Create test ratings with `data_source: 'human'`
- Modify `goal_implementation_links` for scenario setup
- Use advisory locks to prevent race conditions
- Clean up test data after each run

## Troubleshooting

### Common Issues

#### Test Data Not Found
```bash
# Re-seed test data
npx tsx scripts/test-transition-seeding.ts
```

#### Badge Not Displaying
- Check DataSourceBadge is imported in GoalPageClient.tsx
- Verify transition fields are loaded from database
- Ensure no TypeScript compilation errors

#### Transition Not Triggering
- Verify `check_and_execute_transition` function exists in Supabase
- Check human_rating_count reaches threshold (10)
- Confirm data_display_mode is 'ai' before transition

#### Performance Issues
- Monitor Supabase logs for slow queries
- Check aggregation queue for stuck jobs
- Verify advisory locks are working

### Debug Commands

```bash
# Check test data state
npx supabase db query "SELECT goal_id, implementation_id, human_rating_count, data_display_mode FROM goal_implementation_links WHERE human_rating_count > 0"

# View recent transitions
npx supabase db query "SELECT * FROM goal_implementation_links WHERE transitioned_at IS NOT NULL ORDER BY transitioned_at DESC LIMIT 5"

# Monitor queue processing
npx supabase db query "SELECT * FROM aggregation_queue WHERE status = 'pending'"

# Check test ratings
npx supabase db query "SELECT goal_id, implementation_id, COUNT(*) as human_ratings FROM ratings WHERE data_source = 'human' GROUP BY goal_id, implementation_id"
```

## Test Maintenance

### Adding New Test Scenarios
1. Modify `scripts/test-transition-seeding.ts` to add new scenarios
2. Update `tests/fixtures/transition-test-data.json` structure
3. Add corresponding E2E tests in `ai-to-human-transition.spec.ts`

### Updating Performance Benchmarks
1. Adjust thresholds in `scripts/test-transition-load.ts`
2. Monitor production metrics to set realistic expectations
3. Update documentation with new performance targets

### Database Schema Changes
1. Update transition functions in Supabase if schema changes
2. Modify seeding script to match new column names/types
3. Update test expectations accordingly

## Production Deployment Testing

Before deploying to production:

1. **Run complete test suite** on staging environment
2. **Verify performance benchmarks** meet requirements
3. **Test with real user accounts** (not test accounts)
4. **Monitor transition behavior** for first few real transitions
5. **Validate data preservation** during actual transitions

## Monitoring and Alerting

Set up monitoring for:
- Transition success rate (should be > 99%)
- Average response time (should be < 1000ms)
- Queue processing delays (should be < 30 seconds)
- Failed transitions (should alert immediately)

This comprehensive testing program ensures the AI-to-Human transition system works reliably under all conditions and provides users with a smooth, transparent experience.
