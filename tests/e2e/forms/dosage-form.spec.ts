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
    await page.selectOption('[name="solution_category"]', 'medications')
    await page.click('button:has-text("Next")')
    
    // Try to enter invalid dosage amount
    await page.fill('[name="dosage_amount"]', '-5')
    await page.fill('[name="solution_title"]', testData.title)
    await page.click('button[type="submit"]')
    
    // Should show validation error
    await expect(page.locator('text=/invalid|positive|greater/i')).toBeVisible()
    
    await cleanupTestData(testData.title)
  })
  
  test('preserves form data on navigation', async ({ page }) => {
    const testData = generateTestSolution('supplements_vitamins')
    
    await page.goto(`/goal/${testData.goalId}/add-solution`)
    await page.selectOption('[name="solution_category"]', 'supplements_vitamins')
    await page.click('button:has-text("Next")')
    
    // Fill some fields
    await page.fill('[name="solution_title"]', testData.title)
    await page.selectOption('[name="cost"]', '$25-50/month')
    await page.fill('[name="dosage_amount"]', '1000')
    
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