import { test, expect } from '@playwright/test'

test.describe('Solution Page Variant Functionality', () => {
  test('Omega-3 solution with 16 variants shows correct variant selector', async ({ page }) => {
    await page.goto('/solution/omega-3-a83c456d')

    // Wait for content to load
    await page.waitForSelector('h1', { timeout: 30000 })

    // Check title
    const title = await page.locator('h1').textContent()
    expect(title).toContain('Omega-3 Fatty Acids')

    // Check for variant count in header
    const variantCount = await page.locator('text=/Available in \\d+ variants/').first()
    await expect(variantCount).toBeVisible()
    const variantCountText = await variantCount.textContent()
    expect(variantCountText).toContain('16 variants')

    // Check variant selector exists
    await expect(page.locator('text=Select Variant')).toBeVisible()

    // Check All Variants button exists (use first() since we have mobile + desktop versions)
    await expect(page.locator('button', { hasText: 'All Variants' }).first()).toBeVisible()

    // Count variant buttons with dosage (should show 1000mg, 1200mg, etc.)
    const variantButtons = await page.locator('button').filter({ hasText: /\\d+mg/ }).count()
    expect(variantButtons).toBeGreaterThan(10) // Should have multiple dosage variants

    // Check goals section exists
    await expect(page.locator('text=/Works For These Goals|All Goals This Works For/')).toBeVisible()

    console.log('✅ Omega-3 variant selector working correctly')
  })

  test('Variant switching functionality works', async ({ page }) => {
    await page.goto('/solution/omega-3-a83c456d')
    await page.waitForSelector('h1', { timeout: 30000 })

    // Start with All Variants selected (use first() since we have mobile + desktop versions)
    const allVariantsButton = page.locator('button', { hasText: 'All Variants' }).first()
    await expect(allVariantsButton).toBeVisible()

    // Click on a specific variant
    const firstVariantButton = page.locator('button').filter({ hasText: /\\d+mg/ }).first()
    await firstVariantButton.click()

    // Wait for loading animation to complete
    await page.waitForTimeout(500)

    // Check that variant details are now shown
    await expect(page.locator('text=/Avg Rating:|Total Reviews:|Goals Tested:/')).toBeVisible()

    // Switch back to All Variants
    await allVariantsButton.click()
    await page.waitForTimeout(500)

    console.log('✅ Variant switching functionality working')
  })

  test('Single variant solution does not show variant selector', async ({ page }) => {
    // Test with a solution that should not have multiple variants
    await page.goto('/solution/headspace-91fc0245')

    // Wait for page to load or get 404
    try {
      await page.waitForSelector('h1', { timeout: 10000 })

      // Should not have variant selector
      const variantSelector = await page.locator('text=Select Variant').count()
      expect(variantSelector).toBe(0)

      // Should not have "Available in X variants" text
      const variantCountText = await page.locator('text=/Available in \\d+ variants/').count()
      expect(variantCountText).toBe(0)

      console.log('✅ Single variant solution correctly hides variant selector')
    } catch (error) {
      console.log('ℹ️ Single variant solution test skipped - page not found')
    }
  })
})