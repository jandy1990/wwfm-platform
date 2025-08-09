import { Page } from '@playwright/test'

/**
 * Generic form filler that adapts to any form structure
 * This is a pragmatic approach to handle forms that may change
 */

export async function fillFormGeneric(page: Page, category: string) {
  // Wait for page to stabilize
  await page.waitForTimeout(2000)
  
  // Check if we need to select category manually
  const needsCategorySelection = await page.locator('text="Choose a category"').isVisible()
  
  if (needsCategorySelection) {
    // Map categories to their UI paths
    const categoryMap: Record<string, { section: string, label: string }> = {
      // Things you take
      'medications': { section: 'Things you take', label: 'Medications' },
      'supplements_vitamins': { section: 'Things you take', label: 'Supplements & Vitamins' },
      'natural_remedies': { section: 'Things you take', label: 'Natural Remedies' },
      'beauty_skincare': { section: 'Things you take', label: 'Beauty & Skincare' },
      
      // People you see
      'therapists_counselors': { section: 'People you see', label: 'Therapists & Counselors' },
      'doctors_specialists': { section: 'People you see', label: 'Doctors & Specialists' },
      'coaches_mentors': { section: 'People you see', label: 'Coaches & Mentors' },
      'alternative_practitioners': { section: 'People you see', label: 'Alternative Practitioners' },
      'professional_services': { section: 'People you see', label: 'Professional Services' },
      'medical_procedures': { section: 'People you see', label: 'Medical Procedures' },
      'crisis_resources': { section: 'People you see', label: 'Crisis Resources' },
      
      // Things you do
      'exercise_movement': { section: 'Things you do', label: 'Exercise & Movement' },
      'meditation_mindfulness': { section: 'Things you do', label: 'Meditation & Mindfulness' },
      'habits_routines': { section: 'Things you do', label: 'Habits & Routines' },
      'hobbies_activities': { section: 'Things you do', label: 'Hobbies & Activities' },
      'groups_communities': { section: 'Things you do', label: 'Groups & Communities' },
      'support_groups': { section: 'Things you do', label: 'Support Groups' },
      
      // Things you use
      'apps_software': { section: 'Things you use', label: 'Apps & Software' },
      'products_devices': { section: 'Things you use', label: 'Products & Devices' },
      'books_courses': { section: 'Things you use', label: 'Books & Courses' },
      
      // Changes you make
      'diet_nutrition': { section: 'Changes you make', label: 'Diet & Nutrition' },
      'sleep': { section: 'Changes you make', label: 'Sleep' },
      
      // Financial
      'financial_products': { section: 'Financial', label: 'Financial Products' }
    }
    
    const categoryInfo = categoryMap[category]
    if (categoryInfo) {
      // Click the section to expand it
      const sectionButton = page.locator(`button:has-text("${categoryInfo.section}")`)
      if (await sectionButton.isVisible()) {
        await sectionButton.click()
        await page.waitForTimeout(500)
      }
      
      // Click the specific category
      await page.click(`text="${categoryInfo.label}"`)
      await page.waitForTimeout(1500)
    }
  }
  
  // Now we should be on the form - fill it generically
  // This is a best-effort approach that works for most forms
  
  // 1. Handle rating buttons if present
  // Look for numeric rating buttons (1-5) or emoji rating buttons
  const numericRatingButtons = await page.locator('button').filter({ hasText: /^[1-5]$/ }).all()
  const emojiRatingButtons = await page.locator('button:has(div)').filter({ 
    has: page.locator('text=/😞|😕|😐|😊|🤩/') 
  }).all()
  
  if (numericRatingButtons.length > 0) {
    // Click rating 4 (good but not perfect)
    if (numericRatingButtons.length >= 4) {
      await numericRatingButtons[3].click() // Index 3 = rating 4
      await page.waitForTimeout(500)
    }
  } else if (emojiRatingButtons.length > 0) {
    // Click the second highest rating (usually second to last)
    if (emojiRatingButtons.length > 1) {
      await emojiRatingButtons[emojiRatingButtons.length - 2].click()
      await page.waitForTimeout(500)
    }
  }
  
  // 2. Fill all visible select dropdowns
  const visibleSelects = await page.locator('select:visible').all()
  for (const select of visibleSelects) {
    const options = await select.locator('option').all()
    if (options.length > 1) {
      // Select a middle option (avoid first which is usually placeholder)
      const targetIndex = Math.min(2, options.length - 1)
      const optionText = await options[targetIndex].textContent()
      if (optionText) {
        await select.selectOption(optionText)
        await page.waitForTimeout(200)
      }
    }
  }
  
  // 3. Fill text inputs if any
  const textInputs = await page.locator('input[type="text"]:visible, input[type="number"]:visible').all()
  for (const input of textInputs) {
    const placeholder = await input.getAttribute('placeholder')
    if (placeholder?.includes('cost') || placeholder?.includes('price')) {
      await input.fill('50')
    } else if (placeholder?.includes('time') || placeholder?.includes('duration')) {
      await input.fill('30')
    } else {
      await input.fill('Test input')
    }
  }
  
  // 4. Fill textareas if any
  const textareas = await page.locator('textarea:visible').all()
  for (const textarea of textareas) {
    await textarea.fill('This is test content for automated testing.')
  }
  
  // 5. Navigate through multi-step forms
  let stepCount = 0
  const maxSteps = 6 // Most forms have 4-5 steps
  
  while (stepCount < maxSteps) {
    // Wait for the page to stabilize
    await page.waitForTimeout(1500)
    
    // First check if we're at the Submit step
    const submitButton = page.locator('button:has-text("Submit"):visible').first()
    if (await submitButton.count() > 0) {
      // We're at the final step, break out of the loop
      break
    }
    
    // Check for Continue button (our forms use Continue, not Next)
    const continueButton = page.locator('button:has-text("Continue"):visible').first()
    const hasContinue = await continueButton.count() > 0
    
    if (hasContinue) {
      // Check if the button is disabled (might need to fill fields first)
      const isDisabled = await continueButton.isDisabled()
      
      if (isDisabled) {
        // Need to fill required fields on this step before continuing
        console.log(`Continue button disabled on step ${stepCount + 1}, filling required fields...`)
        
        // Try to handle rating buttons
        const ratingBtns = await page.locator('button').filter({ hasText: /^[1-5]$/ }).all()
        if (ratingBtns.length >= 4) {
          await ratingBtns[3].click() // Click rating 4
          await page.waitForTimeout(500)
        }
        
        // Fill selects
        const selects = await page.locator('select:visible').all()
        for (const select of selects) {
          const value = await select.inputValue()
          if (!value || value === '') {
            const options = await select.locator('option').all()
            if (options.length > 1) {
              await select.selectOption({ index: 1 })
              await page.waitForTimeout(200)
            }
          }
        }
        
        // Fill text inputs
        const inputs = await page.locator('input[type="text"]:visible, input[type="number"]:visible').all()
        for (const input of inputs) {
          const value = await input.inputValue()
          if (!value || value === '') {
            await input.fill('Test Value')
            await page.waitForTimeout(200)
          }
        }
        
        // Check if button is still disabled
        if (await continueButton.isDisabled()) {
          console.log('Continue still disabled after filling fields')
          break
        }
      }
      
      await continueButton.click()
      await page.waitForTimeout(1500)
      
      // After clicking continue, handle any new form elements on the new step
      
      // Check for rating buttons on this step
      const stepRatingButtons = await page.locator('button').filter({ hasText: /^[1-5]$/ }).all()
      if (stepRatingButtons.length > 0 && stepRatingButtons.length >= 4) {
        await stepRatingButtons[3].click() // Click rating 4
        await page.waitForTimeout(500)
      }
      
      // Fill any new select dropdowns on this step
      const stepSelects = await page.locator('select:visible').all()
      for (const select of stepSelects) {
        const value = await select.inputValue()
        if (!value || value === '') {
          const options = await select.locator('option').all()
          if (options.length > 2) {
            await select.selectOption({ index: 2 }) // Select third option (skip placeholder and first)
          } else if (options.length > 1) {
            await select.selectOption({ index: 1 }) // Select second option
          }
          await page.waitForTimeout(200)
        }
      }
      
      // Check for checkboxes or radio buttons
      const checkboxes = await page.locator('input[type="checkbox"]:visible, input[type="radio"]:visible').all()
      if (checkboxes.length > 0) {
        // Look for "None" option first
        const noneCheckbox = await page.locator('label:has-text("None")').first()
        if (await noneCheckbox.isVisible()) {
          await noneCheckbox.click()
        } else if (checkboxes.length > 0) {
          await checkboxes[0].click()
        }
        await page.waitForTimeout(500)
      }
      
      // Check for clickable labels (often used for selection)
      const clickableLabels = await page.locator('label:has(input[type="checkbox"]), label:has(input[type="radio"])').all()
      if (clickableLabels.length > 0 && checkboxes.length === 0) {
        // Click the first label or one that says "None"
        const noneLabel = await page.locator('label:has-text("None")').first()
        if (await noneLabel.count() > 0) {
          await noneLabel.click()
        } else if (clickableLabels.length > 0) {
          await clickableLabels[0].click()
        }
        await page.waitForTimeout(500)
      }
      
      stepCount++
    } else {
      // No more Continue buttons, we might be at the final step
      break
    }
  }
  
  // 6. Handle the submit button on the final step
  // The submit button might not have type="submit", just text "Submit"
  await page.waitForTimeout(1500)
  
  // Before submitting, make sure all required fields are filled
  // Fill any remaining selects
  const finalSelects = await page.locator('select:visible').all()
  for (const select of finalSelects) {
    const value = await select.inputValue()
    if (!value || value === '') {
      const options = await select.locator('option').all()
      if (options.length > 1) {
        await select.selectOption({ index: 1 })
        await page.waitForTimeout(200)
      }
    }
  }
  
  // Fill any remaining text areas
  const finalTextareas = await page.locator('textarea:visible').all()
  for (const textarea of finalTextareas) {
    const value = await textarea.inputValue()
    if (!value || value === '') {
      await textarea.fill('Test notes for automated testing.')
      await page.waitForTimeout(200)
    }
  }
  
  const submitButton = page.locator('button:has-text("Submit"):visible').first()
  
  if (await submitButton.count() > 0) {
    // Check if button is enabled
    const isDisabled = await submitButton.isDisabled()
    if (!isDisabled) {
      await submitButton.click()
      await page.waitForTimeout(2000)
    } else {
      // Button is disabled, might need to fill something
      console.log('Submit button is disabled, checking for missing fields...')
      
      // Try to fill any remaining required fields
      const emptySelects = await page.locator('select:visible').all()
      for (const select of emptySelects) {
        const value = await select.inputValue()
        if (!value || value === '') {
          const options = await select.locator('option').all()
          if (options.length > 1) {
            const optionText = await options[1].textContent()
            if (optionText) {
              await select.selectOption(optionText)
            }
          }
        }
      }
      
      // Try submit again
      await page.waitForTimeout(500)
      if (await submitButton.count() > 0 && !(await submitButton.isDisabled())) {
        await submitButton.click()
      }
    }
  }
  
  // Final wait for navigation or success
  await page.waitForTimeout(2000)
}

export function createGenericFormConfig(formName: string, categories: string[], triggerWords: Record<string, string>) {
  return {
    formName,
    categories,
    requiredFields: [], // We don't validate specific fields
    arrayFields: [],
    hasVariants: false,
    
    generateTestData: (category: string) => ({
      title: triggerWords[category] || `Test ${category} ${Date.now()}`
    }),
    
    fillFormSteps: async (page: Page, testData: any) => {
      await fillFormGeneric(page, testData.category)
    }
  }
}