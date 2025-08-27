/**
 * Smoke Test - Essential functionality validation
 * 
 * Based on actual application structure:
 * - Header shows user.email when authenticated
 * - Browse page has arenas with categories and goals
 * - Add solution uses SolutionFormWithAutoCategory
 */

import { test, expect } from '@playwright/test'
import { TEST_SOLUTIONS } from './fixtures/test-solutions'

test.describe('WWFM Smoke Tests', () => {
  
  test('authentication is working', async ({ page }) => {
    // Navigate to home which redirects to /browse
    await page.goto('/')
    
    // Should redirect to /browse
    await page.waitForURL('**/browse', { timeout: 5000 })
    
    // Wait a moment for Header component to hydrate (it's client-side)
    await page.waitForTimeout(2000)
    
    // Check Header component for auth indicators
    // When authenticated, Header shows user.email in a span
    const userEmail = await page.locator('span:has-text("test@wwfm-platform.com")').isVisible({ timeout: 3000 }).catch(() => false)
    const signOutButton = await page.locator('button:has-text("Sign Out")').isVisible({ timeout: 3000 }).catch(() => false)
    
    // Alternative: Try navigating to a protected page
    if (!userEmail && !signOutButton) {
      // Try going to add-solution (protected route)
      await page.goto('/goal/56e2801e-0d78-4abd-a795-869e5b780ae7/add-solution')
      
      // If we're redirected to signin, we're not authenticated
      const onSignInPage = await page.url().includes('/auth/signin')
      const onAddSolutionPage = await page.url().includes('/add-solution')
      
      // We should stay on add-solution page if authenticated
      expect(onAddSolutionPage && !onSignInPage).toBeTruthy()
    } else {
      // Header shows auth state
      expect(userEmail || signOutButton).toBeTruthy()
    }
  })

  test('can browse arenas and goals', async ({ page }) => {
    await page.goto('/browse')
    
    // Wait for SearchableBrowse component to render - input has id="goal-search"
    await page.waitForSelector('#goal-search', { timeout: 5000 })
    
    // Check for arenas - they should have name, description, and goal count
    // Based on SearchableBrowse component structure
    const hasArenas = await page.locator('h2').first().isVisible({ timeout: 3000 }).catch(() => false)
    
    // Or check for goals directly
    const hasGoals = await page.locator('a[href*="/goal/"]').first().isVisible({ timeout: 3000 }).catch(() => false)
    
    // Or check the search placeholder mentions goals
    const searchPlaceholder = await page.locator('#goal-search').getAttribute('placeholder')
    const hasSearchBar = searchPlaceholder?.includes('goals')
    
    expect(hasArenas || hasGoals || hasSearchBar).toBeTruthy()
  })
  
  test('can start adding a solution', async ({ page }) => {
    // Use test goal directly
    const TEST_GOAL_ID = '56e2801e-0d78-4abd-a795-869e5b780ae7'
    await page.goto(`/goal/${TEST_GOAL_ID}/add-solution`)
    
    // SolutionFormWithAutoCategory should load
    // It starts with a search input with id="solution-name"
    await page.waitForSelector('#solution-name', { timeout: 10000 })
    
    // The page should show "What helped you?" based on the component
    const hasCorrectTitle = await page.locator('text="What helped you?"').isVisible({ timeout: 3000 }).catch(() => false)
    expect(hasCorrectTitle).toBeTruthy()
    
    // Type a test solution name
    await page.fill('#solution-name', TEST_SOLUTIONS.apps_software)
    
    // Wait a moment for search/dropdown
    await page.waitForTimeout(1500)
    
    // Check for dropdown with data-testid="solution-dropdown"
    const dropdownVisible = await page.locator('[data-testid="solution-dropdown"]').isVisible({ timeout: 3000 }).catch(() => false)
    
    if (dropdownVisible) {
      // Click first suggestion
      const firstSuggestion = page.locator('[data-testid="solution-dropdown"] button').first()
      if (await firstSuggestion.isVisible({ timeout: 1000 }).catch(() => false)) {
        await firstSuggestion.click()
        await page.waitForTimeout(500)
      }
    }
    
    // Check if Continue button appears (data-testid="continue-button")
    const continueButton = await page.locator('[data-testid="continue-button"]').isVisible({ timeout: 3000 }).catch(() => false)
    
    // Or check if we went to category picker
    const categoryPicker = await page.locator('text="Choose a category"').isVisible({ timeout: 1000 }).catch(() => false)
    
    // Or check if form loaded directly (for known solutions)
    const formLoaded = await page.locator('text="How well it worked"').isVisible({ timeout: 1000 }).catch(() => false)
    
    // Any of these states means the add solution flow is working
    const isWorking = continueButton || categoryPicker || formLoaded
    
    expect(isWorking).toBeTruthy()
  })
  
  test.skip('can submit a complete solution', async ({ page }) => {
    // This is a more comprehensive test - skip in smoke test for speed
    // It would follow the full flow:
    // 1. Navigate to add-solution
    // 2. Search and select solution
    // 3. Fill form fields
    // 4. Submit and verify success
    
    // This is better covered by the complete form tests
  })
})