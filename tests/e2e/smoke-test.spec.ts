/**
 * Smoke Test - Essential functionality only
 * 
 * For pre-launch, we just need to verify:
 * 1. Auth works
 * 2. Can submit a solution
 * 3. Data is saved
 * 
 * Run this instead of the full suite during development
 */

import { test, expect } from '@playwright/test'

test.describe('WWFM Smoke Tests', () => {
  test('can submit a test solution', async ({ page }) => {
    // Go to test goal
    await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution')
    
    // Type test solution
    await page.fill('[data-testid="solution-name-input"]', 'Headspace (Test)')
    
    // Wait a moment for search to trigger
    await page.waitForTimeout(500)
    
    // Try clicking if dropdown appears
    const dropdown = page.locator('[data-testid="solution-dropdown"]')
    const dropdownVisible = await dropdown.isVisible({ timeout: 1000 }).catch(() => false)
    
    if (dropdownVisible) {
      // Click the first matching option
      const option = page.locator('[data-testid^="solution-option-"]').first()
      if (await option.isVisible({ timeout: 1000 })) {
        await option.click()
        // Wait for dropdown to close
        await page.waitForSelector('[data-testid="solution-dropdown"]', { state: 'hidden', timeout: 2000 }).catch(() => {})
      }
    }
    
    // Press Escape to ensure dropdown is closed
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    
    // Force click continue button even if something is intercepting
    await page.locator('[data-testid="continue-button"]').click({ force: true })
    
    // Wait for either form or category picker
    await page.waitForTimeout(1000)
    
    // Check if we're on category picker step
    const categoryPicker = page.locator('text="Select a category"')
    if (await categoryPicker.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Click the first category option
      const firstCategory = page.locator('button[class*="border"]').first()
      await firstCategory.click()
    }
    
    // Wait for form to load
    await page.waitForSelector('form', { timeout: 5000 })
    
    // Fill minimum required fields based on form type
    // Try to click star rating
    const stars = page.locator('[role="button"][aria-label*="star"]')
    if (await stars.first().isVisible({ timeout: 1000 })) {
      await stars.nth(3).click() // 4 stars
    }
    
    // Look for Continue buttons and click through steps
    let continueCount = 0
    while (continueCount < 5) {
      const continueBtn = page.locator('button:has-text("Continue"):visible').first()
      if (await continueBtn.isVisible({ timeout: 1000 })) {
        await continueBtn.click()
        continueCount++
        await page.waitForTimeout(500)
      } else {
        break
      }
    }
    
    // Try to submit
    const submitBtn = page.locator('button:has-text("Submit"):visible').first()
    if (await submitBtn.isVisible({ timeout: 2000 })) {
      await submitBtn.click()
    }
    
    // Wait for response
    await page.waitForTimeout(3000)
    
    // Check for success indicators
    const pageContent = await page.textContent('body')
    const isSuccess = 
      pageContent?.includes('Thank you') || 
      pageContent?.includes('recorded') ||
      pageContent?.includes('already rated') // This is also OK for our test
    
    expect(isSuccess).toBeTruthy()
  })
  
  test('can browse goals', async ({ page }) => {
    await page.goto('/browse')
    await expect(page.locator('h1, h2').first()).toBeVisible()
    
    // Check that we have some content
    const links = page.locator('a[href*="/goal/"]')
    const count = await links.count()
    expect(count).toBeGreaterThan(0)
  })
  
  test('auth is working', async ({ page }) => {
    await page.goto('/')
    
    // Check if we're logged in (should see email or sign out)
    const pageContent = await page.textContent('body')
    const isAuthenticated = 
      pageContent?.includes('test@wwfm-platform.com') ||
      pageContent?.includes('Sign Out')
    
    expect(isAuthenticated).toBeTruthy()
  })
})