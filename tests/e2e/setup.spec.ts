import { test, expect } from '@playwright/test'

test('playwright setup verification', async ({ page }) => {
  // This test verifies that Playwright is correctly configured
  await page.goto('/')
  
  // Check that the page loads
  await expect(page).toHaveTitle(/WWFM/)
  
  // Basic smoke test - check for some expected content
  const body = page.locator('body')
  await expect(body).toBeVisible()
})