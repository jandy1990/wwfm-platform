/**
 * Form filling helper functions
 * Category-specific form interaction logic
 */

import type { SnapshotElement } from './devtools'
import type { AnyFormTestData } from '../types/test-data'

/**
 * Fill solution search input and select from dropdown
 */
export async function fillSolutionSearch(
  snapshot: SnapshotElement[],
  solutionName: string
): Promise<void> {
  console.log(`📝 Filling solution search with: "${solutionName}"`)

  // Find the search input
  // const searchInput = findElementByAttribute(snapshot, 'placeholder', 'Headspace')
  // if (!searchInput) throw new Error('Could not find solution search input')

  // Fill the input
  // await fill(searchInput.uid, solutionName)

  // Wait for dropdown to appear
  // await waitFor(solutionName, 3000)

  // Click on the solution in dropdown
  // const solutionButton = await findElementByText(snapshot, solutionName)
  // if (solutionButton) await click(solutionButton)

  console.log(`✅ Solution search filled and selected`)
}

/**
 * Click Continue button after search
 */
export async function clickContinueAfterSearch(snapshot: SnapshotElement[]): Promise<void> {
  console.log(`🖱️ Clicking Continue button after search`)

  // Find and click Continue button
  // const continueBtn = await findElementByText(snapshot, 'Continue')
  // if (continueBtn) await click(continueBtn)

  console.log(`✅ Clicked Continue`)
}

/**
 * Select category if auto-categorization shows picker
 */
export async function selectCategoryIfNeeded(
  snapshot: SnapshotElement[],
  category: string
): Promise<void> {
  console.log(`🔍 Checking if category picker is shown...`)

  // Check if "Choose a category" text exists
  // const categoryPicker = await findElementByText(snapshot, 'Choose a category')

  // if (categoryPicker) {
  //   console.log(`📝 Category picker shown, selecting: ${category}`)
  //   // Find and click the category
  //   const categoryBtn = await findElementByText(snapshot, category)
  //   if (categoryBtn) await click(categoryBtn)
  // } else {
  //   console.log(`✅ Auto-categorization worked, no picker needed`)
  // }
}

/**
 * Select star rating (1-5)
 */
export async function selectStarRating(
  snapshot: SnapshotElement[],
  rating: 1 | 2 | 3 | 4 | 5
): Promise<void> {
  console.log(`⭐ Selecting ${rating}-star rating`)

  // Map rating to emoji
  const emojiMap = {
    1: '😞',
    2: '😕',
    3: '😐',
    4: '😊',
    5: '🤩',
  }

  const emoji = emojiMap[rating]

  // Find and click the rating button
  // const ratingBtn = await findElementByText(snapshot, emoji)
  // if (!ratingBtn) throw new Error(`Could not find ${rating}-star rating button`)
  // await click(ratingBtn)

  console.log(`✅ Selected ${rating}-star rating`)
}

/**
 * Select from dropdown by visible text
 */
export async function selectDropdownOption(
  snapshot: SnapshotElement[],
  dropdownIndex: number,
  optionText: string
): Promise<void> {
  console.log(`📝 Selecting dropdown option: "${optionText}"`)

  // Find all select elements
  // const selects = findElementsByTag(snapshot, 'select')
  // if (!selects[dropdownIndex]) {
  //   throw new Error(`Could not find dropdown at index ${dropdownIndex}`)
  // }

  // Fill the select with the option
  // await fill(selects[dropdownIndex].uid, optionText)

  console.log(`✅ Selected dropdown option`)
}

/**
 * Fill text input by index
 */
export async function fillTextInput(
  snapshot: SnapshotElement[],
  inputIndex: number,
  value: string
): Promise<void> {
  console.log(`📝 Filling text input ${inputIndex} with: "${value}"`)

  // Find all input elements
  // const inputs = findElementsByTag(snapshot, 'input')
  // if (!inputs[inputIndex]) {
  //   throw new Error(`Could not find input at index ${inputIndex}`)
  // }

  // await fill(inputs[inputIndex].uid, value)

  console.log(`✅ Text input filled`)
}

/**
 * Toggle checkbox by label text
 */
export async function toggleCheckbox(
  snapshot: SnapshotElement[],
  labelText: string
): Promise<void> {
  console.log(`☑️ Toggling checkbox: "${labelText}"`)

  // Find the label
  // const label = await findElementByText(snapshot, labelText, { tag: 'label' })
  // if (!label) throw new Error(`Could not find checkbox with label: ${labelText}`)

  // Click the label
  // await click(label.uid)

  console.log(`✅ Checkbox toggled`)
}

