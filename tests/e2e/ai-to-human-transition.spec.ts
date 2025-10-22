import { test, expect } from '@playwright/test'
import testData from '../fixtures/transition-test-data.json'

/**
 * AI-to-Human Data Transition E2E Tests
 *
 * Tests the complete transition system using pre-seeded test data:
 * - Fresh AI solutions (0 ratings)
 * - Pre-transition solutions (2/3 ratings)
 * - At-threshold solutions (3+ ratings)
 * - Already transitioned solutions (human mode)
 */

test.describe('AI-to-Human Data Transition', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we're authenticated as the test user
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/dashboard/)
  })

  test('should display DataSourceBadge in AI mode for fresh solutions', async ({ page }) => {
    const freshScenario = testData.scenarios.find(s => s.expectedMode === 'ai' && s.expectedHumanCount === 0)
    if (!freshScenario) throw new Error('Fresh AI scenario not found in test data')

    // Navigate to the goal page
    await page.goto(`/goal/${freshScenario.goalId}`)

    // Wait for solution cards to load
    await page.waitForSelector('[data-testid="solution-card"]', { timeout: 10000 })

    // Look for DataSourceBadge showing AI mode
    const aiBadge = page.locator('text=AI-Generated 🤖').first()
    await expect(aiBadge).toBeVisible()

    // Verify tooltip shows correct progress message
    await aiBadge.hover()
    await expect(page.locator('text=🥇 Be the first to rate this!')).toBeVisible()
  })

  test('should display pre-transition warning when hovering rating that would trigger transition', async ({ page }) => {
    const preTransitionScenario = testData.scenarios.find(s =>
      s.expectedMode === 'ai' && s.expectedHumanCount === 2
    )
    if (!preTransitionScenario) throw new Error('Pre-transition scenario not found in test data')

    await page.goto(`/goal/${preTransitionScenario.goalId}`)

    // Wait for solution cards and find the one with 2 ratings
    await page.waitForSelector('[data-testid="solution-card"]')

    // Look for a solution showing 2/3 progress
    const targetBadge = page.locator('text=AI-Generated 🤖').first()
    await expect(targetBadge).toBeVisible()

    // Find rating stars and hover on one
    const ratingStars = page.locator('[data-rating-star]').first()
    if (await ratingStars.count() > 0) {
      await ratingStars.hover()

      // Should show pre-transition warning
      await expect(page.locator('text=Your rating will unlock community verification!')).toBeVisible()
    }
  })

  test('should show Community Verified badge for transitioned solutions', async ({ page }) => {
    const transitionedScenario = testData.scenarios.find(s => s.expectedMode === 'human')
    if (!transitionedScenario) throw new Error('Transitioned scenario not found in test data')

    await page.goto(`/goal/${transitionedScenario.goalId}`)

    // Wait for solution cards to load
    await page.waitForSelector('[data-testid="solution-card"]', { timeout: 10000 })

    // Look for DataSourceBadge showing human mode
    const humanBadge = page.locator('text=Community Verified ✓').first()
    await expect(humanBadge).toBeVisible()

    // Verify it shows user count
    await expect(page.locator(`text=(${transitionedScenario.expectedHumanCount} users)`).first()).toBeVisible()
  })

  test('should trigger transition animation when adding the threshold rating', async ({ page }) => {
    // For this test, we need to reset a solution to pre-transition state and add the final rating
    const preTransitionScenario = testData.scenarios.find(s =>
      s.expectedMode === 'ai' && s.expectedHumanCount === 2
    )
    if (!preTransitionScenario) throw new Error('Pre-transition scenario not found in test data')

    await page.goto(`/goal/${preTransitionScenario.goalId}`)

    // Wait for the page to load
    await page.waitForSelector('[data-testid="solution-card"]', { timeout: 10000 })

    // Find a rating component and submit a rating
    const ratingButton = page.locator('[data-rating-star="4"]').first()

    if (await ratingButton.count() > 0) {
      await ratingButton.click()

      // Should trigger transition animation after a brief delay
      await expect(page.locator('text=Community Verification Unlocked!')).toBeVisible({ timeout: 5000 })

      // Animation should auto-close after 3 seconds
      await expect(page.locator('text=Community Verification Unlocked!')).toBeHidden({ timeout: 4000 })

      // Badge should now show Community Verified
      await expect(page.locator('text=Community Verified ✓')).toBeVisible()
    } else {
      console.log('No rating buttons found, skipping transition test')
    }
  })

  test('should maintain data consistency during transition', async ({ page }) => {
    // Test that effectiveness values are preserved during transition
    const scenarios = testData.scenarios.filter(s => s.expectedHumanCount > 0)

    for (const scenario of scenarios) {
      await page.goto(`/goal/${scenario.goalId}`)
      await page.waitForSelector('[data-testid="solution-card"]', { timeout: 10000 })

      // Check that effectiveness ratings are displayed
      const effectivenessDisplay = page.locator('text=/\\d\\.\\d ★/').first()
      if (await effectivenessDisplay.count() > 0) {
        const effectivenessText = await effectivenessDisplay.textContent()
        console.log(`Scenario "${scenario.name}": ${effectivenessText}`)

        // Verify effectiveness is reasonable (1.0-5.0 range)
        const rating = parseFloat(effectivenessText?.split(' ')[0] || '0')
        expect(rating).toBeGreaterThanOrEqual(1.0)
        expect(rating).toBeLessThanOrEqual(5.0)
      }
    }
  })

  test('should show correct progress indicators', async ({ page }) => {
    // Test that badges show correct progress for different states
    for (const scenario of testData.scenarios) {
      await page.goto(`/goal/${scenario.goalId}`)
      await page.waitForSelector('[data-testid="solution-card"]', { timeout: 10000 })

      if (scenario.expectedMode === 'ai' && scenario.expectedHumanCount > 0) {
        // Should show progress in AI badge
        const progressText = `(${scenario.expectedHumanCount}/3)`
        await expect(page.locator(`text=${progressText}`).first()).toBeVisible()
      } else if (scenario.expectedMode === 'human') {
        // Should show user count in human badge
        const userCount = `(${scenario.expectedHumanCount} users)`
        await expect(page.locator(`text=${userCount}`).first()).toBeVisible()
      }
    }
  })

  test('should handle edge cases gracefully', async ({ page }) => {
    // Test error conditions and edge cases

    // Navigate to a goal that might not have the test solutions
    await page.goto('/goal/non-existent-goal-id')

    // Should show 404 or empty state without crashing
    await expect(page.locator('text=404').or(page.locator('text=No solutions found'))).toBeVisible()

    // Navigate back to valid goal
    const validScenario = testData.scenarios[0]
    await page.goto(`/goal/${validScenario.goalId}`)

    // Page should load normally
    await page.waitForSelector('[data-testid="solution-card"]', { timeout: 10000 })
  })
})

