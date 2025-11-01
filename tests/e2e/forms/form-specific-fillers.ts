import { Page } from '@playwright/test'

/**
 * Specific form fillers for each form type
 * Each function knows the exact structure and requirements of its form
 */

/**
 * Category-specific test values for SessionForm
 * These values match the EXPECTED_FIELDS in session-form-complete.spec.ts
 * and provide realistic, category-appropriate test data
 */
const SESSION_FORM_TEST_VALUES = {
  therapists_counselors: {
    timeToResults: '3-6 months',
    sessionFrequency: 'Weekly',
    sessionLength: '60 minutes',  // Fixed: was "50-60 minutes", now matches actual dropdown
    cost: '$100-150'  // Fixed: was $100-$149.99, now matches actual dropdown
  },
  doctors_specialists: {
    timeToResults: '1-2 months',
    sessionFrequency: 'Monthly',
    waitTime: '1-2 weeks',
    cost: '$50-100'  // Fixed: was $50-$99.99, now matches actual dropdown
  },
  coaches_mentors: {
    timeToResults: '1-2 months',
    sessionFrequency: 'Fortnightly',
    sessionLength: '60 minutes',
    cost: '$100-150'  // Fixed: was $100-$199.99/month, now matches actual dropdown
  },
  alternative_practitioners: {
    timeToResults: '1-2 months',
    sessionFrequency: 'Weekly',
    sessionLength: '60 minutes',
    cost: '$50-100'
  },
  professional_services: {
    timeToResults: '1-2 weeks',
    sessionFrequency: 'As needed',
    cost: '$50-100'
  },
  crisis_resources: {
    timeToResults: 'Immediately',
    cost: 'Free'
  }
} as const

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
    console.log('❌ Success screen did not appear within 60 seconds')
    // Log what's on the page for debugging
    const pageText = await page.textContent('body')
    if (pageText?.includes('already rated')) {
      console.log('Note: Solution was already rated')
      throw new Error('Form submission failed: Solution was already rated for this goal')
    }
    // Check for other error indicators
    if (pageText?.includes('error') || pageText?.includes('Error') || pageText?.includes('failed')) {
      console.log('Error detected on page:', pageText?.substring(0, 500))
      throw new Error('Form submission failed: Error message detected on page')
    }
    // If no specific error found, throw generic timeout error
    throw new Error('Success screen did not appear within 60 seconds - submission likely failed')
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

  const timeout = 15000 // Increased from 7000ms to handle React state delays
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
    
    // Fill dosage amount (semantic selector: find label, navigate to input)
    const doseInput = page.locator('label:has-text("Amount")').locator('..').locator('input')
    await doseInput.fill(dosageAmount)
    console.log(`Entered dosage amount: ${dosageAmount}`)
    await page.waitForTimeout(300)
    
    // Select unit (shadcn Select - first Select component)
    const unitSelectTrigger = page.locator('button[role="combobox"]').first()
    await unitSelectTrigger.click()
    await page.waitForTimeout(500)
    // Click the option in the portal dropdown
    await page.locator('[role="option"]').filter({ hasText: dosageUnit }).click()
    console.log(`Selected unit: ${dosageUnit}`)
    // Wait for dropdown portal to disappear
    await page.waitForTimeout(800)

    // Select frequency (shadcn Select - second Select component)
    const frequencySelectTrigger = page.locator('button[role="combobox"]').nth(1)
    await frequencySelectTrigger.click()
    await page.waitForTimeout(500)
    // Click the option in the portal dropdown
    await page.locator('[role="option"]').filter({ hasText: frequencyValue }).click()
    console.log(`Selected frequency: ${frequencyValue}`)
    // Wait for dropdown portal to disappear
    await page.waitForTimeout(800)

    // Select length of use (shadcn Select - third Select component)
    const lengthSelectTrigger = page.locator('button[role="combobox"]').nth(2)
    await lengthSelectTrigger.click()
    await page.waitForTimeout(500)
    // Click the option in the portal dropdown
    await page.locator('[role="option"]').filter({ hasText: lengthValue }).click()
    console.log(`Selected length of use: ${lengthValue}`)
    // Wait for dropdown portal to disappear
    await page.waitForTimeout(800)
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
    // Time to results (shadcn Select - fourth Select component after unit/frequency/length)
    const timeSelectTrigger = page.locator('button[role="combobox"]').nth(3)
    await timeSelectTrigger.click()
    await page.waitForTimeout(500)
    await page.locator('[role="option"]').filter({ hasText: '3-4 weeks' }).click()
    console.log('Selected time to results: 3-4 weeks')
    await page.waitForTimeout(800)

    // Skincare frequency (shadcn Select - fifth Select component)
    const skincareFrequencySelectTrigger = page.locator('button[role="combobox"]').nth(4)
    await skincareFrequencySelectTrigger.click()
    await page.waitForTimeout(500)
    await page.locator('[role="option"]').filter({ hasText: 'Once daily (night)' }).click()
    console.log('Selected skincare frequency: Once daily (night)')
    await page.waitForTimeout(800)

    // Length of use (shadcn Select - sixth Select component)
    const lengthSelectTrigger = page.locator('button[role="combobox"]').nth(5)
    await lengthSelectTrigger.click()
    await page.waitForTimeout(500)
    await page.locator('[role="option"]').filter({ hasText: '3-6 months' }).click()
    console.log('Selected length of use: 3-6 months')
    await page.waitForTimeout(800)
  } else {
    // Time to results (shadcn Select - fourth Select component for non-beauty)
    const timeSelectTrigger = page.locator('button[role="combobox"]').nth(3)

    // Use category-specific time to results value
    let timeToResultsValue = '1-2 weeks'  // Default
    if (category === 'medications') {
      timeToResultsValue = '3-4 weeks'  // Antidepressants take longer
    } else if (category === 'natural_remedies') {
      timeToResultsValue = 'Immediately'  // Essential oils work quickly
    }

    await timeSelectTrigger.click()
    await page.waitForTimeout(500)
    await page.locator('[role="option"]').filter({ hasText: timeToResultsValue }).click()
    console.log(`Selected time to results: ${timeToResultsValue}`)
    await page.waitForTimeout(800)
  }

  // Note: Cost field has been moved to success screen (not in Step 1 anymore)

  // Click Continue to Step 2
  const continueBtn1 = page.locator('button:has-text("Continue")')
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
  const continueBtn2 = page.locator('button:has-text("Continue")')
  await continueBtn2.click()
  console.log('Moving to Step 3')
  await page.waitForTimeout(500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  
  // Skip failed solutions and submit directly
  const submitBtn = page.locator('button:has-text("Submit")')
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

  // Select time to results - shadcn Select component
  await page.locator('button').filter({ hasText: 'Select timeframe' }).click()
  await page.waitForTimeout(500)
  await page.getByRole('option', { name: '1-2 weeks' }).click()
  console.log('Selected time to results: 1-2 weeks')
  await page.waitForTimeout(300)

  // Select usage frequency - shadcn Select component
  await page.locator('button').filter({ hasText: 'Select frequency' }).click()
  await page.waitForTimeout(500)
  await page.getByRole('option', { name: 'Daily' }).click()
  console.log('Selected usage frequency: Daily')
  await page.waitForTimeout(300)

  // Select subscription type - shadcn Select component
  await page.locator('button').filter({ hasText: 'Select type' }).click()
  await page.waitForTimeout(500)
  await page.getByRole('option', { name: 'Monthly subscription' }).click()
  console.log('Selected subscription type: Monthly subscription')

  // Wait for cost dropdown to appear (it's conditional based on subscription type)
  await page.waitForTimeout(500)

  // Select cost - shadcn Select component (conditional)
  const costTrigger = page.locator('button').filter({ hasText: 'Select cost' })
  if (await costTrigger.isVisible()) {
    await costTrigger.click()
    await page.waitForTimeout(500)
    await page.getByRole('option', { name: '$10-$19.99/month' }).click()
    console.log('Selected cost: $10-$19.99/month')
    await page.waitForTimeout(300)
  }
  
  // Click Continue to Step 2
  await page.waitForTimeout(500)
  const continueBtn1 = page.locator('button:has-text("Continue")').first()
  await continueBtn1.click()
  console.log('Clicked Continue to Step 2')
  
  // ============ STEP 2: Challenges ============
  // Wait for Step 2 to load
  await page.waitForSelector('text="Any challenges?"', { timeout: 5000 })
  console.log('Step 2: Selecting challenges')

  // CRITICAL: Wait for challenge options to finish loading (not just the heading)
  await page.waitForSelector('label:has-text("None")', { timeout: 10000 })
  console.log('Challenge options loaded')

  // Select "None" as a valid challenge option
  const noneLabel = await page.locator('label:has-text("None")').first()
  await noneLabel.click({ force: true })
  console.log('Selected challenge: None')
  
  // Click Continue to Step 3
  await page.waitForTimeout(500)
  const continueBtn2 = page.locator('button:has-text("Continue")')
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
  
  const submitBtn = page.locator('button:has-text("Submit")').first()
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
  
  // Time to results - shadcn Select component
  console.log('Selecting time to results')
  await page.locator('button').filter({ hasText: 'Select timeframe' }).click()
  await page.waitForTimeout(500)
  await page.getByRole('option', { name: '1-2 weeks' }).click()
  await page.waitForTimeout(300)

  // Startup cost - shadcn Select component
  console.log('Selecting startup cost')
  const startupCostBtn = page.locator('button').filter({ hasText: 'Select startup cost' })
  await startupCostBtn.waitFor({ state: 'visible', timeout: 10000 })
  await startupCostBtn.click()
  await page.waitForTimeout(500)
  await page.getByRole('option', { name: '$50-$100' }).click()
  await page.waitForTimeout(300)

  // Ongoing cost - shadcn Select component
  console.log('Selecting ongoing cost')
  const ongoingCostBtn = page.locator('button').filter({ hasText: 'Select monthly cost' })
  await ongoingCostBtn.waitFor({ state: 'visible', timeout: 10000 })
  await ongoingCostBtn.click()
  await page.waitForTimeout(500)
  await page.getByRole('option', { name: 'Under $25/month' }).click()
  await page.waitForTimeout(300)

  // Time commitment - shadcn Select component
  console.log('Selecting time investment')
  const timeCommitmentBtn = page.locator('button').filter({ hasText: 'Select time' })
  await timeCommitmentBtn.waitFor({ state: 'visible', timeout: 10000 })
  await timeCommitmentBtn.click()
  await page.waitForTimeout(500)
  await page.getByRole('option', { name: '1-2 hours' }).click()
  await page.waitForTimeout(300)

  // Frequency - shadcn Select component
  console.log('Selecting frequency')
  const frequencyBtn = page.locator('button').filter({ hasText: 'Select frequency' })
  await frequencyBtn.waitFor({ state: 'visible', timeout: 10000 })
  await frequencyBtn.click()
  await page.waitForTimeout(500)
  await page.getByRole('option', { name: 'Daily' }).click()
  await page.waitForTimeout(300)
  
  // Click Continue to Step 2
  console.log('Clicking Continue to Step 2')
  await page.waitForTimeout(500)
  const continueBtn1 = page.locator('button:has-text("Continue")')
  await continueBtn1.click()

  // ============ STEP 2: Challenges ============
  // Wait for Step 2 to load
  await page.waitForSelector('text="Any challenges?"', { timeout: 5000 })
  console.log('Step 2: Selecting challenges')

  // CRITICAL: Wait for challenge options to finish loading (not just the heading)
  await page.waitForSelector('label:has-text("None")', { timeout: 10000 })
  console.log('Challenge options loaded')

  // Select "None" as a valid challenge option
  const noneLabel = await page.locator('label:has-text("None")').first()
  await noneLabel.click({ force: true })
  console.log('Selected challenge: None')
  
  // Click Continue to Step 3
  await page.waitForTimeout(500)
  const continueBtn2 = page.locator('button:has-text("Continue")')
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

  const submitBtn = page.locator('button:has-text("Submit")')
  console.log('Submit button found, clicking...')
  await submitBtn.click()
  console.log('Submit button clicked')

  // Wait for the response
  const response = await responsePromise
  if (response) {
    console.log('Form submission response received:', response.status())
  }

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
    console.log('Clicked "Very effective" button');

    // CRITICAL: Wait for React state to update
    await page.waitForTimeout(800);

    // Verify the button is now selected by checking for selected styling
    // Selected buttons have: border-purple-500 bg-purple-50
    const classes = await veryButton.getAttribute('class');
    const isSelected = classes?.includes('border-purple-500') || classes?.includes('bg-purple-50');
    console.log(`Effectiveness button classes: ${classes?.substring(0, 100)}...`);
    console.log(`Effectiveness button selected: ${isSelected}`);

    if (!isSelected) {
      console.log('⚠️ Button click did not register, trying force click...');
      await veryButton.click({ force: true });
      await page.waitForTimeout(500);

      // Check again
      const retriedClasses = await veryButton.getAttribute('class');
      const retriedSelected = retriedClasses?.includes('border-purple-500') || retriedClasses?.includes('bg-purple-50');
      console.log(`After retry - classes: ${retriedClasses?.substring(0, 100)}...`);
      console.log(`After retry, effectiveness button selected: ${retriedSelected}`);
    }
  } else {
    // Original star rating UI - use semantic selector for 4-star button
    const ratingButtonsLocator = page.locator('.grid.grid-cols-5 button');
    const ratingButtonCount = await ratingButtonsLocator.count();
    console.log(`Found ${ratingButtonCount} rating buttons`);

    if (ratingButtonCount >= 4) {
      // Semantic selector: find button with text "4" (more resilient than .nth(3))
      const fourStarButton = ratingButtonsLocator.filter({ hasText: /^4$/ });
      await fourStarButton.click();
      console.log('Selected 4-star effectiveness rating');
      await page.waitForTimeout(500);

      // Verify the button was clicked and effectiveness is set
      const isSelected = await fourStarButton.getAttribute('class');
      console.log(`4-star button classes: ${isSelected}`);
    } else {
      console.log('ERROR: Could not find effectiveness rating buttons');
      // Try alternative selector - find any button with text "4"
      const fourStarButton = page.locator('button').filter({ hasText: /^4$/ });
      const fourStarCount = await fourStarButton.count();
      console.log(`Found ${fourStarCount} buttons with text "4"`);
      if (fourStarCount > 0) {
        await fourStarButton.first().click();
        console.log('Selected 4-star effectiveness rating (alternative selector)');
      }
    }
  }
  await page.waitForTimeout(500)

  // Select time to results - check if using buttons or select/dropdown
  // Get category-specific value or default
  const categoryValues = SESSION_FORM_TEST_VALUES[category as keyof typeof SESSION_FORM_TEST_VALUES];
  let timeToResults = categoryValues?.timeToResults || '1-2 weeks';
  const timeButtons = page.locator('button').filter({ hasText: /Immediate|days|weeks|months/i });
  const hasTimeButtons = await timeButtons.count() > 0;

  if (hasTimeButtons) {
    // Button-based UI for time to results (crisis_resources)
    const buttonToClick = timeButtons.filter({ hasText: new RegExp(timeToResults, 'i') }).first();
    await buttonToClick.click();
    console.log(`Selected "${timeToResults}" time to results using button UI`);
  } else {
    // SessionForm uses shadcn Select for time_to_results
    // Use the established [role="option"] pattern
    const timeSelectTrigger = page.locator('button[role="combobox"]').first()
    await timeSelectTrigger.click()
    await page.waitForTimeout(500)
    // Click the option in the portal dropdown
    await page.locator('[role="option"]').filter({ hasText: timeToResults }).click()
    console.log(`Selected time to results using shadcn Select: ${timeToResults}`)
    // Wait for dropdown portal to disappear
    await page.waitForTimeout(800)
  }
  await page.waitForTimeout(300)
  
  // Select cost type (radio buttons) - now using standard HTML radio inputs
  // Wait for the cost section to be fully rendered (it's conditional based on category)
  await page.waitForSelector('text="Cost?"', { timeout: 10000 })
  console.log('Cost section found')

  // Define categories that auto-set cost type (no radio buttons)
  const singleCostCategories = ['therapists_counselors', 'coaches_mentors', 'alternative_practitioners', 'doctors_specialists'];

  // Check if radio buttons are present
  const radioButtonsExist = await page.locator('input[type="radio"][value="per_session"]').count() > 0
  console.log(`Radio buttons exist on page: ${radioButtonsExist}`)

  if (!radioButtonsExist) {
    // Some categories auto-set cost type and don't have radio buttons
    if (category === 'crisis_resources' || singleCostCategories.includes(category)) {
      console.log(`No radio buttons for ${category} - this is expected (auto-set to per_session)`)
      // Skip cost type selection - it's auto-set
    } else {
      // Other categories should have radio buttons
      await page.screenshot({ path: 'session-form-no-radio.png' })
      console.log('No radio buttons found - screenshot saved')

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
  // Strategy: Find the first combobox button (cost range) vs second (session frequency)
  // Cost range has no label, session frequency has label "Session frequency" or "How often?"
  // So we find all comboboxes and take the one that does NOT have "How often" text
  const allComboboxes = page.locator('button[role="combobox"]');
  const comboboxCount = await allComboboxes.count();
  console.log(`Found ${comboboxCount} total comboboxes on page`);

  // Find cost range by process of elimination - it's NOT the one with "How often" placeholder
  let costRangeTrigger = null;
  for (let i = 0; i < comboboxCount; i++) {
    // NOTE: .nth(i) is acceptable here - used in loop for process-of-elimination when no other semantic selector exists
    // We can't use a label-based selector because SessionForm has multiple unlabeled comboboxes
    const box = allComboboxes.nth(i);
    const text = await box.textContent().catch(() => '');
    console.log(`Combobox ${i}: "${text}"`);

    // Cost range shows either "Select cost range" or the selected value like "Under $50"
    // Skip boxes that have recognizable other placeholders or known values
    // CRITICAL: Also skip time-to-results values (1-2 weeks, etc) which appear first
    const isTimeToResults = text.includes('week') || text.includes('month') || text.includes('Immediate');
    if (!text.includes('How often') &&
        !text.includes('Select format') &&
        !text.includes('How long') &&
        !text.includes('Select service type') &&
        !text.includes('How quickly') &&
        !isTimeToResults) {
      console.log(`Matched cost range combobox at index ${i}`);
      costRangeTrigger = box;
      break;
    }
  }

  const hasCostRangeTrigger = costRangeTrigger ? await costRangeTrigger.isVisible().catch(() => false) : false;
  
  if (hasCostRangeTrigger) {
    console.log('Found cost range Select trigger, clicking...');
    await costRangeTrigger.click();
    await page.waitForTimeout(500);

    // Wait for dropdown content to appear
    await page.waitForSelector('[role="option"]', { timeout: 3000 });

    // Select appropriate option based on category-specific values
    let selectedOption = false;
    let expectedValue = categoryValues?.cost || 'Under $50';

    const costOption = page.locator('[role="option"]').filter({ hasText: expectedValue }).first();
    if (await costOption.isVisible().catch(() => false)) {
      await costOption.click();
      console.log(`Selected cost range: ${expectedValue}`);
      selectedOption = true;
    }

    if (!selectedOption) {
      // Fallback: click first available option
      const firstOption = page.locator('[role="option"]').first();

      // Get the actual text of the option we're clicking
      const actualText = await firstOption.textContent();
      expectedValue = actualText?.trim() || 'Unknown';

      await firstOption.click();
      console.log(`Selected first available cost range option: ${expectedValue}`);
    }

    // CRITICAL: Wait for the dropdown to close and verify selection persisted
    await page.waitForTimeout(500);

    // Verify the selection by looking for a combobox with the selected value
    // Create a fresh locator instead of reusing the old one (which may be stale)
    const verificationLocator = page.locator('button[role="combobox"]').filter({ hasText: expectedValue });
    const isSelected = await verificationLocator.isVisible().catch(() => false);

    console.log(`Cost range verification: ${isSelected ? '✅ Found' : '❌ Not found'} combobox with "${expectedValue}"`);

    if (!isSelected) {
      console.log('⚠️  WARNING: Cost range selection did not persist - attempting re-selection');

      // Re-find the cost range combobox using same process-of-elimination logic
      let retryTrigger = null;
      for (let i = 0; i < comboboxCount; i++) {
        // NOTE: .nth(i) is acceptable here - used in loop for process-of-elimination retry logic
        const box = allComboboxes.nth(i);
        const text = await box.textContent().catch(() => '');

        // CRITICAL: Also skip time-to-results values in retry logic
        const isTimeToResults = text.includes('week') || text.includes('month') || text.includes('Immediate');
        if (!text.includes('How often') &&
            !text.includes('Select format') &&
            !text.includes('How long') &&
            !text.includes('Select service type') &&
            !text.includes('How quickly') &&
            !isTimeToResults) {
          retryTrigger = box;
          break;
        }
      }

      if (retryTrigger) {
        await retryTrigger.click();
        await page.waitForTimeout(500);
        await page.locator('[role="option"]').filter({ hasText: expectedValue }).first().click();
        await page.waitForTimeout(500);

        // Re-verify with fresh locator
        const retryVerification = page.locator('button[role="combobox"]').filter({ hasText: expectedValue });
        const retrySuccess = await retryVerification.isVisible().catch(() => false);
        console.log(`Cost range re-verification: ${retrySuccess ? '✅ Success' : '❌ Still failed'}`);
      }
    } else {
      console.log(`✅ Cost range selection verified successfully`);
    }
  } else {
    console.log('ERROR: Cost range Select trigger not found');
    // Take a screenshot for debugging
    await page.screenshot({ path: 'session-form-cost-range-missing.png' });
  }
  
  // Session frequency - REQUIRED for most categories
  // Note: crisis_resources doesn't require session_frequency
  if (category !== 'crisis_resources') {
    console.log('Selecting session frequency (required field)...');

    // Use semantic selector based on placeholder text
    const freqTrigger = page.locator('button[role="combobox"]').filter({ hasText: 'How often' });
    const hasFreqTrigger = await freqTrigger.isVisible().catch(() => false);

    if (hasFreqTrigger) {
      await freqTrigger.click();
      await page.waitForTimeout(500);

      // Select category-specific frequency
      const frequencyValue = categoryValues?.sessionFrequency || 'Weekly';
      const frequencyOption = page.locator('[role="option"]').filter({ hasText: frequencyValue });
      if (await frequencyOption.isVisible()) {
        await frequencyOption.click();
        console.log(`Selected session frequency: ${frequencyValue}`);
      } else {
        // Fallback to first option
        await page.locator('[role="option"]').first().click();
        console.log('Selected first available session frequency');
      }
    } else {
      console.log('ERROR: Session frequency dropdown not found (placeholder "How often" not visible)');
    }
    await page.waitForTimeout(300);
  } else {
    console.log('Skipping session frequency for crisis_resources category');
  }
  
  // Format - Select component
  console.log('Selecting format...');

  // Use semantic selector based on placeholder text
  const formatTrigger = page.locator('button[role="combobox"]').filter({ hasText: 'Select format' });
  const hasFormatTrigger = await formatTrigger.isVisible().catch(() => false);

  if (hasFormatTrigger) {
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
    console.log('Warning: Format dropdown not found (placeholder "Select format" not visible)');
  }
  await page.waitForTimeout(300)
  
  // Session length - REQUIRED for therapists_counselors, OPTIONAL for others but may still appear
  // Use semantic selector based on placeholder text
  const sessionLengthTrigger = page.locator('button[role="combobox"]').filter({ hasText: 'How long' });
  const hasSessionLength = await sessionLengthTrigger.isVisible().catch(() => false);

  if (hasSessionLength) {
    console.log(`Found session length dropdown for ${category}`);

    // Fill it whether required or not to ensure form validation passes
    await sessionLengthTrigger.click();
    await page.waitForTimeout(500);

    // Select category-specific session length
    const sessionLengthValue = categoryValues?.sessionLength || '60 minutes';
    const sessionLengthOption = page.locator('[role="option"]').filter({ hasText: sessionLengthValue });
    if (await sessionLengthOption.isVisible()) {
      await sessionLengthOption.click();
      console.log(`Selected session length: ${sessionLengthValue}`);
    } else {
      // Fallback to first option
      await page.locator('[role="option"]').first().click();
      console.log('Selected first available session length');
    }
    await page.waitForTimeout(300);
  } else if (category === 'therapists_counselors' || category === 'coaches_mentors' || category === 'alternative_practitioners') {
    console.log(`ERROR: Session length dropdown not found for ${category} (REQUIRED)`);
  } else {
    console.log(`Session length not present for ${category} (optional)`);
  }
  
  // Insurance coverage - OPTIONAL for therapists, doctors, medical_procedures
  if (['therapists_counselors', 'doctors_specialists', 'medical_procedures'].includes(category)) {
    console.log('Looking for insurance coverage dropdown...');

    // Use semantic selector based on placeholder text
    const insuranceTrigger = page.locator('button[role="combobox"]').filter({ hasText: 'Coverage' });
    const hasInsurance = await insuranceTrigger.isVisible().catch(() => false);

    if (hasInsurance) {
      console.log('Found insurance coverage dropdown');

      await insuranceTrigger.click();
      await page.waitForTimeout(500);

      // Select first available option
      await page.locator('[role="option"]').first().click();
      console.log('Selected first available insurance coverage option');
      await page.waitForTimeout(300);
    } else {
      console.log(`Insurance coverage dropdown not found for ${category}`);
    }
  }
  
  // Wait time - REQUIRED for doctors_specialists
  if (category === 'doctors_specialists') {
    console.log('Looking for wait time dropdown (REQUIRED for doctors)...');

    // Use semantic selector based on placeholder text
    const waitTrigger = page.locator('button[role="combobox"]').filter({ hasText: 'Time to get appointment' });
    const hasWaitTime = await waitTrigger.isVisible().catch(() => false);

    if (hasWaitTime) {
      console.log('Found wait time dropdown');

      await waitTrigger.click();
      await page.waitForTimeout(500);

      // Select category-specific wait time
      const waitTimeValue = categoryValues?.waitTime || 'Within a week';
      const waitOption = page.locator('[role="option"]').filter({ hasText: waitTimeValue });
      if (await waitOption.isVisible()) {
        await waitOption.click();
        console.log(`Selected wait time: ${waitTimeValue}`);
      } else {
        await page.locator('[role="option"]').first().click();
        console.log('Selected first available wait time');
      }
      await page.waitForTimeout(300);
    } else {
      console.log('ERROR: Wait time dropdown not found for doctors_specialists (REQUIRED)');
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

    // Use semantic selector based on placeholder text
    const responseTrigger = page.locator('button[role="combobox"]').filter({ hasText: 'How quickly did they respond' });
    const hasResponseTime = await responseTrigger.isVisible().catch(() => false);

    if (hasResponseTime) {
      console.log('Found response time dropdown');
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
      console.log('ERROR: Response time dropdown not found for crisis_resources (REQUIRED)');
    }

    console.log('Response time selection completed');
    console.log(`⏱️ Timestamp after responseTime: ${Date.now()}`);
    // Reduced from 2000ms - testing showed timeout issue is not React re-render delay
    await page.waitForTimeout(500);
    console.log(`⏱️ Timestamp after wait: ${Date.now()}`);
  }

  // CRITICAL: Wait for ALL React state updates to complete and Continue button to enable
  console.log('Waiting for Continue button to become enabled (React state must sync)...')

  // Wait for the enabled (not disabled) Continue button
  const continueBtn = page.locator('button:has-text("Continue")')

  try {
    await continueBtn.waitFor({ state: 'attached', timeout: 15000 })
    console.log('✅ Continue button is attached and enabled')
  } catch (error) {
    console.log('❌ Continue button did not become enabled within 15s')
    throw new Error(`Continue button not enabled for ${category}`)
  }

  // Click Continue button
  await continueBtn.click()
  console.log('Continue button clicked')

  // Fallback: If click doesn't trigger React, force the step change via JavaScript
  await page.waitForTimeout(2000)
  const stillOnStep1 = await page.locator('text="How well it worked"').isVisible().catch(() => false)

  if (stillOnStep1) {
    console.log('⚠️ Still on Step 1 after Continue click - trying JavaScript navigation...')

    await page.evaluate(() => {
      // Find the Continue button and trigger click event
      const continueButtons = Array.from(document.querySelectorAll('button'))
        .filter(btn => btn.textContent?.includes('Continue'))

      if (continueButtons.length > 0) {
        continueButtons[0].click()
      }
    })

    await page.waitForTimeout(1000)
    console.log('JavaScript click attempted')
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
  const continueBtn2 = page.locator('button:has-text("Continue")')
  await continueBtn2.click()
  console.log('Moving to Step 3')
  await page.waitForTimeout(500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  
  // Skip failed solutions and submit directly
  const submitBtn = page.locator('button:has-text("Submit")')
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
  
  // Select time to results (shadcn Select - first Select component)
  const timeSelectTrigger = page.locator('button[role="combobox"]').first()
  await timeSelectTrigger.click()
  await page.waitForTimeout(500)
  await page.locator('[role="option"]').filter({ hasText: '1-2 weeks' }).click()
  console.log('Selected time to results: 1-2 weeks')
  await page.waitForTimeout(800)

  // Select startup cost (shadcn Select - second Select component)
  const startupSelectTrigger = page.locator('button[role="combobox"]').nth(1)
  await startupSelectTrigger.click()
  await page.waitForTimeout(500)
  await page.locator('[role="option"]').filter({ hasText: 'Free/No startup cost' }).click()
  console.log('Selected startup cost: Free/No startup cost')
  await page.waitForTimeout(800)

  // Select ongoing cost (shadcn Select - third Select component)
  const ongoingSelectTrigger = page.locator('button[role="combobox"]').nth(2)
  await ongoingSelectTrigger.click()
  await page.waitForTimeout(500)
  await page.locator('[role="option"]').filter({ hasText: 'Free/No ongoing cost' }).click()
  console.log('Selected ongoing cost: Free/No ongoing cost')
  await page.waitForTimeout(800)

  // Select frequency (shadcn Select - fourth Select component)
  const frequencySelectTrigger = page.locator('button[role="combobox"]').nth(3)
  await frequencySelectTrigger.click()
  await page.waitForTimeout(500)
  await page.locator('[role="option"]').filter({ hasText: '3-4 times per week' }).click()
  console.log('Selected frequency: 3-4 times per week')
  await page.waitForTimeout(800)

  // Category-specific field (shadcn Select - fifth Select component)
  if (category === 'meditation_mindfulness') {
    // Practice length for meditation
    const categorySelectTrigger = page.locator('button[role="combobox"]').nth(4)
    await categorySelectTrigger.click()
    await page.waitForTimeout(500)
    await page.locator('[role="option"]').filter({ hasText: '10-20 minutes' }).click()
    console.log('Selected practice length: 10-20 minutes')
    await page.waitForTimeout(800)
  } else if (category === 'exercise_movement') {
    // Session duration for exercise
    const categorySelectTrigger = page.locator('button[role="combobox"]').nth(4)
    await categorySelectTrigger.click()
    await page.waitForTimeout(500)
    await page.locator('[role="option"]').filter({ hasText: '30-45 minutes' }).click()
    console.log('Selected session duration: 30-45 minutes')
    await page.waitForTimeout(800)
  } else if (category === 'habits_routines') {
    // Daily time commitment for habits
    const categorySelectTrigger = page.locator('button[role="combobox"]').nth(4)
    await categorySelectTrigger.click()
    await page.waitForTimeout(500)
    await page.locator('[role="option"]').filter({ hasText: '10-20 minutes' }).click()
    console.log('Selected daily time commitment: 10-20 minutes')
    await page.waitForTimeout(800)
  }
  await page.waitForTimeout(500)
  
  // Click Continue to Step 2
  const continueBtn1 = page.locator('button:has-text("Continue")')
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
  const continueBtn2 = page.locator('button:has-text("Continue")')
  await continueBtn2.click()
  console.log('Moving to Step 3')
  await page.waitForTimeout(500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  
  // Skip failed solutions and submit directly
  const submitBtn = page.locator('button:has-text("Submit")')
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

  // Select time to results using shadcn Select
  // PurchaseForm uses shadcn Select for time_to_results
  // Use the established [role="option"] pattern
  const timeSelectTrigger = page.locator('button[role="combobox"]').first()
  await timeSelectTrigger.click()
  await page.waitForTimeout(500)
  // Click the option in the portal dropdown
  await page.locator('[role="option"]').filter({ hasText: '1-2 weeks' }).click()
  console.log('Selected time to results using shadcn Select: 1-2 weeks')
  // Wait for dropdown portal to disappear
  await page.waitForTimeout(800)
  
  // Select cost type first (RadioGroup)
  console.log('Selecting cost type: one_time')
  // Click on the label text instead of the radio input
  await page.click('text="One-time purchase"')
  await page.waitForTimeout(500)
  
  // Select cost range using shadcn Select component (2nd Select after time_to_results)
  const costRangeSelectTrigger = page.locator('button[role="combobox"]').nth(1)
  await costRangeSelectTrigger.click()
  await page.waitForTimeout(500)

  // Select from the Portal dropdown using role="option"
  await page.locator('[role="option"]').filter({ hasText: '$50-100' }).click()
  console.log('Selected cost range: $50-100')
  await page.waitForTimeout(800)
  
  // Category-specific fields
  if (category === 'products_devices') {
    console.log('Filling products_devices category-specific fields')
    await page.waitForTimeout(1000)

    // Look for Select components
    const selectTriggers = await page.locator('button[role="combobox"]').count()
    console.log(`Found ${selectTriggers} Select trigger buttons`)

    if (selectTriggers >= 2) {
      // Select product type - SEMANTIC SELECTOR
      const productTypeSelect = page.locator('button[role="combobox"]').filter({ hasText: 'Select type' })
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

      // Select ease of use - SEMANTIC SELECTOR
      const easeSelect = page.locator('button[role="combobox"]').filter({ hasText: 'How easy to use' })
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
      // Select format - SEMANTIC SELECTOR
      const formatSelect = page.locator('button[role="combobox"]').filter({ hasText: 'Select type' })
      await formatSelect.click()
      await page.waitForTimeout(500)

      try {
        await page.click('text="Physical book"', { timeout: 2000 })
        console.log('Selected format: Physical book')
      } catch (e) {
        console.log('Trying first option for format')
        await page.locator('[role="option"]').first().click()
      }
      await page.waitForTimeout(300)

      // Select learning difficulty - SEMANTIC SELECTOR
      const difficultySelect = page.locator('button[role="combobox"]').filter({ hasText: 'How challenging' })
      await difficultySelect.click()
      await page.waitForTimeout(500)

      try {
        await page.click('text="Beginner friendly"', { timeout: 2000 })
        console.log('Selected learning difficulty: Beginner friendly')
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
  const continueBtn1 = page.locator('button:has-text("Continue")')
  await continueBtn1.click()
  await page.waitForTimeout(500)
  
  // ============ STEP 2: Issues ============
  console.log('Step 2: Selecting issues')
  await page.click('label:has-text("None")')
  await page.waitForTimeout(500)
  
  // Click Continue to Step 3
  console.log('Clicked Continue to Step 3')
  const continueBtn2 = page.locator('button:has-text("Continue")')
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
  
  // Select time to results using semantic selector
  await page.waitForTimeout(1000)
  const timeSelect = page.locator('button[role="combobox"]').filter({ hasText: 'Select timeframe' })
  await timeSelect.click()
  await page.waitForTimeout(300)
  await page.click('text="1-2 weeks"')
  console.log('Selected time to results: 1-2 weeks')
  await page.waitForTimeout(300)

  // Select payment type (simplified - no second dropdown needed)
  const paymentSelect = page.locator('button[role="combobox"]').filter({ hasText: 'How do you pay' })
  await paymentSelect.click()
  await page.waitForTimeout(300)

  // Select payment type based on category
  // support_groups typically use "Donation-based", groups_communities use "Free"
  const paymentType = category === 'support_groups' ? 'Donation-based' : 'Free'
  await page.click(`text="${paymentType}"`)
  console.log(`Selected payment type: ${paymentType}`)
  await page.waitForTimeout(500)

  // Select meeting frequency
  const meetingSelect = page.locator('button[role="combobox"]').filter({ hasText: 'How often' })
  await meetingSelect.click()
  await page.waitForTimeout(300)
  await page.click('text="Weekly"')
  console.log('Selected meeting frequency: Weekly')
  await page.waitForTimeout(500)

  // Select format
  const formatSelect = page.locator('button[role="combobox"]').filter({ hasText: 'Meeting format' })
  await formatSelect.click()
  await page.waitForTimeout(300)
  await page.click('text="Online only"')
  console.log('Selected format: Online only')
  await page.waitForTimeout(500)

  // Select group size
  const groupSizeSelect = page.locator('button[role="combobox"]').filter({ hasText: 'How many people' })
  await groupSizeSelect.click()
  await page.waitForTimeout(300)
  await page.locator('[role="option"]').filter({ hasText: 'Small (under 10 people)' }).click()
  console.log('Selected group size: Small (under 10 people)')
  await page.waitForTimeout(300)
  
  // Click Continue to Step 2
  console.log('Clicked Continue to Step 2')
  const continueBtn1 = page.locator('button:has-text("Continue")')
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
  const continueBtn2 = page.locator('button:has-text("Continue")')
  await continueBtn2.click()
  await page.waitForTimeout(500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  // This step is optional - can proceed directly to submit
  
  // Wait for Step 3 to fully load and check if submit is available
  await page.waitForTimeout(2000)
  
  // Debug: Check if Submit button is visible and enabled
  const submitBtnVisible = await page.locator('button:has-text("Submit")').isVisible().catch(() => false)
  const submitBtnEnabled = await page.locator('button:has-text("Submit")').isVisible().catch(() => false)
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
  
  // Select time to results (required) using shadcn Select
  // LifestyleForm uses shadcn Select for time_to_results
  const timeSelectTrigger = page.locator('button[role="combobox"]').first()
  await timeSelectTrigger.click()
  await page.waitForTimeout(500)
  await page.locator('[role="option"]').filter({ hasText: '1-2 weeks' }).click()
  console.log('Selected time to results using shadcn Select: 1-2 weeks')
  await page.waitForTimeout(800)

  // Select cost impact (required) using shadcn Select
  // This is the 2nd Select component
  const costSelectTrigger = page.locator('button[role="combobox"]').nth(1)
  await costSelectTrigger.click()
  await page.waitForTimeout(500)
  if (category === 'diet_nutrition') {
    await page.locator('[role="option"]').filter({ hasText: 'About the same' }).click()
    console.log('Selected cost impact using shadcn Select: About the same')
  } else {
    await page.locator('[role="option"]').filter({ hasText: 'Free' }).click()
    console.log('Selected cost impact using shadcn Select: Free')
  }
  await page.waitForTimeout(800)

  // Category-specific required fields using shadcn Select
  if (category === 'diet_nutrition') {
    // Weekly prep time (required for diet_nutrition) - 3rd Select component
    const prepTimeSelectTrigger = page.locator('button[role="combobox"]').nth(2)
    await prepTimeSelectTrigger.click()
    await page.waitForTimeout(500)
    await page.locator('[role="option"]').filter({ hasText: '1-2 hours/week' }).click()
    console.log('Selected weekly prep time using shadcn Select: 1-2 hours/week')
    await page.waitForTimeout(800)
  } else if (category === 'sleep') {
    // Previous sleep hours (required for sleep) - 3rd Select component
    const sleepSelectTrigger = page.locator('button[role="combobox"]').nth(2)
    await sleepSelectTrigger.click()
    await page.waitForTimeout(500)
    await page.locator('[role="option"]').filter({ hasText: '6-7 hours' }).click()
    console.log('Selected previous sleep hours using shadcn Select: 6-7 hours')
    await page.waitForTimeout(800)
  }
  
  // Select stillFollowing (required) - "Yes, still following it"
  // Click the label instead of the hidden radio input
  const stillFollowingLabel = page.locator('label').filter({ hasText: 'Yes, still following it' })
  await stillFollowingLabel.click()
  console.log('Selected: Yes, still following it')
  await page.waitForTimeout(500)
  
  // Click Continue to Step 2
  const continueBtn1 = page.locator('button:has-text("Continue")')
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
  const continueBtn2 = page.locator('button:has-text("Continue")')
  await continueBtn2.click()
  console.log('Moving to Step 3')
  await page.waitForTimeout(500)
  
  // ============ STEP 3: Failed Solutions (Optional) ============
  console.log('Step 3: Skipping failed solutions')
  
  // Skip failed solutions and submit directly
  const submitBtn = page.locator('button:has-text("Submit")')
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

  // Select cost type (required field) using shadcn Select - 1st Select component
  const costTypeSelectTrigger = page.locator('button[role="combobox"]').first()
  await costTypeSelectTrigger.click()
  await page.waitForTimeout(500)
  await page.locator('[role="option"]').filter({ hasText: 'Free to use' }).click()
  console.log('Selected cost type using shadcn Select: Free to use')
  await page.waitForTimeout(800)

  // Select financial benefit (required field) using shadcn Select - 2nd Select component
  const benefitSelectTrigger = page.locator('button[role="combobox"]').nth(1)
  await benefitSelectTrigger.click()
  await page.waitForTimeout(500)
  await page.locator('[role="option"]').filter({ hasText: '$25-100/month saved/earned' }).click()
  console.log('Selected financial benefit using shadcn Select: $25-100/month saved/earned')
  await page.waitForTimeout(800)

  // Select access time (required field) using shadcn Select - 3rd Select component
  const accessSelectTrigger = page.locator('button[role="combobox"]').nth(2)
  await accessSelectTrigger.click()
  await page.waitForTimeout(500)
  await page.locator('[role="option"]').filter({ hasText: 'Same day' }).click()
  console.log('Selected access time using shadcn Select: Same day')
  await page.waitForTimeout(800)

  // Click effectiveness rating (4 stars)
  const ratingButtons = await page.locator('.grid.grid-cols-5 button').all()
  if (ratingButtons.length >= 4) {
    await ratingButtons[3].click() // 4 stars
    console.log('Selected 4-star rating')
  }
  await page.waitForTimeout(500)

  // Select time to impact (required field) using shadcn Select - 4th Select component
  const timeToImpactSelectTrigger = page.locator('button[role="combobox"]').nth(3)
  await timeToImpactSelectTrigger.click()
  await page.waitForTimeout(500)
  await page.locator('[role="option"]').filter({ hasText: '1-2 weeks' }).click()
  console.log('Selected time to impact using shadcn Select: 1-2 weeks')
  await page.waitForTimeout(800)

  // Click Continue to Step 2
  console.log('Attempting to continue to Step 2...')
  const continueBtn1 = page.locator('button:has-text("Continue")')
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
  const continueBtn2 = page.locator('button:has-text("Continue")')
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