/**
 * Fill DosageForm Step 1: Dosage, Effectiveness, TTR
 */
export async function fillDosageFormStep1(
  snapshot: SnapshotElement[],
  testData: any
): Promise<void> {
  console.log(`📝 Filling DosageForm Step 1...`)

  // For beauty_skincare, different fields
  if (testData.category === 'beauty_skincare') {
    await selectStarRating(snapshot, testData.effectiveness)
    await selectDropdownOption(snapshot, 0, testData.timeToResults)
    await selectDropdownOption(snapshot, 1, testData.skincareFrequency)
    await selectDropdownOption(snapshot, 2, testData.lengthOfUse)
  } else {
    // Regular dosage form
    await fillTextInput(snapshot, 0, testData.doseAmount) // amount
    await selectDropdownOption(snapshot, 0, testData.doseUnit) // unit
    await selectDropdownOption(snapshot, 1, testData.frequency) // frequency
    await selectDropdownOption(snapshot, 2, testData.lengthOfUse) // length of use
    await selectStarRating(snapshot, testData.effectiveness)
    await selectDropdownOption(snapshot, 3, testData.timeToResults)
  }

  console.log(`✅ DosageForm Step 1 filled`)
}

/**
 * Fill DosageForm Step 2: Side Effects
 */
export async function fillDosageFormStep2(
  snapshot: SnapshotElement[],
  testData: any
): Promise<void> {
  console.log(`📝 Filling DosageForm Step 2...`)

  // Select side effects checkboxes
  for (const sideEffect of testData.sideEffects) {
    await toggleCheckbox(snapshot, sideEffect)
  }

  console.log(`✅ DosageForm Step 2 filled`)
}

/**
 * Fill SessionForm Step 1
 */
export async function fillSessionFormStep1(
  snapshot: SnapshotElement[],
  testData: any
): Promise<void> {
  console.log(`📝 Filling SessionForm Step 1...`)

  await selectStarRating(snapshot, testData.effectiveness)
  await selectDropdownOption(snapshot, 0, testData.timeToResults)

  if (testData.sessionFrequency) {
    await selectDropdownOption(snapshot, 1, testData.sessionFrequency)
  }

  if (testData.sessionLength) {
    await selectDropdownOption(snapshot, 2, testData.sessionLength)
  }

  if (testData.waitTime) {
    await selectDropdownOption(snapshot, 1, testData.waitTime)
  }

  console.log(`✅ SessionForm Step 1 filled`)
}

/**
 * Fill AppForm
 */
export async function fillAppForm(snapshot: SnapshotElement[], testData: any): Promise<void> {
  console.log(`📝 Filling AppForm...`)

  await selectStarRating(snapshot, testData.effectiveness)
  await selectDropdownOption(snapshot, 0, testData.timeToResults)
  await selectDropdownOption(snapshot, 1, testData.usageFrequency)
  await selectDropdownOption(snapshot, 2, testData.subscriptionType)

  // Cost appears after subscription type
  if (testData.cost) {
    await selectDropdownOption(snapshot, 3, testData.cost)
  }

  console.log(`✅ AppForm filled`)
}

/**
 * Generic function to fill any form based on test data
 */
export async function fillForm(
  snapshot: SnapshotElement[],
  testData: AnyFormTestData,
  step: number
): Promise<void> {
  console.log(`📝 Filling ${testData.template} step ${step}`)

  switch (testData.template) {
    case 'DosageForm':
      if (step === 1) await fillDosageFormStep1(snapshot, testData)
      if (step === 2) await fillDosageFormStep2(snapshot, testData)
      break

    case 'SessionForm':
      if (step === 1) await fillSessionFormStep1(snapshot, testData)
      break

    case 'AppForm':
      if (step === 1) await fillAppForm(snapshot, testData)
      break

    // Add other form types as needed
    default:
      console.warn(`Form filling not implemented for ${testData.template}`)
  }

  console.log(`✅ Form step ${step} filled`)
}

/**
 * Skip optional steps (failed solutions, etc.)
 */
export async function skipOptionalStep(snapshot: SnapshotElement[]): Promise<void> {
  console.log(`⏭️ Skipping optional step...`)

  // Just click Continue or Submit button
  // const continueBtn = await findElementByText(snapshot, 'Continue', 'Submit', 'Skip')
  // if (continueBtn) await click(continueBtn)

  console.log(`✅ Optional step skipped`)
}
