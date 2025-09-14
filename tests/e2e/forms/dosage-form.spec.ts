import { createFormTest } from './form-test-factory'
import { dosageFormConfig } from './form-configs'

// Create comprehensive tests for DosageForm using the factory
createFormTest(dosageFormConfig)

// Additional DosageForm-specific tests can be added here
import { test, expect } from '@playwright/test'
import { generateTestSolution, cleanupTestData } from '../utils/test-helpers'

test.describe('DosageForm - Additional Tests', () => {
  test('handles variant-specific validation', async ({ page }) => {
    const testData = generateTestSolution('medications')
    
    await page.goto(`/goal/${testData.goalId}/add-solution`)
    
    // Use the search and dropdown pattern
    await page.fill('input#solution-name', testData.title)
    await page.waitForTimeout(2000)
    
    // Select from dropdown
    const dropdown = page.locator('[data-testid="solution-dropdown"]')
    await dropdown.waitFor({ state: 'visible', timeout: 5000 })
    const solutionButton = dropdown.locator(`button:has-text("${testData.title}")`)
    if (await solutionButton.isVisible()) {
      await solutionButton.click()
    } else {
      await dropdown.locator('button').first().click()
    }
    await page.waitForTimeout(500)
    
    // Click Continue to go to form
    const continueBtn = page.locator('button:has-text("Continue")')
    await continueBtn.click()
    await page.waitForTimeout(1000)
    
    // Wait for the dosage form to load and try to enter invalid dosage amount
    await page.waitForSelector('input[name="dosage_amount"]', { timeout: 10000 })
    await page.fill('input[name="dosage_amount"]', '-5')
    
    // Try to continue/submit - should show validation
    const nextBtn = page.locator('button:has-text("Continue"):not([disabled])').first()
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
    }
    
    // Should show validation error or button should remain disabled
    const errorVisible = await page.locator('text=/invalid|positive|greater/i').isVisible().catch(() => false)
    const buttonDisabled = await page.locator('button:has-text("Continue")[disabled]').isVisible().catch(() => false)
    
    expect(errorVisible || buttonDisabled).toBeTruthy()
    
    await cleanupTestData(testData.title)
  })
  
  test('preserves form data on navigation', async ({ page }) => {
    const testData = generateTestSolution('supplements_vitamins')
    
    await page.goto(`/goal/${testData.goalId}/add-solution`)
    
    // Use the search and dropdown pattern
    await page.fill('input#solution-name', testData.title)
    await page.waitForTimeout(2000)
    
    // Select from dropdown
    const dropdown = page.locator('[data-testid="solution-dropdown"]')
    await dropdown.waitFor({ state: 'visible', timeout: 5000 })
    const solutionButton = dropdown.locator(`button:has-text("${testData.title}")`)
    if (await solutionButton.isVisible()) {
      await solutionButton.click()
    } else {
      await dropdown.locator('button').first().click()
    }
    await page.waitForTimeout(500)
    
    // Click Continue to go to form
    const continueBtn = page.locator('button:has-text("Continue")')
    await continueBtn.click()
    await page.waitForTimeout(1000)
    
    // Fill some fields using the actual selectors
    await page.fill('input[name="dosage_amount"]', '1000')
    const costSelect = page.locator('select').nth(4) // Cost is usually the 5th select
    if (await costSelect.isVisible()) {
      await costSelect.selectOption({ label: /\$25.*50/ })
    }
    
    // Navigate back
    await page.click('button:has-text("Back")')
    
    // Navigate forward again
    await page.click('button:has-text("Next")')
    
    // Data should be preserved
    await expect(page.locator('[name="solution_title"]')).toHaveValue(testData.title)
    await expect(page.locator('[name="cost"]')).toHaveValue('$25-50/month')
    await expect(page.locator('[name="dosage_amount"]')).toHaveValue('1000')
    
    await cleanupTestData(testData.title)
  })
})