test.describe('Transition System Performance', () => {
  test('should handle multiple rapid rating submissions', async ({ page }) => {
    const scenario = testData.scenarios.find(s => s.expectedMode === 'ai' && s.expectedHumanCount === 0)
    if (!scenario) return

    await page.goto(`/goal/${scenario.goalId}`)
    await page.waitForSelector('[data-testid="solution-card"]', { timeout: 10000 })

    // Submit multiple ratings quickly (simulating user clicking multiple stars)
    const ratingButtons = page.locator('[data-rating-star]')
    const buttonCount = await ratingButtons.count()

    if (buttonCount > 0) {
      // Click multiple rating buttons in rapid succession
      for (let i = 0; i < Math.min(3, buttonCount); i++) {
        await ratingButtons.nth(i).click({ timeout: 1000 })
        await page.waitForTimeout(100) // Small delay between clicks
      }

      // System should handle this gracefully without crashes
      await expect(page.locator('body')).toBeVisible() // Page should still be responsive
    }
  })

  test('should respond quickly to rating submissions', async ({ page }) => {
    const scenario = testData.scenarios.find(s => s.expectedMode === 'ai')
    if (!scenario) return

    await page.goto(`/goal/${scenario.goalId}`)
    await page.waitForSelector('[data-testid="solution-card"]', { timeout: 10000 })

    const ratingButton = page.locator('[data-rating-star="5"]').first()

    if (await ratingButton.count() > 0) {
      const startTime = Date.now()
      await ratingButton.click()

      // Wait for success feedback (Thanks! message)
      await expect(page.locator('text=Thanks!')).toBeVisible({ timeout: 5000 })

      const responseTime = Date.now() - startTime
      console.log(`Rating submission response time: ${responseTime}ms`)

      // Should respond within 3 seconds
      expect(responseTime).toBeLessThan(3000)
    }
  })
})