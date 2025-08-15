import { Page } from '@playwright/test'

/**
 * Specific form fillers for each form type
 * Each function knows the exact structure and requirements of its form
 */

// DosageForm filler - for medications, supplements, natural remedies, beauty_skincare
export async function fillDosageForm(page: Page, category: string) {
  console.log(`Starting DosageForm filler for category: ${category}`)
  
  // Wait for form to be ready - Step 1 shows dosage info first
  await page.waitForSelector('text="Your dosage"', { timeout: 5000 })
  
  // ============ STEP 1: Dosage, Effectiveness, TTR ============
  console.log('Step 1: Filling dosage, effectiveness, and time to results')
  
  if (category === 'beauty_skincare') {
    // Beauty/skincare: Skincare frequency and length of use
    const skincareFrequencySelect = page.locator('select').nth(0)
    await skincareFrequencySelect.selectOption('twice_daily')
    console.log('Selected skincare frequency: Twice daily')
    await page.waitForTimeout(300)
    
    // Length of use
    const lengthSelect = page.locator('select').nth(1)
    await lengthSelect.selectOption('1-3 months')
    console.log('Selected length of use: 1-3 months')
  } else {
    // Other categories: Dosage amount, unit, frequency, length of use
    
    // Fill dosage amount
    const doseInput = page.locator('input[type="text"]').first()
    await doseInput.fill('500')
    console.log('Entered dosage amount: 500')
    await page.waitForTimeout(300)
    
    // Select unit (first select on page)
    const unitSelect = page.locator('select').nth(0)
    await unitSelect.selectOption('mg')
    console.log('Selected unit: mg')
    await page.waitForTimeout(300)
    
    // Select frequency (second select)
    const frequencySelect = page.locator('select').nth(1)
    await frequencySelect.selectOption('Once daily')
    console.log('Selected frequency: Once daily')
    await page.waitForTimeout(300)
    
    // Select length of use (third select)
    const lengthSelect = page.locator('select').nth(2)
    await lengthSelect.selectOption('1-3 months')
    console.log('Selected length of use: 1-3 months')
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
  
  // Select time to results (should be select after effectiveness section)
  const timeSelect = page.locator('select').nth(category === 'beauty_skincare' ? 2 : 3)
  await timeSelect.selectOption('1-2 weeks')
  console.log('Selected time to results: 1-2 weeks')
  await page.waitForTimeout(300)
  
  // Click Continue to Step 2
  const continueBtn1 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn1.click()
  console.log('Moving to Step 2')
  await page.waitForTimeout(1500)
  
  // ============ STEP 2: Side Effects ============
  console.log('Step 2: Selecting side effects')
  
  // Select "None" side effect by default
  const noneEffect = page.locator('label').filter({ hasText: 'None' })
  if (await noneEffect.isVisible()) {
    await noneEffect.click()
    console.log('Selected side effect: None')
  }
  await page.waitForTimeout(500)
  
  // Click Continue to Step 3
  const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn2.click()
  console.log('Moving to Step 3')
  await page.waitForTimeout(1500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  
  // Skip failed solutions and submit directly
  const submitBtn = page.locator('button:has-text("Submit"):not([disabled])')
  // AUTO_SUBMIT_ENABLED: Form filler handles submission for consistency
  await submitBtn.click()
  console.log('Submitted form')
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
  
  // Click "None" checkbox (based on AppForm.tsx line 514-542)
  const noneCheckbox = page.locator('label:has-text("None")')
  await noneCheckbox.click()
  console.log('Selected "None" for challenges')
  
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
  await page.waitForTimeout(1500)
  
  // Step 2: Challenges  
  console.log('Step 2: Selecting challenges')
  // Select "None" for challenges (should be default but make sure)
  await page.click('label:has-text("None")')
  await page.waitForTimeout(500)
  
  // Click Continue to Step 3
  console.log('Clicking Continue to Step 3')
  const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn2.click()
  await page.waitForTimeout(1500)
  
  // Step 3: Skip failed solutions
  console.log('Step 3: Submitting form')
  const submitBtn = page.locator('button:has-text("Submit")')
  await submitBtn.click()
  await page.waitForTimeout(2000)
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
  
  const ratingButtons = await page.locator('.grid.grid-cols-5 button').all()
  console.log(`Found ${ratingButtons.length} rating buttons`)
  
  if (ratingButtons.length >= 4) {
    await ratingButtons[3].click() // 4 stars (index 3 = 4th button)
    console.log('Selected 4-star effectiveness rating')
    await page.waitForTimeout(500)
    
    // Verify the button was clicked and effectiveness is set
    const isSelected = await ratingButtons[3].getAttribute('class')
    console.log(`4-star button classes: ${isSelected}`)
  } else {
    console.log('ERROR: Could not find effectiveness rating buttons')
    // Try alternative selector
    const alternativeButtons = await page.locator('button').filter({ hasText: /^\d+$/ }).all()
    console.log(`Found ${alternativeButtons.length} alternative rating buttons`)
    if (alternativeButtons.length >= 4) {
      await alternativeButtons[3].click()
      console.log('Selected 4-star effectiveness rating (alternative selector)')
    }
  }
  await page.waitForTimeout(500)
  
  // Select time to results - check if it's a select or custom component
  const hasNativeSelect = await page.locator('select').first().isVisible().catch(() => false)
  
  let timeToResults = '1-2 weeks'
  if (hasNativeSelect) {
    // Use native select element
    const timeSelect = page.locator('select').first()
    await timeSelect.selectOption(timeToResults)
    console.log('Selected time to results using native select: 1-2 weeks')
  } else {
    // Use custom Select component
    const timeSelect = page.locator('button[role="combobox"]').first()
    await timeSelect.click()
    await page.waitForTimeout(500)
    
    // Take a screenshot to debug dropdown
    await page.screenshot({ path: 'session-dropdown-debug.png' })
    
    // Try to click the option with various selectors
    const clicked = await page.locator('text="1-2 weeks"').first().click({ timeout: 2000 }).then(() => true).catch(() => false)
    if (!clicked) {
      console.log('WARNING: Could not select time to results')
    } else {
      console.log('Selected time to results: 1-2 weeks')
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
    // Take a screenshot for debugging
    await page.screenshot({ path: 'session-form-no-radio.png' })
    console.log('No radio buttons found - screenshot saved')
    
    // Check what's actually on the page
    const pageContent = await page.textContent('body')
    console.log('Page contains "Per session":', pageContent?.includes('Per session'))
    console.log('Page contains "Monthly":', pageContent?.includes('Monthly'))
    
    throw new Error(`Radio buttons not found for category: ${category}. Check SessionForm.tsx conditions.`)
  }
  
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
  
  await page.waitForTimeout(1000) // Wait longer for cost range dropdown to appear
  
  // Wait for cost range dropdown to appear after selecting cost type
  try {
    // Wait for either a native select or custom combobox to appear
    await page.waitForFunction(() => {
      const nativeSelect = document.querySelector('select:nth-of-type(2)');
      const comboboxes = document.querySelectorAll('button[role="combobox"]');
      return (nativeSelect && nativeSelect.offsetParent !== null) || comboboxes.length >= 2;
    }, { timeout: 5000 });
    console.log('Cost range dropdown is now available');
  } catch (error) {
    console.log('Cost range dropdown did not appear within 5 seconds');
  }
  
  // Select cost range - check if native select or custom component
  const hasNativeCostSelect = await page.locator('select').nth(1).isVisible().catch(() => false)
  
  if (hasNativeCostSelect) {
    const costSelect = page.locator('select').nth(1)
    // Select the second option (first is usually placeholder)
    const options = await costSelect.locator('option').all()
    if (options.length > 1) {
      const value = await options[1].getAttribute('value')
      if (value) {
        await costSelect.selectOption(value)
        console.log(`Selected cost range: ${value}`)
      }
    }
  } else {
    // Try to find the cost range combobox more reliably
    const allComboboxes = await page.locator('button[role="combobox"]').count()
    console.log(`Found ${allComboboxes} combobox elements total`)
    
    // Try multiple strategies to find the cost range dropdown
    let costRangeDropdown = page.locator('button[role="combobox"]:has-text("Select cost range")')
    let costRangeExists = await costRangeDropdown.count() > 0
    
    if (!costRangeExists) {
      // Try finding it as the cost range combobox (could be any text)
      const allComboboxes = page.locator('button[role="combobox"]')
      const comboboxTexts = await allComboboxes.allTextContents()
      console.log('All combobox texts:', comboboxTexts)
      
      // Find one that likely contains cost range info (placeholder or selected value)
      for (let i = 0; i < comboboxTexts.length; i++) {
        if (comboboxTexts[i].includes('cost range') || comboboxTexts[i].includes('Select cost') || i === 2) { // 3rd combobox based on logs
          costRangeDropdown = allComboboxes.nth(i)
          costRangeExists = true
          break
        }
      }
    }
    
    console.log(`Cost range dropdown exists: ${costRangeExists}`)
    
    if (costRangeExists) {
      // Click the cost range dropdown
      await costRangeDropdown.click()
      console.log('Clicked cost range dropdown')
      await page.waitForTimeout(1500) // More time for dropdown to fully open
      
      // Wait for options to appear
      const optionsLocator = page.locator('[role="option"]')
      await optionsLocator.first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {
        console.log('Options did not appear within 3 seconds')
      })
      
      const optionCount = await optionsLocator.count()
      console.log(`Found ${optionCount} cost range options`)
      
      if (optionCount > 0) {
        // Get the first option text for logging
        const firstOptionText = await optionsLocator.first().textContent()
        console.log(`Selecting first cost range option: "${firstOptionText}"`)
        
        // Click the first option
        await optionsLocator.first().click()
        await page.waitForTimeout(500)
        
        // Verify selection by looking for any combobox that might contain the selected value
        try {
          // Look for any combobox that doesn't contain the placeholder text
          const allComboboxes = page.locator('button[role="combobox"]')
          const comboboxCount = await allComboboxes.count()
          console.log(`Found ${comboboxCount} comboboxes total after selection`)
          
          let selectedValue = ''
          for (let i = 0; i < comboboxCount; i++) {
            const text = await allComboboxes.nth(i).textContent()
            if (text && !text.includes('Select cost range') && text.includes('$')) {
              selectedValue = text
              break
            }
          }
          
          if (selectedValue) {
            console.log(`✅ Cost range successfully selected: "${selectedValue}"`)
          } else {
            console.log('❌ Cost range selection may have failed - no selected value found')
          }
        } catch (error) {
          console.log('Error verifying cost range selection:', error)
        }
      } else {
        console.log('❌ No cost range options found in dropdown')
      }
    } else {
      console.log('❌ Cost range dropdown not found')
    }
  }
  await page.waitForTimeout(500) // Give more time for state to update
  
  // Session frequency (not for crisis_resources or medical_procedures)
  if (!['crisis_resources', 'medical_procedures'].includes(category)) {
    const hasNativeFreqSelect = await page.locator('select').nth(2).isVisible().catch(() => false)
    
    if (hasNativeFreqSelect) {
      const freqSelect = page.locator('select').nth(2)
      // Select the first non-placeholder option
      const options = await freqSelect.locator('option').all()
      if (options.length > 1) {
        const value = await options[1].getAttribute('value')
        if (value) {
          await freqSelect.selectOption(value)
          console.log(`Selected session frequency: ${value}`)
        }
      }
    } else {
      const frequencySelect = page.locator('button[role="combobox"]').nth(2)
      await frequencySelect.click()
      await page.waitForTimeout(500)
      const firstOption = page.locator('[role="option"]').first()
      const hasOption = await firstOption.isVisible().catch(() => false)
      if (hasOption) {
        await firstOption.click()
        console.log('Selected first available frequency option')
      }
    }
    await page.waitForTimeout(300)
  }
  
  // Format - determine index based on category
  const formatSelectIndex = ['crisis_resources', 'medical_procedures'].includes(category) ? 2 : 3
  const hasNativeFormatSelect = await page.locator('select').nth(formatSelectIndex).isVisible().catch(() => false)
  
  let formatValue = 'In-person'
  if (category === 'crisis_resources') {
    formatValue = 'Phone'
  } else if (category === 'medical_procedures') {
    formatValue = 'Outpatient'
  }
  
  if (hasNativeFormatSelect) {
    const formatSelect = page.locator('select').nth(formatSelectIndex)
    // Try to select the specific format, otherwise select first option
    try {
      await formatSelect.selectOption(formatValue)
      console.log(`Selected format: ${formatValue}`)
    } catch {
      const options = await formatSelect.locator('option').all()
      if (options.length > 1) {
        const value = await options[1].getAttribute('value')
        if (value) {
          await formatSelect.selectOption(value)
          console.log(`Selected format: ${value}`)
        }
      }
    }
  } else {
    const formatSelect = page.locator('button[role="combobox"]').nth(formatSelectIndex)
    await formatSelect.click()
    await page.waitForTimeout(300)
    const firstOption = page.locator('[role="option"]').first()
    const hasOption = await firstOption.isVisible().catch(() => false)
    if (hasOption) {
      await firstOption.click()
      console.log('Selected first available format option')
    }
  }
  await page.waitForTimeout(300)
  
  // Session length (required for therapists_counselors, optional for others)
  if (category === 'therapists_counselors') {
    const hasNativeLengthSelect = await page.locator('select').nth(4).isVisible().catch(() => false)
    
    if (hasNativeLengthSelect) {
      const lengthSelect = page.locator('select').nth(4)
      // Try specific value first, then first option
      try {
        await lengthSelect.selectOption('60 minutes')
        console.log('Selected session length: 60 minutes')
      } catch {
        const options = await lengthSelect.locator('option').all()
        if (options.length > 1) {
          const value = await options[1].getAttribute('value')
          if (value) {
            await lengthSelect.selectOption(value)
            console.log(`Selected session length: ${value}`)
          }
        }
      }
    } else {
      const sessionLengthSelect = page.locator('button[role="combobox"]').nth(4)
      await sessionLengthSelect.click()
      await page.waitForTimeout(500)
      const firstOption = page.locator('[role="option"]').first()
      const hasOption = await firstOption.isVisible().catch(() => false)
      if (hasOption) {
        await firstOption.click()
        console.log('Selected first available session length option')
      }
    }
    await page.waitForTimeout(300)
  }
  
  // Wait time (required for medical_procedures)
  if (category === 'medical_procedures') {
    const waitTimeSelect = page.locator('button[role="combobox"]').nth(3)
    await waitTimeSelect.click()
    await page.waitForTimeout(300)
    await page.click('text="1-2 weeks"')
    console.log('Selected wait time: 1-2 weeks')
    await page.waitForTimeout(300)
  }
  
  // Specialty (required for professional_services)
  if (category === 'professional_services') {
    const specialtyInput = page.locator('input[type="text"]').first()
    await specialtyInput.fill('General consulting')
    console.log('Entered specialty: General consulting')
    await page.waitForTimeout(300)
  }
  
  // Response time (required for crisis_resources)
  if (category === 'crisis_resources') {
    const responseTimeSelect = page.locator('button[role="combobox"]').nth(3)
    await responseTimeSelect.click()
    await page.waitForTimeout(300)
    await page.click('text="Less than 5 minutes"')
    console.log('Selected response time: Less than 5 minutes')
    await page.waitForTimeout(300)
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
  const costRangeValue = await page.evaluate(() => {
    // Find any combobox that might contain cost range info
    const comboboxes = document.querySelectorAll('button[role="combobox"]');
    for (let i = 0; i < comboboxes.length; i++) {
      const text = comboboxes[i].textContent || '';
      // Look for cost range content or dollar signs
      if (text.toLowerCase().includes('cost range') || text.includes('$') || text.includes('Free')) {
        return text;
      }
    }
    return 'not found';
  });
  console.log(`Cost range field text: "${costRangeValue}"`);
  
  // Check all required fields for therapists_counselors validation
  console.log('\n=== CHECKING REQUIRED FIELDS FOR therapists_counselors ===');
  console.log(`✓ Effectiveness: ${effectivenessSelected} (required: not null)`);
  console.log(`✓ Time to results: "${timeToResults}" (required: not empty)`);
  console.log(`✓ Cost type: "${checkedRadio}" (affects cost range visibility)`);
  
  if (costRangeValue && !costRangeValue.includes('Select cost range') && costRangeValue !== 'not found') {
    console.log(`✅ Cost range: "${costRangeValue}" (required: not empty) - SELECTED VALUE FOUND`);
  } else {
    console.log(`❌ Cost range: "${costRangeValue}" (required: not empty) - PLACEHOLDER OR MISSING`);
  }
  console.log('=== END REQUIRED FIELDS CHECK ===\n');
  
  if (costRangeValue && costRangeValue.includes('Select cost range')) {
    console.log('🔍 ISSUE IDENTIFIED: Cost range dropdown shows placeholder, not selected value');
    console.log('    This means the cost range selection in the test is not working properly.');
  }
  
  console.log('=== END DEBUG INFO ===\n')
  
  // Click Continue to Step 2 - wait for it to be enabled
  const continueBtn1 = page.locator('button:has-text("Continue"):not([disabled])')
  
  if (isDisabled !== null) {
    console.log('Continue button is DISABLED - something is missing from validation')
    // Take screenshot for debugging
    await page.screenshot({ path: 'session-form-validation-failed.png' });
    throw new Error('Continue button remains disabled after filling all fields');
  }
  
  await continueBtn1.click()
  console.log('Moving to Step 2')
  await page.waitForTimeout(1500)
  
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
  await page.waitForTimeout(1500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  
  // Skip failed solutions and submit directly
  const submitBtn = page.locator('button:has-text("Submit"):not([disabled])')
  // AUTO_SUBMIT_ENABLED: Form filler handles submission for consistency
  await submitBtn.click()
  console.log('Submitted form')
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
  await page.waitForTimeout(1500)
  
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
  await page.waitForTimeout(1500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  
  // Skip failed solutions and submit directly
  const submitBtn = page.locator('button:has-text("Submit"):not([disabled])')
  // AUTO_SUBMIT_ENABLED: Form filler handles submission for consistency
  await submitBtn.click()
  console.log('Submitted form')
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
  
  // Cost type defaults to 'one_time' - check if we need to change it
  // For this test, we'll keep the default (one_time)
  console.log('Using default cost type: one_time')
  
  // Select cost range using Select component
  // Find the cost range Select component (it has SelectTrigger)
  const costRangeSelect = page.locator('[data-state="closed"]').first()
  await costRangeSelect.click()
  await page.waitForTimeout(300)
  
  // Select from the dropdown options
  await page.click('text="$50-100"')
  console.log('Selected cost range: $50-100')
  await page.waitForTimeout(300)
  
  // For products_devices category: need productType and easeOfUse
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
  }
  
  // Click Continue to Step 2
  console.log('Clicked Continue to Step 2')
  const continueBtn1 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn1.click()
  await page.waitForTimeout(1500)
  
  // ============ STEP 2: Issues ============
  console.log('Step 2: Selecting issues')
  await page.click('label:has-text("None")')
  await page.waitForTimeout(500)
  
  // Click Continue to Step 3
  console.log('Clicked Continue to Step 3')
  const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn2.click()
  await page.waitForTimeout(1500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  // This step is optional - can proceed directly to submit
  
  // Submit form
  console.log('Submit button found, clicking...')
  const submitBtn = page.locator('button:has-text("Submit")')
  await submitBtn.click()
}

// CommunityForm filler - for support groups, communities
export async function fillCommunityForm(page: Page, category: string) {
  console.log('Starting CommunityForm filler - Updated for actual 3-step structure')
  
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
  await page.waitForTimeout(1500)
  
  // ============ STEP 2: Challenges ============
  console.log('Step 2: Selecting challenges')
  await page.click('label:has-text("None")')
  await page.waitForTimeout(500)
  
  // Click Continue to Step 3
  console.log('Clicked Continue to Step 3')
  const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn2.click()
  await page.waitForTimeout(1500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  // This step is optional - can proceed directly to submit
  
  // Submit form
  console.log('Submit button found, clicking...')
  const submitBtn = page.locator('button:has-text("Submit")')
  await submitBtn.click()
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
  await page.waitForTimeout(1500)
  
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
  await page.waitForTimeout(1500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  
  // Skip failed solutions and submit directly
  const submitBtn = page.locator('button:has-text("Submit"):not([disabled])')
  // AUTO_SUBMIT_ENABLED: Form filler handles submission for consistency
  await submitBtn.click()
  console.log('Submitted form')
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
  await costTypeSelect.selectOption('Free')
  console.log('Selected cost type: Free')
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
  
  // Click Continue to Step 2
  console.log('Clicked Continue to Step 2')
  const continueBtn1 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn1.click()
  await page.waitForTimeout(1500)
  
  // ============ STEP 2: Barriers ============
  console.log('Step 2: Selecting barriers')
  await page.click('label:has-text("None")')
  await page.waitForTimeout(500)
  
  // Click Continue to Step 3
  console.log('Clicked Continue to Step 3')
  const continueBtn2 = page.locator('button:has-text("Continue"):not([disabled])')
  await continueBtn2.click()
  await page.waitForTimeout(1500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  // This step is optional - can proceed directly to submit
  
  // Submit form
  console.log('Submit button found, clicking...')
  const submitBtn = page.locator('button:has-text("Submit")')
  await submitBtn.click()
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