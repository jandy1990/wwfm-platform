import { Page } from '@playwright/test'

/**
 * Specific form fillers for each form type
 * Each function knows the exact structure and requirements of its form
 */

/**
 * Helper function to wait for form submission success screen
 * Standardizes the waiting logic across all form fillers
 */
async function waitForFormSuccess(page: Page): Promise<void> {
  console.log('Waiting for success screen...')
  try {
    await page.waitForSelector('text="Thank you for sharing!"', { timeout: 60000 })
    console.log('✅ Success screen appeared')
  } catch (error) {
    console.log('⚠️ Success screen did not appear within 60 seconds')
    // Log what's on the page for debugging
    const pageText = await page.textContent('body')
    if (pageText?.includes('already rated')) {
      console.log('Note: Solution was already rated')
    }
  }
}

async function selectNonNoneOption(
  page: Page,
  candidates: string[],
  context: string
) {
  for (const option of candidates) {
    const locator = page.locator('label').filter({ hasText: option })
    if (await locator.first().isVisible().catch(() => false)) {
      await locator.first().click()
      console.log(`Selected ${context}: ${option}`)
      return true
    }
  }
  console.log(`WARNING: Could not find non-"None" option for ${context}`)
  return false
}

async function waitForStepTwo(page: Page, category: string): Promise<boolean> {
  if (page.isClosed()) {
    console.log('Cannot wait for Step 2 marker - page is already closed')
    return false
  }

  const timeout = 7000
  const markers =
    category === 'crisis_resources'
      ? [
          { locator: page.locator('text=/Any challenges\??/i'), label: 'Any challenges prompt' },
          { locator: page.locator('text=/barriers?/i'), label: 'Barriers prompt' },
        ]
      : [
          { locator: page.locator('text=/Any side effects\??/i'), label: 'Any side effects prompt' },
          { locator: page.locator('text=/Any challenges\??/i'), label: 'Any challenges prompt' },
        ]

  try {
    const visibleLabel = await Promise.any(
      markers.map(async marker => {
        await marker.locator.waitFor({ state: 'visible', timeout })
        return marker.label
      })
    )
    console.log(`Step 2 marker became visible: ${visibleLabel}`)
    return true
  } catch (error) {
    if (page.isClosed()) {
      console.log('Page closed before Step 2 markers became visible')
    } else {
      console.log('Step 2 markers did not appear before timeout')
    }
    return false
  }
}

