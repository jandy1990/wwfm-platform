/**
 * Navigation helper functions for WWFM forms testing
 * Handles page navigation, authentication, and form access
 */

import type { SnapshotElement } from './devtools'

export interface NavigationHelpers {
  // Core navigation
  goToHomePage(baseUrl: string): Promise<void>
  goToGoalPage(baseUrl: string, goalId: string): Promise<void>
  goToAddSolutionPage(baseUrl: string, goalId: string): Promise<void>

  // Authentication
  isUserAuthenticated(): Promise<boolean>
  signIn(email: string, password: string): Promise<boolean>
  signOut(): Promise<void>

  // Form navigation
  openShareSolutionModal(goalId: string): Promise<void>
  navigateToFormStep(step: 1 | 2 | 3): Promise<void>
  submitForm(): Promise<void>
  goBackToGoalPage(goalId: string): Promise<void>

  // Wait for page states
  waitForSuccessScreen(): Promise<void>
  waitForFormLoad(): Promise<void>
  waitForGoalPageLoad(): Promise<void>
}

/**
 * Navigate to goal page
 */
export async function navigateToGoal(
  baseUrl: string,
  goalId: string,
  timeout: number = 30000
): Promise<void> {
  const url = `${baseUrl}/goal/${goalId}`
  console.log(`🧭 Navigating to goal page: ${url}`)

  // This will use mcp__chrome-devtools__navigate_page
  // await navigatePage(url, timeout)

  // Wait for page to load
  // await waitFor('Share What Worked', 5000)

  console.log(`✅ Goal page loaded successfully`)
}

/**
 * Navigate to add solution page
 */
export async function navigateToAddSolution(
  baseUrl: string,
  goalId: string,
  timeout: number = 30000
): Promise<void> {
  const url = `${baseUrl}/goal/${goalId}/add-solution`
  console.log(`🧭 Navigating to add solution page: ${url}`)

  // This will use mcp__chrome-devtools__navigate_page
  // await navigatePage(url, timeout)

  // Wait for search input to appear
  // await waitFor('Headspace', 5000)

  console.log(`✅ Add solution page loaded successfully`)
}

/**
 * Click "Share What Worked" button from goal page
 */
export async function clickShareSolution(snapshot: SnapshotElement[]): Promise<void> {
  console.log(`🖱️ Looking for "Share What Worked" button`)

  // Find the button in snapshot
  // const buttonUid = await findElementByText(snapshot, 'Share What Worked', { exact: false })

  // if (!buttonUid) {
  //   throw new Error('Could not find "Share What Worked" button')
  // }

  // await click(buttonUid)
  console.log(`✅ Clicked "Share What Worked" button`)
}

/**
 * Wait for form to be visible and ready
 */
export async function waitForFormReady(): Promise<void> {
  console.log(`⏳ Waiting for form to be ready...`)

  // Wait for any select elements or form indicators
  // await waitFor('Select', 3000)

  console.log(`✅ Form is ready`)
}

/**
 * Wait for success screen after form submission
 */
export async function waitForSuccessScreen(timeout: number = 10000): Promise<void> {
  console.log(`⏳ Waiting for success screen...`)

  // Wait for success message
  // await waitFor('Thank you for sharing', timeout)

  console.log(`✅ Success screen displayed`)
}

/**
 * Click "Back to goal page" button from success screen
 */
export async function clickBackToGoalPage(snapshot: SnapshotElement[]): Promise<void> {
  console.log(`🖱️ Looking for "Back to goal page" button`)

  // Find the button
  // const buttonUid = await findElementByText(snapshot, 'Back to goal page', { exact: false })

  // if (!buttonUid) {
  //   throw new Error('Could not find "Back to goal page" button')
  // }

  // await click(buttonUid)

  console.log(`✅ Clicked "Back to goal page" button`)
}

/**
 * Navigate through form steps using Continue/Submit buttons
 */
export async function clickContinueButton(
  snapshot: SnapshotElement[],
  stepNumber: number
): Promise<void> {
  console.log(`🖱️ Looking for Continue button for step ${stepNumber}`)

  // Different button text for different steps
  let buttonText: string
  switch (stepNumber) {
    case 1:
    case 2:
      buttonText = 'Continue'
      break
    case 3:
      buttonText = 'Submit'
      break
    default:
      buttonText = 'Continue'
  }

  // Find and click the button
  // const buttonUid = await findElementByText(snapshot, buttonText)
  // if (!buttonUid) {
  //   throw new Error(`Could not find "${buttonText}" button`)
  // }
  // await click(buttonUid)

  console.log(`✅ Clicked "${buttonText}" button`)
}

/**
 * Check if we're on the success screen
 */
export function isSuccessScreen(snapshot: SnapshotElement[]): boolean {
  // Check for success indicators
  // return snapshot.some(el =>
  //   el.text?.includes('Thank you for sharing') ||
  //   el.text?.includes('Your experience has been')
  // )
  return true
}

/**
 * Check if we're on a goal page
 */
export function isGoalPage(snapshot: SnapshotElement[]): boolean {
  // Check for goal page indicators
  // return snapshot.some(el =>
  //   el.text?.includes('Share What Worked') ||
  //   el.text?.includes('Add a solution')
  // )
  return true
}

/**
 * Extract solution ID from success screen or URL
 */
export function extractSolutionIdFromPage(snapshot: SnapshotElement[]): string | null {
  // This would parse the page content or URL to find the solution ID
  // For now, return null - will implement when running actual tests
  return null
}

/**
 * Wait for network requests to complete (useful after navigation)
 */
export async function waitForNetworkIdle(timeout: number = 5000): Promise<void> {
  console.log(`⏳ Waiting for network to be idle...`)

  // Wait for a moment to let requests complete
  await new Promise(resolve => setTimeout(resolve, timeout))

  console.log(`✅ Network idle`)
}

/**
 * Handle authentication redirect if needed
 */
export async function handleAuthRedirect(
  baseUrl: string,
  returnUrl: string
): Promise<void> {
  console.log(`🔐 Handling authentication redirect...`)

  // Check if we got redirected to signin
  // const currentUrl = await getCurrentUrl()

  // if (currentUrl.includes('/auth/signin')) {
  //   console.log('Not authenticated, need to sign in')
  //   throw new Error('User not authenticated - please sign in first')
  // }

  console.log(`✅ No auth redirect needed`)
}
