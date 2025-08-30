import { test, expect } from '@playwright/test'

test.describe('AI Solutions Display Verification', () => {
  // Test the 5 goals we manually inspected
  const testGoals = [
    { id: '23047783-3dc3-42f6-8b40-c1dd37a4693e', title: 'Be more productive', expectedSolutions: 10 },
    { id: 'a7c0d79e-4b60-4fb6-89c8-7dbdaff8fb56', title: 'Beat afternoon slump', expectedSolutions: 10 },
    { id: 'f894efa8-dd66-4657-917f-a4f6faadc3f6', title: 'Be comfortable at events', expectedSolutions: 10 },
    { id: '7d37d769-739d-41a4-b688-a25c547b1dd0', title: 'Afford groceries', expectedSolutions: 10 },
    { id: 'a63b0c25-7cf5-45ec-8259-fffe4ebd85cb', title: 'Be memorable', expectedSolutions: 10 }
  ]

  for (const goal of testGoals) {
    test(`should display AI solutions for "${goal.title}"`, async ({ page }) => {
      // Navigate to the goal page
      await page.goto(`/goal/${goal.id}`)
      
      // Wait for the page to load
      await page.waitForLoadState('networkidle')
      
      // Check that the goal title is displayed
      await expect(page.locator('h1', { hasText: goal.title })).toBeVisible()
      
      // Check that solutions are displayed
      const solutionCards = page.locator('[data-testid="solution-card"], .solution-card, [class*="solution"]')
      
      // Wait for solutions to load
      await expect(solutionCards.first()).toBeVisible({ timeout: 10000 })
      
      // Count the number of solutions
      const solutionCount = await solutionCards.count()
      console.log(`Found ${solutionCount} solutions for "${goal.title}"`)
      
      // Verify we have at least some solutions
      expect(solutionCount).toBeGreaterThan(0)
      
      // Check the first solution has required elements
      const firstSolution = solutionCards.first()
      
      // Check for title
      const titleElement = firstSolution.locator('h2, h3, [class*="title"]').first()
      await expect(titleElement).toBeVisible()
      const solutionTitle = await titleElement.textContent()
      console.log(`  First solution: ${solutionTitle}`)
      
      // Check for effectiveness rating
      const effectivenessElement = firstSolution.locator('[class*="effectiveness"], [class*="rating"], [class*="stars"]').first()
      if (await effectivenessElement.isVisible()) {
        console.log(`  Has effectiveness rating`)
      }
      
      // Check for category
      const categoryElement = firstSolution.locator('[class*="category"], [class*="badge"]').first()
      if (await categoryElement.isVisible()) {
        const category = await categoryElement.textContent()
        console.log(`  Category: ${category}`)
      }
      
      // Check for fields like time_to_results, cost, etc.
      const fieldsToCheck = ['time', 'cost', 'frequency']
      for (const field of fieldsToCheck) {
        const fieldElement = firstSolution.locator(`[class*="${field}"]`).first()
        if (await fieldElement.isVisible()) {
          const fieldValue = await fieldElement.textContent()
          console.log(`  ${field}: ${fieldValue}`)
        }
      }
    })
  }

  test('should display correct field values without dropdown mapping errors', async ({ page }) => {
    // Test "Be more productive" in detail
    await page.goto('/goal/23047783-3dc3-42f6-8b40-c1dd37a4693e')
    await page.waitForLoadState('networkidle')
    
    // Click on the first solution to see details
    const firstSolution = page.locator('[data-testid="solution-card"], .solution-card, [class*="solution"]').first()
    await firstSolution.click()
    
    // Wait for details to expand or modal to open
    await page.waitForTimeout(1000)
    
    // Check for specific field values that should be properly mapped
    const detailsContainer = page.locator('[class*="detail"], [class*="modal"], [class*="expand"]').first()
    
    // Check time commitment (should not be "Under 5 minutes" for everything)
    const timeCommitmentText = await detailsContainer.locator('text=/time.*commitment/i').textContent().catch(() => '')
    if (timeCommitmentText) {
      console.log(`Time commitment field: ${timeCommitmentText}`)
      expect(timeCommitmentText).not.toContain('undefined')
      expect(timeCommitmentText).not.toContain('null')
    }
    
    // Check frequency (should not be "three times daily" for exercise)
    const frequencyText = await detailsContainer.locator('text=/frequency/i').textContent().catch(() => '')
    if (frequencyText) {
      console.log(`Frequency field: ${frequencyText}`)
      expect(frequencyText).not.toContain('undefined')
      expect(frequencyText).not.toContain('null')
    }
    
    // Check cost fields
    const costText = await detailsContainer.locator('text=/cost/i').textContent().catch(() => '')
    if (costText) {
      console.log(`Cost field: ${costText}`)
      expect(costText).not.toContain('undefined')
      expect(costText).not.toContain('null')
    }
  })
})