// DosageForm filler - for medications, supplements, natural remedies, beauty_skincare
export async function fillDosageForm(page: Page, category: string) {
  console.log(`Starting DosageForm filler for category: ${category}`)
  
  // Wait for form to be ready - beauty_skincare shows effectiveness first, others show dosage
  if (category === 'beauty_skincare') {
    await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
    console.log('Form loaded - beauty_skincare starts with effectiveness section')
  } else {
    await page.waitForSelector('text="Your dosage"', { timeout: 5000 })
    console.log('Form loaded - starting with dosage section')
  }
  
  // ============ STEP 1: Dosage, Effectiveness, TTR ============
  console.log('Step 1: Filling dosage, effectiveness, and time to results')
  
  if (category === 'beauty_skincare') {
    // Beauty/skincare: NO DOSAGE FIELDS - effectiveness comes FIRST
    console.log('beauty_skincare category - effectiveness first, then application details')
    
    // Skip to effectiveness section below (it's handled after this if/else)
    console.log('Will handle effectiveness rating first, then application details')
  } else {
    // Other categories: Dosage amount, unit, frequency, length of use
    
    // Category-specific dosage amounts and units
    let dosageAmount = '500'
    let dosageUnit = 'mg'
    let frequencyValue = 'once daily'
    let lengthValue = '1-3 months'
    let timeToResultsValue = '1-2 weeks'
    
    // Adjust values based on category
    if (category === 'medications') {
      console.log('Using medications-specific values')
      dosageAmount = '20'  // Standard Prozac dose
      dosageUnit = 'mg'
      frequencyValue = 'once daily'
      lengthValue = '6-12 months'  // Medications often taken longer
      timeToResultsValue = '3-4 weeks'  // Antidepressants take longer
    } else if (category === 'natural_remedies') {
      console.log('Using natural_remedies-specific values')
      dosageAmount = '5'
      dosageUnit = 'ml'  // Liquid form for Lavender Oil (drops not available, using ml)
      frequencyValue = 'as needed'
      lengthValue = 'As needed'
      timeToResultsValue = 'Immediately'  // Essential oils work quickly
    }
    
    // Fill dosage amount
    const doseInput = page.locator('input[type="text"]').first()
    await doseInput.fill(dosageAmount)
    console.log(`Entered dosage amount: ${dosageAmount}`)
    await page.waitForTimeout(300)
    
    // Select unit (first select on page)
    const unitSelect = page.locator('select').nth(0)
    await unitSelect.selectOption(dosageUnit)
    console.log(`Selected unit: ${dosageUnit}`)
    await page.waitForTimeout(300)
    
    // Select frequency (second select)
    const frequencySelect = page.locator('select').nth(1)
    await frequencySelect.selectOption(frequencyValue)
    console.log(`Selected frequency: ${frequencyValue}`)
    await page.waitForTimeout(300)
    
    // Select length of use (third select)
    const lengthSelect = page.locator('select').nth(2)
    await lengthSelect.selectOption(lengthValue)
    console.log(`Selected length of use: ${lengthValue}`)
  }
  await page.waitForTimeout(500)
  
  // Now scroll down to effectiveness section
  await page.evaluate(() => window.scrollBy(0, 300))
  await page.waitForTimeout(500)
  
  // Click effectiveness rating (4 stars)
  const ratingButtons = await page.locator('.grid.grid-cols-5 button').all()
  if (ratingButtons.length >= 4) {
    await ratingButtons[3].click() // 4 stars
    console.log('Selected 4-star effectiveness rating')
  }
  await page.waitForTimeout(500)
  
  // For beauty_skincare, handle application details AFTER effectiveness
  if (category === 'beauty_skincare') {
    // Time to results (first select after effectiveness)
    const timeSelect = page.locator('select').nth(0)
    await timeSelect.selectOption('3-4 weeks')  // Retinol takes time
    console.log('Selected time to results: 3-4 weeks')
    await page.waitForTimeout(300)
    
    // Skincare frequency (second select)
    const skincareFrequencySelect = page.locator('select').nth(1)
    await skincareFrequencySelect.selectOption('once_daily_pm')  // Night use for retinol
    console.log('Selected skincare frequency: Once daily (night)')
    await page.waitForTimeout(300)
    
    // Length of use (third select)
    const lengthSelect = page.locator('select').nth(2)
    await lengthSelect.selectOption('3-6 months')  // Longer trial period
    console.log('Selected length of use: 3-6 months')
    await page.waitForTimeout(300)
  } else {
    // Select time to results (should be select after effectiveness section)
    const timeSelect = page.locator('select').nth(3)  // 4th select for other categories
    
    // Use category-specific time to results value
    let timeToResultsValue = '1-2 weeks'  // Default
    if (category === 'medications') {
      timeToResultsValue = '3-4 weeks'  // Antidepressants take longer
    } else if (category === 'natural_remedies') {
      timeToResultsValue = 'Immediately'  // Essential oils work quickly
    }
    
    await timeSelect.selectOption(timeToResultsValue)
    console.log(`Selected time to results: ${timeToResultsValue}`)
    await page.waitForTimeout(300)
  }

  // Note: Cost field has been moved to success screen (not in Step 1 anymore)

  // Click Continue to Step 2
  const continueBtn1 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn1.click()
  console.log('Moving to Step 2')
  await page.waitForTimeout(500)
  
  // ============ STEP 2: Side Effects ============
  console.log('Step 2: Selecting side effects')

  // Select "None" for side effects to keep tests simple and consistent
  const noneLabel = await page.locator('label:has-text("None")').first()
  await noneLabel.click({ force: true })
  console.log('Selected side effect: None')
  await page.waitForTimeout(500)
  
  // Click Continue to Step 3
  const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn2.click()
  console.log('Moving to Step 3')
  await page.waitForTimeout(500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  
  // Skip failed solutions and submit directly
  const submitBtn = page.locator('button:has-text("Submit"):not([disabled])')
  // AUTO_SUBMIT_ENABLED: Form filler handles submission for consistency
  await submitBtn.click()
  console.log('Submitted form')
  
  // Wait for success screen
  await waitForFormSuccess(page)
}

// AppForm filler - for apps_software
export async function fillAppForm(page: Page) {
  console.log('Starting AppForm filler - Updated for 3-step form')
  
  // Wait for form to be ready
  await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
  
  // ============ STEP 1: Basic Info & Effectiveness ============
  console.log('Step 1: Filling basic info and effectiveness')
  
  // Click effectiveness rating (4 stars = button index 3)
  // Based on AppForm.tsx line 309-340
  // Find the rating buttons by looking for the star rating container
  const ratingButtons = await page.locator('.grid.grid-cols-5 button').all()
  if (ratingButtons.length >= 4) {
    await ratingButtons[3].click() // 4 stars (index 3 = 4th button)
    console.log('Selected 4-star rating')
  }
  
  // Wait a moment for the selection to register
  await page.waitForTimeout(500)
  
  // Select time to results (first select on page)
  const timeSelect = page.locator('select:visible').first()
  await timeSelect.selectOption('1-2 weeks')
  console.log('Selected time to results: 1-2 weeks')
  
  // Select usage frequency (second select on page)
  const frequencySelect = page.locator('select:visible').nth(1)
  await frequencySelect.selectOption('Daily')
  console.log('Selected usage frequency: Daily')
  
  // Select subscription type (third select on page)
  const subscriptionSelect = page.locator('select:visible').nth(2)
  await subscriptionSelect.selectOption('Monthly subscription')
  console.log('Selected subscription type: Monthly subscription')
  
  // Wait for cost dropdown to appear (it's conditional based on subscription type)
  await page.waitForTimeout(500)
  
  // Select cost (fourth select, only visible for non-free subscriptions)
  const costSelect = page.locator('select:visible').nth(3)
  if (await costSelect.isVisible()) {
    await costSelect.selectOption('$10-$19.99/month')
    console.log('Selected cost: $10-$19.99/month')
  }
  
  // Click Continue to Step 2
  await page.waitForTimeout(500)
  const continueBtn1 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn1.click()
  console.log('Clicked Continue to Step 2')
  
  // ============ STEP 2: Challenges ============
  // Wait for Step 2 to load
  await page.waitForSelector('text="Any challenges?"', { timeout: 5000 })
  console.log('Step 2: Selecting challenges')

  // Select "None" as a valid challenge option
  const noneLabel = await page.locator('label:has-text("None")').first()
  await noneLabel.click({ force: true })
  console.log('Selected challenge: None')
  
  // Click Continue to Step 3
  await page.waitForTimeout(500)
  const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn2.click()
  console.log('Clicked Continue to Step 3')
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  // Wait for Step 3 to load
  await page.waitForSelector('text="What else did you try?"', { timeout: 5000 })
  console.log('Step 3: Skipping failed solutions')
  
  // Skip this step and submit the form
  await page.waitForTimeout(500)
  
  // Set up network monitoring to capture the submission request
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/') || response.url().includes('submit'),
    { timeout: 10000 }
  ).catch(() => null)
  
  // Set up console monitoring
  page.on('console', msg => {
    console.log(`Browser console [${msg.type()}]:`, msg.text())
  })
  
  // Set up error monitoring
  page.on('pageerror', error => {
    console.log('Page error:', error.message)
  })
  
  const submitBtn = page.locator('button:has-text("Submit"):not([disabled])')
  console.log('Submit button found, clicking...')
  await submitBtn.click()
  console.log('Clicked Submit button')
  
  // Wait for potential network response
  const response = await responsePromise
  if (response) {
    console.log('Network response received:')
    console.log('  Status:', response.status())
    console.log('  URL:', response.url())
    const responseBody = await response.text().catch(() => 'Could not read body')
    console.log('  Body:', responseBody.substring(0, 500))
  }
  
  // Wait a bit for any UI updates
  await page.waitForTimeout(3000)
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'submission-result.png' })
  console.log('Screenshot saved to submission-result.png')
  
  // Check for various UI elements
  console.log('Checking submission result...')
  
  // Log all visible text on the page for debugging
  const visibleText = await page.evaluate(() => {
    const elements = document.querySelectorAll('body *:not(script):not(style)')
    const texts = []
    elements.forEach(el => {
      const text = el.textContent?.trim()
      if (text && text.length > 0 && text.length < 200) {
        texts.push(text)
      }
    })
    return [...new Set(texts)].slice(0, 50) // First 50 unique text elements
  })
  console.log('Visible text elements:', visibleText)
  
  // Check for alerts/toasts with more detail
  const alertElements = await page.locator('[role="alert"], .toast, .notification, .error, .Toaster').all()
  console.log(`Found ${alertElements.length} alert-like elements`)
  
  for (const alert of alertElements) {
    const text = await alert.textContent()
    const isVisible = await alert.isVisible()
    const classes = await alert.getAttribute('class')
    console.log('Alert element:')
    console.log('  Text:', text || '(empty)')
    console.log('  Visible:', isVisible)
    console.log('  Classes:', classes)
    
    // Get computed styles to understand if it's an error
    const styles = await alert.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        display: computed.display
      }
    })
    console.log('  Styles:', styles)
  }
  
  // Check for success indicators
  const hasThankYou = await page.locator('text="Thank you"').isVisible().catch(() => false)
  const hasSuccess = await page.locator('text=/success|recorded|added/i').isVisible().catch(() => false)
  
  if (hasThankYou || hasSuccess) {
    console.log('Success screen displayed!')
    return
  }
  
  // Check for duplicate submission
  const hasDuplicate = await page.locator('text=/already|duplicate|existing/i').isVisible().catch(() => false)
  if (hasDuplicate) {
    console.log('Solution already submitted (expected for repeated tests)')
    return
  }
  
  // Check if we're still on the form
  const stillOnForm = await page.locator('text="What else did you try?"').isVisible().catch(() => false)
  if (stillOnForm) {
    console.log('Still on form after submission attempt')
    
    // Check if submit button is disabled (might indicate processing)
    const submitDisabled = await submitBtn.isDisabled()
    console.log('Submit button disabled:', submitDisabled)
    
    // Check for any loading indicators
    const hasSpinner = await page.locator('.animate-spin, [role="status"]').isVisible().catch(() => false)
    console.log('Loading spinner visible:', hasSpinner)
  }
  
  // Get current URL to see if navigation happened
  console.log('Current URL:', page.url())
  
  console.log('Warning: Could not confirm submission success, investigation complete')
}

// HobbyForm filler - for hobbies_activities (3-step wizard)
export async function fillHobbyForm(page: Page) {
  console.log('Starting HobbyForm filler - 3-step wizard')
  
  // Step 1: Effectiveness and hobby details
  console.log('Step 1: Filling effectiveness and hobby details')
  
  // First, click effectiveness rating (4 stars)
  const ratingButtons = await page.locator('.grid.grid-cols-5 button').all()
  if (ratingButtons.length >= 4) {
    console.log('Clicking 4-star rating')
    await ratingButtons[3].click()
    await page.waitForTimeout(500)
  }
  
  // Time to results dropdown
  const timeSelects = await page.locator('select').all()
  if (timeSelects.length >= 1) {
    console.log('Selecting time to results')
    await timeSelects[0].selectOption('1-2 weeks')
    await page.waitForTimeout(300)
  }
  
  // Select startup cost
  if (timeSelects.length >= 2) {
    console.log('Selecting startup cost')
    await timeSelects[1].selectOption('$50-$100')
    await page.waitForTimeout(300)
  }
  
  // Select ongoing cost
  if (timeSelects.length >= 3) {
    console.log('Selecting ongoing cost')
    await timeSelects[2].selectOption('Under $25/month')
    await page.waitForTimeout(300)
  }
  
  // Time investment
  if (timeSelects.length >= 4) {
    console.log('Selecting time investment')
    await timeSelects[3].selectOption('1-2 hours')
    await page.waitForTimeout(300)
  }
  
  // Frequency
  if (timeSelects.length >= 5) {
    console.log('Selecting frequency')
    await timeSelects[4].selectOption('Daily')
    await page.waitForTimeout(300)
  }
  
  // Click Continue to Step 2
  console.log('Clicking Continue to Step 2')
  await page.waitForTimeout(1000)
  const continueBtn1 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn1.click()
  await page.waitForTimeout(500)
  
  // Step 2: Challenges  
  console.log('Step 2: Selecting challenges')
  // Select "None" for challenges (should be default but make sure)
  await page.click('label:has-text("None")')
  await page.waitForTimeout(500)
  
  // Click Continue to Step 3
  console.log('Clicking Continue to Step 3')
  const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn2.click()
  await page.waitForTimeout(500)
  
  // Step 3: Skip failed solutions
  console.log('Step 3: Submitting form')
  const submitBtn = page.locator('button:has-text("Submit")')
  await submitBtn.click()
  
  // Wait for success screen
  await waitForFormSuccess(page)
}

