import { test, expect } from '@playwright/test'

test.describe('Debug Calm Solution', () => {
  test('Check if Calm exists as solution', async ({ page }) => {
    // Navigate to add solution page
    const ANXIETY_GOAL_ID = '56e2801e-0d78-4abd-a795-869e5b780ae7'
    await page.goto(`/goal/${ANXIETY_GOAL_ID}/add-solution`)
    
    // Wait for solution input
    await page.waitForSelector('#solution-name', { timeout: 5000 })
    
    // Type "Calm" and wait for dropdown
    await page.type('#solution-name', 'Calm')
    await page.waitForTimeout(2000)
    
    // Check what appears in dropdown
    const dropdownVisible = await page.locator('.absolute.z-10').isVisible()
    console.log('Dropdown visible:', dropdownVisible)
    
    if (dropdownVisible) {
      // Get all dropdown buttons
      const buttons = await page.locator('.absolute.z-10 button').all()
      console.log(`Found ${buttons.length} items in dropdown:`)
      
      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent()
        const innerHTML = await buttons[i].innerHTML()
        console.log(`Option ${i}: "${text}"`)
        
        // Check if this looks like an existing solution
        if (innerHTML.includes('existing') || innerHTML.includes('solution')) {
          console.log(`  -> Appears to be an existing solution`)
        }
      }
      
      // Click the first one
      if (buttons.length > 0) {
        const firstText = await buttons[0].textContent()
        console.log(`\nClicking on: "${firstText}"`)
        await buttons[0].click()
        
        // Wait and then click Continue
        await page.waitForTimeout(1000)
        const continueBtn = page.locator('button:has-text("Continue")')
        await continueBtn.click()
        
        // Wait for form to load
        await page.waitForTimeout(2000)
        
        // Check current URL and page content
        console.log('Current URL:', page.url())
        
        // Check if we're on the form
        const hasForm = await page.locator('text="How well it worked"').isVisible().catch(() => false)
        console.log('Form loaded:', hasForm)
        
        if (hasForm) {
          // Now submit the form to see what data is sent
          // Fill minimal required fields
          const ratingButtons = await page.locator('.grid.grid-cols-5 button').all()
          if (ratingButtons.length >= 4) {
            await ratingButtons[3].click() // 4 stars
          }
          
          await page.locator('select:visible').nth(0).selectOption('1-2 weeks')
          await page.locator('select:visible').nth(1).selectOption('Daily')
          await page.locator('select:visible').nth(2).selectOption('Monthly subscription')
          await page.locator('select:visible').nth(3).selectOption('$10-$19.99/month')
          
          // Go to step 2
          await page.click('button:has-text("Continue"):not([disabled])')
          await page.waitForTimeout(1000)
          
          // Step 2: Select "None" for challenges
          await page.click('label:has-text("None")')
          await page.click('button:has-text("Continue"):not([disabled])')
          await page.waitForTimeout(1000)
          
          // Step 3: Skip and submit
          console.log('\nAttempting to submit form...')
          await page.click('button:has-text("Submit"):not([disabled])')
          
          // Wait and check result
          await page.waitForTimeout(3000)
          
          // Check page content for success or error
          const bodyText = await page.textContent('body')
          if (bodyText?.includes('Thank')) {
            console.log('SUCCESS: Form submitted successfully!')
          } else if (bodyText?.includes('already')) {
            console.log('INFO: Solution already submitted (duplicate)')
          } else {
            console.log('UNKNOWN: Check page for result')
            
            // Check for any alerts
            const alerts = await page.locator('[role="alert"]').all()
            console.log(`Found ${alerts.length} alerts`)
            for (const alert of alerts) {
              const alertText = await alert.textContent()
              console.log('Alert:', alertText || '(empty)')
            }
          }
        }
      }
    } else {
      console.log('No dropdown appeared - Calm might not be in database')
    }
  })
})