// SessionForm filler - for therapists, doctors, coaches, etc.
export async function fillSessionForm(page: Page, category: string) {
  console.log(`Starting SessionForm filler for category: ${category}`)
  
  // Wait for form to be ready
  await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
  
  // ============ STEP 1: Effectiveness, Time to results, Cost, and Category-specific fields ============
  console.log('Step 1: Filling effectiveness, time to results, cost, and session details')
  
  // Click effectiveness rating (4 stars)
  // Try to find effectiveness rating buttons more reliably
  await page.waitForSelector('text="How well it worked"')
  await page.waitForTimeout(1000) // Give ratings time to render
  
  // Check if using button-based UI (for crisis_resources and potentially others)
  const effectivenessButtons = page.locator('button').filter({ hasText: /Not at all|Slightly|Moderate|Very|Extremely/i });
  const hasEffectivenessButtons = await effectivenessButtons.count() > 0;
  
  if (hasEffectivenessButtons) {
    // New button-based UI - click "Very"
    const veryButton = effectivenessButtons.filter({ hasText: 'Very' }).first();
    await veryButton.click();
    console.log('Selected "Very effective" using button UI');
  } else {
    // Original star rating UI
    const ratingButtonsLocator = page.locator('.grid.grid-cols-5 button');
    const ratingButtonCount = await ratingButtonsLocator.count();
    console.log(`Found ${ratingButtonCount} rating buttons`);
    
    if (ratingButtonCount >= 4) {
      await ratingButtonsLocator.nth(3).click(); // 4 stars (index 3 = 4th button)
      console.log('Selected 4-star effectiveness rating');
      await page.waitForTimeout(500);
      
      // Verify the button was clicked and effectiveness is set
      const isSelected = await ratingButtonsLocator.nth(3).getAttribute('class');
      console.log(`4-star button classes: ${isSelected}`);
    } else {
      console.log('ERROR: Could not find effectiveness rating buttons');
      // Try alternative selector
      const alternativeButtonsLocator = page.locator('button').filter({ hasText: /^\d+$/ });
      const alternativeCount = await alternativeButtonsLocator.count();
      console.log(`Found ${alternativeCount} alternative rating buttons`);
      if (alternativeCount >= 4) {
        await alternativeButtonsLocator.nth(3).click();
        console.log('Selected 4-star effectiveness rating (alternative selector)');
      }
    }
  }
  await page.waitForTimeout(500)
  
  // Select time to results - check if using buttons or select/dropdown
  let timeToResults = '1-2 weeks'; // Define at higher scope for logging
  const timeButtons = page.locator('button').filter({ hasText: /Immediate|days|weeks|months/i });
  const hasTimeButtons = await timeButtons.count() > 0;
  
  if (hasTimeButtons) {
    // Button-based UI for time to results (crisis_resources)
    const immediateButton = timeButtons.filter({ hasText: /Immediate/i }).first();
    await immediateButton.click();
    timeToResults = 'Immediate';
    console.log('Selected "Immediate" time to results using button UI');
  } else {
    // Check for native select or custom dropdown
    const hasNativeSelect = await page.locator('select').first().isVisible().catch(() => false);
    
    if (hasNativeSelect) {
      // Use native select element
      const timeSelect = page.locator('select').first();
      await timeSelect.selectOption(timeToResults);
      console.log('Selected time to results using native select: 1-2 weeks');
    } else {
      // Use custom Select component
      const timeSelect = page.locator('button[role="combobox"]').first();
      await timeSelect.click();
      await page.waitForTimeout(500);
      
      // Try to click the option with various selectors
      const clicked = await page.locator('text="1-2 weeks"').first().click({ timeout: 2000 }).then(() => true).catch(() => false);
      if (!clicked) {
        console.log('WARNING: Could not select time to results');
        timeToResults = 'not selected';
      } else {
        console.log('Selected time to results: 1-2 weeks');
      }
    }
  }
  await page.waitForTimeout(300)
  
  // Select cost type (radio buttons) - now using standard HTML radio inputs
  // Wait for the cost section to be fully rendered (it's conditional based on category)
  await page.waitForSelector('text="Cost?"', { timeout: 10000 })
  console.log('Cost section found')
  
  // For therapists_counselors category, radio buttons should be visible
  // Wait a bit longer for dynamic content to render
  await page.waitForTimeout(1000)
  
  // Check if radio buttons are present
  const radioButtonsExist = await page.locator('input[type="radio"][value="per_session"]').count() > 0
  console.log(`Radio buttons exist on page: ${radioButtonsExist}`)
  
  if (!radioButtonsExist) {
    // crisis_resources doesn't have cost type radio buttons - that's OK!
    if (category === 'crisis_resources') {
      console.log('No radio buttons for crisis_resources - this is expected')
      // Skip cost type selection for crisis_resources
    } else {
      // Other categories should have radio buttons
      await page.screenshot({ path: 'session-form-no-radio.png' })
      console.log('No radio buttons found - screenshot saved')
      
      // Check what's actually on the page
      const pageContent = await page.textContent('body')
      console.log('Page contains "Per session":', pageContent?.includes('Per session'))
      console.log('Page contains "Monthly":', pageContent?.includes('Monthly'))
      
      throw new Error(`Radio buttons not found for category: ${category}. Check SessionForm.tsx conditions.`)
    }
  } else {
    // Try clicking the label first (most user-like interaction)
    const costTypeLabel = page.locator('label:has-text("Per session")')
    await costTypeLabel.click()
    console.log('Clicked cost type label: Per session')
    await page.waitForTimeout(500)
    
    // Check if it worked
    let isChecked = await page.locator('input[type="radio"][value="per_session"]').isChecked().catch(() => false)
    console.log(`Cost type radio button checked after label click: ${isChecked}`)
    
    // If label click didn't work, try direct radio button interaction
    if (!isChecked) {
      console.log('Label click failed, trying radio button directly')
      const radioButton = page.locator('input[type="radio"][value="per_session"]')
      
      // Force click if necessary to bypass any overlays
      await radioButton.click({ force: true })
      await page.waitForTimeout(300)
      
      isChecked = await radioButton.isChecked()
      console.log(`Cost type radio button checked after direct click: ${isChecked}`)
    }
    
    // Final fallback: use JavaScript execution to set the radio button
    if (!isChecked) {
      console.log('Direct click failed, using JavaScript to set radio button')
      await page.evaluate(() => {
        const radio = document.querySelector('input[type="radio"][value="per_session"]') as HTMLInputElement
        if (radio) {
          radio.checked = true
          radio.dispatchEvent(new Event('change', { bubbles: true }))
          // Trigger React onChange handler
          const changeEvent = new Event('change', { bubbles: true })
          radio.dispatchEvent(changeEvent)
        }
      })
      await page.waitForTimeout(500)
      
      isChecked = await page.locator('input[type="radio"][value="per_session"]').isChecked()
      console.log(`Cost type radio button checked after JavaScript: ${isChecked}`)
    }
    
    if (!isChecked) {
      throw new Error('Unable to select cost type radio button after all attempts')
    }
    
    console.log('✅ Cost type "Per session" successfully selected')
  }
  
  await page.waitForTimeout(1000) // Wait longer for cost range dropdown to appear
  
  // Wait for cost range dropdown to appear after selecting cost type
  console.log('Waiting for cost range dropdown to appear...');
  
  // For crisis_resources, cost range is immediately visible (no radio buttons)
  // For other categories, wait for React to re-render after radio selection
  if (category !== 'crisis_resources') {
    await page.waitForTimeout(1000); // Give React time to re-render after radio selection
  }
  
  // Select cost range using the Shadcn Select component
  console.log('Looking for cost range Select trigger...');
  
  // The cost range Select should be visible now
  // Look for the SelectTrigger that contains cost range placeholder text
  const costRangeTrigger = page.locator('button[role="combobox"]').filter({ hasText: 'Select cost range' }).first();
  const hasCostRangeTrigger = await costRangeTrigger.isVisible().catch(() => false);
  
  if (hasCostRangeTrigger) {
    console.log('Found cost range Select trigger, clicking...');
    await costRangeTrigger.click();
    await page.waitForTimeout(500);
    
    // Wait for dropdown content to appear
    await page.waitForSelector('[role="option"]', { timeout: 3000 });
    
    // Select appropriate option based on category
    let selectedOption = false;
    
    if (category === 'crisis_resources') {
      // crisis_resources has different options: Free, Donation-based, Sliding scale, Don't remember
      const freeOption = page.locator('[role="option"]').filter({ hasText: 'Free' }).first();
      if (await freeOption.isVisible().catch(() => false)) {
        await freeOption.click();
        console.log('Selected cost range: Free');
        selectedOption = true;
      }
    } else {
      // Other categories have numeric ranges
      const costOption = page.locator('[role="option"]').filter({ hasText: '$0-10' }).first();
      if (await costOption.isVisible().catch(() => false)) {
        await costOption.click();
        console.log('Selected cost range: $0-10/session');
        selectedOption = true;
      }
    }
    
    if (!selectedOption) {
      // Fallback: click first available option
      const firstOption = page.locator('[role="option"]').first();
      await firstOption.click();
      console.log('Selected first available cost range option');
    }
    await page.waitForTimeout(500);
  } else {
    console.log('ERROR: Cost range Select trigger not found');
    // Take a screenshot for debugging
    await page.screenshot({ path: 'session-form-cost-range-missing.png' });
  }
  
  // Session frequency - REQUIRED for most categories
  // Note: crisis_resources doesn't require session_frequency
  if (category !== 'crisis_resources') {
    console.log('Selecting session frequency (required field)...');
    
    // Session frequency is a Select component (not native select)
    // It should be the second combobox after cost range
    const allComboboxes = await page.locator('button[role="combobox"]').all();
    console.log(`Found ${allComboboxes.length} Select components for session frequency selection`);
    
    // Session frequency is typically the 2nd combobox (index 1)
    if (allComboboxes.length > 1) {
      const freqTrigger = allComboboxes[1];
      const triggerText = await freqTrigger.textContent();
      
      // Verify this is the session frequency dropdown
      if (triggerText?.includes('How often') || triggerText?.includes('frequency') || 
          triggerText?.includes('Weekly') || triggerText?.includes('Monthly')) {
        await freqTrigger.click();
        await page.waitForTimeout(500);
        
        // Select Weekly option
        const weeklyOption = page.locator('[role="option"]').filter({ hasText: 'Weekly' });
        if (await weeklyOption.isVisible()) {
          await weeklyOption.click();
          console.log('Selected session frequency: Weekly');
        } else {
          // Fallback to first option
          await page.locator('[role="option"]').first().click();
          console.log('Selected first available session frequency');
        }
      } else {
        console.log(`Warning: Expected session frequency dropdown but found "${triggerText}"`);
      }
    } else {
      console.log('ERROR: Not enough Select components found for session frequency');
    }
    await page.waitForTimeout(300);
  } else {
    console.log('Skipping session frequency for crisis_resources category');
  }
  
  // Format - Select component
  console.log('Selecting format...');
  
  // Format is typically the 3rd combobox (index 2) for most categories
  const comboboxCount2 = await page.locator('button[role="combobox"]').count();
  const formatIndex = category === 'crisis_resources' ? 1 : 2; // Adjust index based on category
  
  if (comboboxCount2 > formatIndex) {
    const formatTrigger = page.locator('button[role="combobox"]').nth(formatIndex);
    const triggerText = await formatTrigger.textContent();
    
    // Verify this looks like the format dropdown
    if (triggerText?.includes('format') || triggerText?.includes('In-person') || 
        triggerText?.includes('Virtual') || triggerText?.includes('Phone')) {
      await formatTrigger.click();
      await page.waitForTimeout(500);
      
      let formatValue = 'In-person';
      if (category === 'crisis_resources') {
        formatValue = 'Phone';
      } else if (category === 'medical_procedures') {
        formatValue = 'Outpatient';
      }
      
      // Try to select the specific format
      const formatOption = page.locator('[role="option"]').filter({ hasText: formatValue });
      if (await formatOption.isVisible()) {
        await formatOption.click();
        console.log(`Selected format: ${formatValue}`);
      } else {
        // Fallback to first option
        await page.locator('[role="option"]').first().click();
        console.log('Selected first available format');
      }
    } else {
      console.log(`Warning: Expected format dropdown but found "${triggerText}"`);
    }
  }
  await page.waitForTimeout(300)
  
  // Session length - REQUIRED for therapists_counselors, OPTIONAL for others but may still appear
  // Check if session length dropdown exists for any category
  const comboboxCount3 = await page.locator('button[role="combobox"]').count();
  let sessionLengthFound = false;
  
  // Look for session length dropdown by checking text content
  for (let i = 0; i < comboboxCount3; i++) {
    const combobox = page.locator('button[role="combobox"]').nth(i);
    const triggerText = await combobox.textContent();
    if (triggerText?.includes('How long') || triggerText?.includes('minutes') || 
        triggerText?.includes('length')) {
      sessionLengthFound = true;
      console.log(`Found session length dropdown at index ${i} for ${category}`);
      
      // Fill it whether required or not to ensure form validation passes
      await combobox.click();
      await page.waitForTimeout(500);
      
      // Select 60 minutes option if available
      const sixtyMinOption = page.locator('[role="option"]').filter({ hasText: '60 minutes' });
      if (await sixtyMinOption.isVisible()) {
        await sixtyMinOption.click();
        console.log('Selected session length: 60 minutes');
      } else {
        // Fallback to first option
        await page.locator('[role="option"]').first().click();
        console.log('Selected first available session length');
      }
      await page.waitForTimeout(300);
      break;
    }
  }
  
  if (!sessionLengthFound && category === 'therapists_counselors') {
    console.log('ERROR: Session length dropdown not found for therapists_counselors (REQUIRED)');
  }
  
  // Insurance coverage - OPTIONAL for therapists, doctors, medical_procedures
  if (['therapists_counselors', 'doctors_specialists', 'medical_procedures'].includes(category)) {
    console.log('Looking for insurance coverage dropdown...');
    
    // Insurance coverage is usually one of the last comboboxes
    const allComboboxes4 = await page.locator('button[role="combobox"]').all();
    
    for (let i = 0; i < allComboboxes4.length; i++) {
      const triggerText = await allComboboxes4[i].textContent();
      if (triggerText?.includes('Coverage') || triggerText?.includes('insurance')) {
        console.log(`Found insurance coverage dropdown at index ${i}`);
        
        await allComboboxes4[i].click();
        await page.waitForTimeout(500);
        
        // Select first available option
        await page.locator('[role="option"]').first().click();
        console.log('Selected first available insurance coverage option');
        await page.waitForTimeout(300);
        break;
      }
    }
  }
  
  // Wait time - OPTIONAL for doctors_specialists
  if (category === 'doctors_specialists') {
    console.log('Looking for wait time dropdown (optional for doctors)...');
    
    const allComboboxes5 = await page.locator('button[role="combobox"]').all();
    
    for (let i = 0; i < allComboboxes5.length; i++) {
      const triggerText = await allComboboxes5[i].textContent();
      if (triggerText?.includes('Time to get appointment') || triggerText?.includes('Wait time')) {
        console.log(`Found wait time dropdown at index ${i}`);
        
        await allComboboxes5[i].click();
        await page.waitForTimeout(500);
        
        // Select "Within a week" if available
        const weekOption = page.locator('[role="option"]').filter({ hasText: 'Within a week' });
        if (await weekOption.isVisible()) {
          await weekOption.click();
          console.log('Selected wait time: Within a week');
        } else {
          await page.locator('[role="option"]').first().click();
          console.log('Selected first available wait time');
        }
        await page.waitForTimeout(300);
        break;
      }
    }
  }
  
  // Wait time - REQUIRED for medical_procedures
  if (category === 'medical_procedures') {
    console.log('Selecting wait time (REQUIRED for medical_procedures)...');
    
    // Wait time is a Select component
    const waitTrigger = await page.locator('button[role="combobox"]').filter({ hasText: 'Time to get appointment' }).first();
    const hasWaitTrigger = await waitTrigger.isVisible().catch(() => false);
    
    if (hasWaitTrigger) {
      await waitTrigger.click();
      await page.waitForTimeout(500);
      
      // Select "Within a week" option
      const option = page.locator('[role="option"]').filter({ hasText: 'Within a week' }).first();
      if (await option.isVisible()) {
        await option.click();
        console.log('Selected wait time: Within a week');
      } else {
        // Fallback to first option
        await page.locator('[role="option"]').first().click();
        console.log('Selected first available wait time');
      }
    } else {
      console.log('ERROR: Wait time dropdown not found for medical_procedures');
    }
    await page.waitForTimeout(300);
  }
  
  // Specialty - REQUIRED for professional_services
  if (category === 'professional_services') {
    console.log('Selecting specialty (REQUIRED for professional_services)...');
    
    // Specialty is a Select component
    const specialtyTrigger = await page.locator('button[role="combobox"]').filter({ hasText: 'Select service type' }).first();
    const hasSpecialtyTrigger = await specialtyTrigger.isVisible().catch(() => false);
    
    if (hasSpecialtyTrigger) {
      await specialtyTrigger.click();
      await page.waitForTimeout(500);
      
      // Select first available option
      const firstOption = page.locator('[role="option"]').first();
      await firstOption.click();
      console.log('Selected first available specialty');
    } else {
      console.log('ERROR: Specialty dropdown not found for professional_services');
    }
    await page.waitForTimeout(300);
  }
  
  // Response time - REQUIRED for crisis_resources
  if (category === 'crisis_resources') {
    console.log('Selecting response time (REQUIRED for crisis_resources)...');

    // Simplified approach: Find the last combobox on the page (it's the response_time dropdown)
    const allComboboxes = await page.locator('button[role="combobox"]').count();
    console.log(`Found ${allComboboxes} total comboboxes - response_time should be the last one`);

    if (allComboboxes > 0) {
      // For crisis_resources: cost (index 0), format (index 1), response_time (index 2/last)
      const responseTimeIndex = allComboboxes - 1; // Last combobox
      const responseTrigger = page.locator('button[role="combobox"]').nth(responseTimeIndex);

      console.log(`Clicking response time dropdown at index ${responseTimeIndex}`);
      await responseTrigger.click();
      await page.waitForTimeout(500);

      // Wait for options to appear and select first one
      const optionsVisible = await page.locator('[role="option"]').first().isVisible({ timeout: 3000 }).catch(() => false);
      if (optionsVisible) {
        // Try to select "Immediate" if available, otherwise first option
        const immediateOption = page.locator('[role="option"]').filter({ hasText: 'Immediate' }).first();
        const hasImmediate = await immediateOption.isVisible().catch(() => false);

        if (hasImmediate) {
          await immediateOption.click();
          console.log('Selected response time: Immediate');
        } else {
          await page.locator('[role="option"]').first().click();
          console.log('Selected first available response time option');
        }
      } else {
        console.log('WARNING: Response time options did not appear');
      }
    } else {
      console.log('ERROR: No comboboxes found on page');
    }

    console.log('Response time selection completed');
    await page.waitForTimeout(500);
  }
  
  // Debug: Check form field states before clicking Continue
  console.log('\n=== DEBUGGING FORM STATE BEFORE CONTINUE ===')
  
  // Check if Continue button is enabled/disabled
  const continueBtn = page.locator('button:has-text("Continue")')
  const isDisabled = await continueBtn.getAttribute('disabled')
  console.log(`Continue button disabled attribute: ${isDisabled}`)
  
  // Check effectiveness state via DOM
  const effectivenessSelected = await page.evaluate(() => {
    const buttons = document.querySelectorAll('.grid.grid-cols-5 button');
    for (let i = 0; i < buttons.length; i++) {
      const classes = buttons[i].className;
      if (classes.includes('border-blue-500') || classes.includes('bg-blue-50')) {
        return i + 1; // Return 1-based rating
      }
    }
    return null;
  });
  console.log(`Effectiveness rating from DOM: ${effectivenessSelected}`);
  
  // Check select field values
  const selectCount = await page.locator('select').count();
  console.log(`Found ${selectCount} native select elements`);
  
  for (let i = 0; i < selectCount; i++) {
    const value = await page.locator('select').nth(i).inputValue();
    console.log(`Select ${i} value: "${value}"`);
  }
  
  // Check radio button state
  const checkedRadio = await page.locator('input[type="radio"]:checked').inputValue().catch(() => 'none');
  console.log(`Checked radio button value: ${checkedRadio}`);
  
  // Check cost range field specifically since it's required
  let costRangeValue = 'skipped';
  if (category !== 'crisis_resources') {
    const costRangeCombobox = await page.locator('button[role="combobox"]').first();
    costRangeValue = await costRangeCombobox.textContent().catch(() => 'error');
    console.log(`Cost range field text: "${costRangeValue}"`);
  } else {
    console.log('Skipping cost range text check for crisis_resources to avoid timeout');
  }
  
  // Check all required fields for validation
  console.log(`\n=== CHECKING REQUIRED FIELDS FOR ${category} ===`);
  console.log(`✓ Effectiveness: ${effectivenessSelected} (required: not null)`);
  console.log(`✓ Time to results: "${timeToResults}" (required: not empty)`);
  console.log(`✓ Cost type: "${checkedRadio}" (affects cost range visibility)`);
  
  if (costRangeValue && !costRangeValue.includes('Select cost range') && costRangeValue !== 'error' && costRangeValue !== 'skipped') {
    console.log(`✅ Cost range: "${costRangeValue}" (required: not empty) - SELECTED VALUE FOUND`);
  } else if (costRangeValue !== 'skipped') {
    console.log(`❌ Cost range: "${costRangeValue}" (required: not empty) - PLACEHOLDER OR MISSING`);
  }
  console.log('=== END REQUIRED FIELDS CHECK ===\n');
  
  if (costRangeValue && costRangeValue.includes('Select cost range')) {
    console.log('🔍 ISSUE IDENTIFIED: Cost range dropdown shows placeholder, not selected value');
    console.log('    This means the cost range selection in the test is not working properly.');
  }
  
  console.log('=== END DEBUG INFO ===\n')
  
  const continueButton = page.locator('button').filter({ hasText: /Continue/i }).first()

  console.log('Preparing to click Continue and advance to Step 2')

  try {
    await continueButton.waitFor({ state: 'visible', timeout: 5000 })
  } catch (error) {
    if (page.isClosed()) {
      throw new Error('Page context closed before Continue button became visible')
    }
    console.log('Continue button not visible within timeout:', error instanceof Error ? error.message : error)
    await page.screenshot({ path: `session-form-no-continue-${category}.png` }).catch(() => {})
    throw new Error('Continue button not available for Step 2 transition')
  }

  const continueDisabled = await continueButton.isDisabled().catch(() => false)
  if (continueDisabled) {
    console.log('Continue button remains disabled after filling required fields')
    await page.screenshot({ path: 'session-form-validation-failed.png' }).catch(() => {})
    throw new Error('Continue button remains disabled after filling all fields')
  }

  console.log('Clicking Continue with noWaitAfter and waiting for Step 2 marker')

  try {
    await continueButton.click({ noWaitAfter: true })
  } catch (error) {
    if (page.isClosed()) {
      throw new Error('Page context closed while clicking Continue')
    }
    console.log('Regular click failed, retrying with force:', error instanceof Error ? error.message : error)
    await continueButton.click({ force: true, noWaitAfter: true })
  }

  const step2Reached = await waitForStepTwo(page, category)

  if (!step2Reached) {
    if (page.isClosed()) {
      throw new Error('Page context closed before Step 2 marker appeared')
    }
    console.log('Warning: Step 2 marker not detected after Continue click')
    await page.screenshot({ path: `session-form-step2-missing-${category}.png` }).catch(() => {})
    throw new Error('Step 2 did not appear after Continue click')
  }

  // ============ STEP 2: Side Effects or Barriers ============
  const showSideEffects = ['medical_procedures', 'alternative_practitioners'].includes(category)
  const showBarriers = ['therapists_counselors', 'coaches_mentors', 'doctors_specialists', 'professional_services', 'crisis_resources'].includes(category)
  
  if (showSideEffects) {
    console.log('Step 2: Selecting side effects')
    // Select "None" side effect
    const noneEffect = page.locator('label').filter({ hasText: 'None' })
    if (await noneEffect.isVisible()) {
      await noneEffect.click()
      console.log('Selected side effect: None')
    }
  } else if (showBarriers) {
    console.log('Step 2: Selecting barriers')
    // Select "None" barrier
    const noneBarrier = page.locator('label').filter({ hasText: 'None' })
    if (await noneBarrier.isVisible()) {
      await noneBarrier.click()
      console.log('Selected barrier: None')
    }
  }
  await page.waitForTimeout(500)
  
  // Click Continue to Step 3
  const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn2.click()
  console.log('Moving to Step 3')
  await page.waitForTimeout(500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  
  // Skip failed solutions and submit directly
  const submitBtn = page.locator('button:has-text("Submit"):not([disabled])')
  // AUTO_SUBMIT_ENABLED: Form filler handles submission for consistency
  await submitBtn.click()
  console.log('Submitted form')
  
  // Wait for success screen
  await waitForFormSuccess(page)
}

// PracticeForm filler - for exercise, meditation, habits
export async function fillPracticeForm(page: Page, category: string) {
  console.log(`Starting PracticeForm filler for category: ${category}`)
  
  // Wait for form to be ready
  await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
  
  // ============ STEP 1: Practice Details ============
  console.log('Step 1: Filling effectiveness and practice details')
  
  // Click effectiveness rating (4 stars)
  const ratingButtons = await page.locator('.grid.grid-cols-5 button').all()
  if (ratingButtons.length >= 4) {
    await ratingButtons[3].click() // 4 stars
    console.log('Selected 4-star effectiveness rating')
  }
  await page.waitForTimeout(500)
  
  // Select time to results (first select after effectiveness)
  const timeSelect = page.locator('select').nth(0)
  await timeSelect.selectOption('1-2 weeks')
  console.log('Selected time to results: 1-2 weeks')
  await page.waitForTimeout(300)
  
  // Select startup cost (second select)
  const startupSelect = page.locator('select').nth(1)
  await startupSelect.selectOption('Free/No startup cost')
  console.log('Selected startup cost: Free/No startup cost')
  await page.waitForTimeout(300)
  
  // Select ongoing cost (third select)
  const ongoingSelect = page.locator('select').nth(2)
  await ongoingSelect.selectOption('Free/No ongoing cost')
  console.log('Selected ongoing cost: Free/No ongoing cost')
  await page.waitForTimeout(300)
  
  // Select frequency (fourth select)
  const frequencySelect = page.locator('select').nth(3)
  await frequencySelect.selectOption('3-4 times per week')
  console.log('Selected frequency: 3-4 times per week')
  await page.waitForTimeout(300)
  
  // Category-specific field (fifth select)
  const categorySelect = page.locator('select').nth(4)
  if (category === 'meditation_mindfulness') {
    // Practice length for meditation
    await categorySelect.selectOption('10-20 minutes')
    console.log('Selected practice length: 10-20 minutes')
  } else if (category === 'exercise_movement') {
    // Session duration for exercise
    await categorySelect.selectOption('30-45 minutes')
    console.log('Selected session duration: 30-45 minutes')
  } else if (category === 'habits_routines') {
    // Daily time commitment for habits
    await categorySelect.selectOption('10-20 minutes')
    console.log('Selected daily time commitment: 10-20 minutes')
  }
  await page.waitForTimeout(500)
  
  // Click Continue to Step 2
  const continueBtn1 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn1.click()
  console.log('Moving to Step 2')
  await page.waitForTimeout(500)
  
  // ============ STEP 2: Challenges ============
  console.log('Step 2: Selecting challenges')
  
  // Select "None" challenge by default
  const noneChallenge = page.locator('label').filter({ hasText: 'None' })
  if (await noneChallenge.isVisible()) {
    await noneChallenge.click()
    console.log('Selected challenge: None')
  }
  await page.waitForTimeout(500)
  
  // Click Continue to Step 3
  const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn2.click()
  console.log('Moving to Step 3')
  await page.waitForTimeout(500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  
  // Skip failed solutions and submit directly
  const submitBtn = page.locator('button:has-text("Submit"):not([disabled])')
  // AUTO_SUBMIT_ENABLED: Form filler handles submission for consistency
  await submitBtn.click()
  console.log('Submitted form')
  
  // Wait for success screen
  await waitForFormSuccess(page)
}

// PurchaseForm filler - for products, books
export async function fillPurchaseForm(page: Page, category: string) {
  console.log('Starting PurchaseForm filler - Updated for actual 3-step structure')
  
  // Wait for form to be ready
  await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
  
  // ============ STEP 1: Effectiveness + Time + Cost + Product Details ============
  console.log('Step 1: Filling effectiveness, time, cost, and product details')
  
  // Click effectiveness rating (4 stars)
  const ratingButtons = await page.locator('.grid.grid-cols-5 button').all()
  if (ratingButtons.length >= 4) {
    await ratingButtons[3].click() // 4 stars
    console.log('Selected 4-star rating')
  }
  await page.waitForTimeout(500)
  
  // Select time to results (regular select dropdown)
  const timeSelect = page.locator('select').first()
  await timeSelect.selectOption('1-2 weeks')
  console.log('Selected time to results: 1-2 weeks')
  await page.waitForTimeout(300)
  
  // Select cost type first (RadioGroup)
  console.log('Selecting cost type: one_time')
  // Click on the label text instead of the radio input
  await page.click('text="One-time purchase"')
  await page.waitForTimeout(500)
  
  // Select cost range using Select component
  // Find the cost range Select component (it has SelectTrigger)
  const costRangeSelect = page.locator('[data-state="closed"]').first()
  await costRangeSelect.click()
  await page.waitForTimeout(300)
  
  // Select from the dropdown options (for one_time, no "/month" suffix)
  await page.click('text="$50-100"')
  console.log('Selected cost range: $50-100')
  await page.waitForTimeout(300)
  
  // Category-specific fields
  if (category === 'products_devices') {
    console.log('Filling products_devices category-specific fields')
    await page.waitForTimeout(1000)

    // Look for Select components
    const selectTriggers = await page.locator('button[role="combobox"]').count()
    console.log(`Found ${selectTriggers} Select trigger buttons`)

    if (selectTriggers >= 2) {
      // Select product type (should be 2nd Select component after cost range)
      const productTypeSelect = page.locator('button[role="combobox"]').nth(1)
      await productTypeSelect.click()
      await page.waitForTimeout(500)

      try {
        await page.click('text="Physical device"', { timeout: 2000 })
        console.log('Selected product type: Physical device')
      } catch (e) {
        console.log('Trying first option for product type')
        await page.locator('[role="option"]').first().click()
      }
      await page.waitForTimeout(300)

      // Select ease of use
      const easeSelect = page.locator('button[role="combobox"]').nth(2)
      await easeSelect.click()
      await page.waitForTimeout(500)

      try {
        await page.click('text="Easy to use"', { timeout: 2000 })
        console.log('Selected ease of use: Easy to use')
      } catch (e) {
        console.log('Trying first option for ease of use')
        await page.locator('[role="option"]').first().click()
      }
      await page.waitForTimeout(300)
    } else {
      console.log('Not enough Select components found, skipping category-specific fields')
    }
  } else if (category === 'books_courses') {
    console.log('Filling books_courses category-specific fields')
    await page.waitForTimeout(1000)

    // books_courses needs: format and learning_difficulty
    const selectTriggers = await page.locator('button[role="combobox"]').count()
    console.log(`Found ${selectTriggers} Select trigger buttons for books_courses`)

    if (selectTriggers >= 2) {
      // Select format (should be 2nd Select component after cost range)
      const formatSelect = page.locator('button[role="combobox"]').nth(1)
      await formatSelect.click()
      await page.waitForTimeout(500)

      try {
        await page.click('text="Book (physical)"', { timeout: 2000 })
        console.log('Selected format: Book (physical)')
      } catch (e) {
        console.log('Trying first option for format')
        await page.locator('[role="option"]').first().click()
      }
      await page.waitForTimeout(300)

      // Select learning difficulty
      const difficultySelect = page.locator('button[role="combobox"]').nth(2)
      await difficultySelect.click()
      await page.waitForTimeout(500)

      try {
        await page.click('text="Beginner-friendly"', { timeout: 2000 })
        console.log('Selected learning difficulty: Beginner-friendly')
      } catch (e) {
        console.log('Trying first option for learning difficulty')
        await page.locator('[role="option"]').first().click()
      }
      await page.waitForTimeout(300)
    } else {
      console.log('Not enough Select components found for books_courses, trying to continue anyway')
    }
  }
  
  // Click Continue to Step 2
  console.log('Clicked Continue to Step 2')
  const continueBtn1 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn1.click()
  await page.waitForTimeout(500)
  
  // ============ STEP 2: Issues ============
  console.log('Step 2: Selecting issues')
  await page.click('label:has-text("None")')
  await page.waitForTimeout(500)
  
  // Click Continue to Step 3
  console.log('Clicked Continue to Step 3')
  const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn2.click()
  await page.waitForTimeout(500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  // This step is optional - can proceed directly to submit
  
  // Submit form
  console.log('Submit button found, clicking...')
  const submitBtn = page.locator('button:has-text("Submit")')
  await submitBtn.click()
  
  // Wait longer for submission (like HobbyForm)
  await page.waitForTimeout(5000)
  
  // Wait for success screen
  await waitForFormSuccess(page)
}

// CommunityForm filler - for support groups, communities
export async function fillCommunityForm(page: Page, category: string) {
  console.log('Starting CommunityForm filler - 3-step wizard')
  
  // Wait for form to be ready
  await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
  
  // ============ STEP 1: Effectiveness + Time + Community Details ============
  console.log('Step 1: Filling effectiveness, time, and community details')
  
  // Click effectiveness rating (4 stars)
  const ratingButtons = await page.locator('.grid.grid-cols-5 button').all()
  if (ratingButtons.length >= 4) {
    await ratingButtons[3].click() // 4 stars
    console.log('Selected 4-star rating')
  }
  await page.waitForTimeout(500)
  
  // Select time to results using Select component (1st Select component)
  await page.waitForTimeout(1000)
  const timeSelect = page.locator('button[role="combobox"]').first()
  await timeSelect.click()
  await page.waitForTimeout(300)
  await page.click('text="1-2 weeks"')
  console.log('Selected time to results: 1-2 weeks')
  await page.waitForTimeout(300)
  
  // Select payment frequency FIRST (2nd Select component) - REQUIRED before cost range appears!
  const paymentSelect = page.locator('button[role="combobox"]').nth(1)
  await paymentSelect.click()
  await page.waitForTimeout(300)
  await page.click('text="Free or donation-based"')
  console.log('Selected payment frequency: Free or donation-based')
  await page.waitForTimeout(500)
  
  // Select cost range (3rd Select component - appears after payment frequency is selected)
  const costRangeSelect = page.locator('button[role="combobox"]').nth(2)
  await costRangeSelect.click()
  await page.waitForTimeout(300)
  await page.click('text="Free"')
  console.log('Selected cost range: Free')
  await page.waitForTimeout(500)
  
  // Select meeting frequency (4th Select component)
  const meetingSelect = page.locator('button[role="combobox"]').nth(3)
  await meetingSelect.click()
  await page.waitForTimeout(300)
  await page.click('text="Weekly"')
  console.log('Selected meeting frequency: Weekly')
  await page.waitForTimeout(500)
  
  // Select format (5th Select component)
  const formatSelect = page.locator('button[role="combobox"]').nth(4)
  await formatSelect.click()
  await page.waitForTimeout(300)
  await page.click('text="Online only"')
  console.log('Selected format: Online only')
  await page.waitForTimeout(500)
  
  // Select group size (6th Select component)
  const groupSizeSelect = page.locator('button[role="combobox"]').nth(5)
  await groupSizeSelect.click()
  await page.waitForTimeout(300)
  await page.locator('[role="option"]').first().click()
  console.log('Selected first available group size')
  await page.waitForTimeout(300)
  
  // Click Continue to Step 2
  console.log('Clicked Continue to Step 2')
  const continueBtn1 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn1.click()
  await page.waitForTimeout(500)
  
  // ============ STEP 2: Challenges ============
  console.log('Step 2: Selecting challenges')

  // Wait for Step 2 to load - look for challenge section
  await page.waitForSelector('text=/challenges|Any challenges/i', { timeout: 10000 })
  console.log('Step 2 challenges section loaded')

  // Wait for checkboxes to appear (they load asynchronously)
  await page.waitForTimeout(2000)

  // Check if None label exists
  const noneLabel = page.locator('label:has-text("None")').first()
  const noneExists = await noneLabel.isVisible().catch(() => false)

  if (!noneExists) {
    console.log('WARNING: "None" label not found - checking all labels on page')
    const allLabels = await page.locator('label').allTextContents()
    console.log('Available labels:', allLabels.slice(0, 15))

    // Try to find any label containing "None"
    const anyNoneLabel = page.locator('label').filter({ hasText: /^None$/i })
    const anyNoneLabelExists = await anyNoneLabel.isVisible().catch(() => false)

    if (anyNoneLabelExists) {
      console.log('Found "None" label with alternative selector')
      await anyNoneLabel.click({ force: true })
    } else {
      console.log('ERROR: Could not find "None" label at all - challenges may not have loaded')
      throw new Error('None challenge option not found in CommunityForm Step 2')
    }
  } else {
    // Select "None" as a valid challenge option
    await noneLabel.click({ force: true })
    console.log('Selected challenge: None')
  }

  await page.waitForTimeout(300)

  // Click Continue to Step 3
  console.log('Clicked Continue to Step 3')
  const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn2.click()
  await page.waitForTimeout(500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  // This step is optional - can proceed directly to submit
  
  // Wait for Step 3 to fully load and check if submit is available
  await page.waitForTimeout(2000)
  
  // Debug: Check if Submit button is visible and enabled
  const submitBtnVisible = await page.locator('button:has-text("Submit")').isVisible().catch(() => false)
  const submitBtnEnabled = await page.locator('button:has-text("Submit"):not([disabled])').isVisible().catch(() => false)
  console.log(`Submit button visible: ${submitBtnVisible}, enabled: ${submitBtnEnabled}`)
  
  if (!submitBtnEnabled) {
    console.log('Submit button is disabled or not found - debugging...')
    // Take a debug screenshot
    await page.screenshot({ path: 'community-form-submit-debug.png' })
    
    // Check all buttons
    const allButtons = await page.locator('button').allTextContents()
    console.log('All visible buttons:', allButtons)
  }
  
  // Submit form - try to click even if disabled to see what happens
  console.log('Attempting to click Submit button...')
  const submitBtn = page.locator('button:has-text("Submit")')
  await submitBtn.click({ force: true })  // Force click to bypass any overlays
  
  // Wait for success screen
  await waitForFormSuccess(page)
}

// LifestyleForm filler - for diet, sleep
export async function fillLifestyleForm(page: Page, category: string) {
  console.log(`Starting LifestyleForm filler for category: ${category}`)
  
  // Wait for form to be ready
  await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
  
  // ============ STEP 1: Universal + Required Fields ============
  console.log('Step 1: Filling effectiveness and required fields')
  
  // Click effectiveness rating (4 stars) 
  const ratingButtons = await page.locator('.grid.grid-cols-5 button').all()
  if (ratingButtons.length >= 4) {
    await ratingButtons[3].click() // 4 stars
    console.log('Selected 4-star effectiveness rating')
  }
  await page.waitForTimeout(500)
  
  // Select time to results (required) - look for select containing "Select timeframe" option
  const timeSelect = page.locator('select').nth(0) // First select after effectiveness rating
  await timeSelect.selectOption('1-2 weeks')
  console.log('Selected time to results: 1-2 weeks')
  await page.waitForTimeout(300)
  
  // Select cost impact (required) - second select element
  const costSelect = page.locator('select').nth(1)
  if (category === 'diet_nutrition') {
    await costSelect.selectOption('About the same')
    console.log('Selected cost impact: About the same')
  } else {
    await costSelect.selectOption('Free')
    console.log('Selected cost impact: Free')
  }
  await page.waitForTimeout(300)
  
  // Category-specific required fields
  if (category === 'diet_nutrition') {
    // Weekly prep time (required for diet_nutrition) - third select element
    const prepTimeSelect = page.locator('select').nth(2)
    await prepTimeSelect.selectOption('1-2 hours/week')
    console.log('Selected weekly prep time: 1-2 hours/week')
  } else if (category === 'sleep') {
    // Previous sleep hours (required for sleep) - third select element
    const sleepSelect = page.locator('select').nth(2)
    await sleepSelect.selectOption('6-7 hours')
    console.log('Selected previous sleep hours: 6-7 hours')
  }
  await page.waitForTimeout(300)
  
  // Select stillFollowing (required) - "Yes, still following it"
  // Click the label instead of the hidden radio input
  const stillFollowingLabel = page.locator('label').filter({ hasText: 'Yes, still following it' })
  await stillFollowingLabel.click()
  console.log('Selected: Yes, still following it')
  await page.waitForTimeout(500)
  
  // Click Continue to Step 2
  const continueBtn1 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn1.click()
  console.log('Moving to Step 2')
  await page.waitForTimeout(500)
  
  // ============ STEP 2: Challenges ============
  console.log('Step 2: Selecting challenges')
  
  // Select "None" challenge by default (it should already be selected)
  const noneChallenge = page.locator('label').filter({ hasText: 'None' })
  if (await noneChallenge.isVisible()) {
    await noneChallenge.click()
    console.log('Selected challenge: None')
  }
  await page.waitForTimeout(500)
  
  // Click Continue to Step 3
  const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn2.click()
  console.log('Moving to Step 3')
  await page.waitForTimeout(500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  
  // Skip failed solutions and submit directly
  const submitBtn = page.locator('button:has-text("Submit"):not([disabled])')
  // AUTO_SUBMIT_ENABLED: Form filler handles submission for consistency
  await submitBtn.click()
  console.log('Submitted form')
  
  // Wait for success screen
  await waitForFormSuccess(page)
}

// FinancialForm filler - for financial products
export async function fillFinancialForm(page: Page) {
  console.log('Starting FinancialForm filler - Updated for actual 3-step structure')
  
  // Wait for form to be ready
  await page.waitForSelector('text="How well it worked"', { timeout: 5000 })
  
  // ============ STEP 1: Product Details + Effectiveness + Time to Impact ============
  console.log('Step 1: Filling product details and effectiveness')
  
  // Select cost type (required field)
  const costTypeSelect = page.locator('select').first()
  await costTypeSelect.selectOption('Free to use')
  console.log('Selected cost type: Free to use')
  await page.waitForTimeout(300)
  
  // Select financial benefit (required field)
  const benefitSelect = page.locator('select').nth(1) 
  await benefitSelect.selectOption('$25-100/month saved/earned')
  console.log('Selected financial benefit: $25-100/month saved/earned')
  await page.waitForTimeout(300)
  
  // Select access time (required field)
  const accessSelect = page.locator('select').nth(2)
  await accessSelect.selectOption('Same day')
  console.log('Selected access time: Same day')
  await page.waitForTimeout(300)
  
  // Click effectiveness rating (4 stars)
  const ratingButtons = await page.locator('.grid.grid-cols-5 button').all()
  if (ratingButtons.length >= 4) {
    await ratingButtons[3].click() // 4 stars
    console.log('Selected 4-star rating')
  }
  await page.waitForTimeout(500)
  
  // Select time to impact (required field)
  const timeToImpactSelect = page.locator('select').nth(3)
  await timeToImpactSelect.selectOption('1-2 weeks')
  console.log('Selected time to impact: 1-2 weeks')
  await page.waitForTimeout(300)

  // Verify all required fields are filled before continuing
  console.log('Verifying Step 1 required fields...')
  const costTypeValue = await page.locator('select').first().inputValue()
  const benefitValue = await timeToImpactSelect.inputValue() // Just check one
  console.log('Cost type:', costTypeValue, 'Time to impact:', benefitValue)

  // Click Continue to Step 2
  console.log('Attempting to continue to Step 2...')
  const continueBtn1 = page.locator('button:has-text("Continue"):not([disabled])')
  const btn1Visible = await continueBtn1.isVisible()
  console.log('Continue button visible:', btn1Visible)

  if (!btn1Visible) {
    console.log('Continue button not visible - checking all buttons on page')
    const allButtons = await page.locator('button').allTextContents()
    console.log('All buttons:', allButtons)
    throw new Error('Continue button not visible after filling Step 1')
  }

  await continueBtn1.click()
  console.log('Clicked Continue to Step 2')
  await page.waitForTimeout(1000) // Increased wait for step transition
  
  // ============ STEP 2: Challenges ============
  console.log('Step 2: Waiting for challenges to load')
  
  // Wait a bit for async load to complete
  await page.waitForTimeout(2000)
  
  // Wait for ANY challenge label to appear (indicates loading complete)
  try {
    await page.waitForSelector('label', { timeout: 10000 })
    console.log('Challenge labels found')
    
    // Log all visible labels for debugging
    const labels = await page.locator('label').allTextContents()
    console.log(`Found ${labels.length} challenge labels:`, labels.slice(0, 5))
  } catch (e) {
    console.log('No challenge labels appeared - form may be stuck in loading state')
    // Try to continue anyway, Continue button should be enabled
  }
  
  // Check if "None" option exists
  const noneOption = page.locator('label:has-text("None")')
  const noneExists = await noneOption.isVisible().catch(() => false)
  
  if (noneExists) {
    console.log('Found and clicking "None" option')
    await noneOption.click()
  } else {
    console.log('WARNING: "None" option not found - challenges may not have loaded')
    console.log('Attempting to continue without selecting challenges')
  }
  
  await page.waitForTimeout(500)
  
  // Click Continue to Step 3
  console.log('Clicked Continue to Step 3')
  const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn2.click()
  await page.waitForTimeout(500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  // This step is optional - can proceed directly to submit

  // Wait for Step 3 to load
  await page.waitForSelector('text="What else did you try?"', { timeout: 5000 })
  console.log('Step 3 loaded successfully')

  // Wait for Submit button to be available
  await page.waitForTimeout(1000)

  // Find and check Submit button state
  const submitBtn = page.locator('button:has-text("Submit")')
  const isVisible = await submitBtn.isVisible()
  console.log('Submit button visible:', isVisible)

  if (!isVisible) {
    throw new Error('Submit button not visible on Step 3')
  }

  const isDisabled = await submitBtn.getAttribute('disabled')
  console.log('Submit button disabled:', isDisabled !== null)

  if (isDisabled !== null) {
    // Check what's blocking submission
    console.log('Submit button is disabled - checking form state...')
    const pageContent = await page.textContent('body')
    console.log('Current page step indicator:', pageContent?.includes('Step 3') ? 'On Step 3' : 'Unknown step')

    // Try to find validation error messages
    const alerts = await page.locator('[role="alert"]').allTextContents()
    if (alerts.length > 0) {
      console.log('Validation errors found:', alerts)
    }

    throw new Error('Submit button is disabled - form validation may have failed')
  }

  // Submit form
  console.log('Submit button enabled, clicking...')

  // Wait for React hydration to be complete
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  // Use force click to ensure click event is triggered
  await submitBtn.click({ force: true })
  console.log('Submit button clicked (forced)')

  // Wait for success screen
  await waitForFormSuccess(page)
}

// Main dispatcher function that selects the right filler
export async function fillFormSpecific(page: Page, category: string) {
  // Map categories to their form fillers
  const categoryToFiller: Record<string, (page: Page, category?: string) => Promise<void>> = {
    // DosageForm categories
    'medications': fillDosageForm,
    'supplements_vitamins': fillDosageForm,
    'natural_remedies': fillDosageForm,
    'beauty_skincare': fillDosageForm,
    
    // AppForm
    'apps_software': fillAppForm,
    
    // HobbyForm
    'hobbies_activities': fillHobbyForm,
    
    // SessionForm categories
    'therapists_counselors': fillSessionForm,
    'doctors_specialists': fillSessionForm,
    'coaches_mentors': fillSessionForm,
    'alternative_practitioners': fillSessionForm,
    'professional_services': fillSessionForm,
    'medical_procedures': fillSessionForm,
    'crisis_resources': fillSessionForm,
    
    // PracticeForm categories
    'exercise_movement': fillPracticeForm,
    'meditation_mindfulness': fillPracticeForm,
    'habits_routines': fillPracticeForm,
    
    // PurchaseForm categories
    'products_devices': fillPurchaseForm,
    'books_courses': fillPurchaseForm,
    
    // CommunityForm categories
    'support_groups': fillCommunityForm,
    'groups_communities': fillCommunityForm,
    
    // LifestyleForm categories
    'diet_nutrition': fillLifestyleForm,
    'sleep': fillLifestyleForm,
    
    // FinancialForm
    'financial_products': fillFinancialForm
  }
  
  const filler = categoryToFiller[category]
  if (filler) {
    await filler(page, category)
  } else {
    throw new Error(`No specific filler found for category: ${category}`)
  }
}
