/**
 * Playwright E2E Tests for SessionForm Cost Validation Fix #14
 *
 * Tests all 7 SessionForm categories to verify correct cost UI behavior:
 * - 4 per-session-only categories (NO radio buttons)
 * - 1 professional_services (Per-session/Monthly radio)
 * - 1 medical_procedures (Per-session/Monthly/Total 3-way radio)
 * - 1 crisis_resources (static dropdown, no radio)
 *
 * Run: npx playwright test chrome-devtools-testing/playwright/session-form-cost-validation.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

const GOAL_ID = '56e2801e-0d78-4abd-a795-869e5b780ae7';
const BASE_URL = 'http://localhost:3001';

interface SessionFormTestData {
  solutionName: string;
  category: string;
  effectiveness: number; // 1-5
  timeToResults: string;
  sessionFrequency?: string;
  sessionLength?: string;
  waitTime?: string;
  responseTime?: string;
  format?: string;
  specialty?: string;
  cost: string;
  insuranceCoverage?: string;
  expectedCostType: 'per-session-only' | 'per-session-monthly-radio' | '3-way-radio' | 'static';
}

const TEST_DATA: SessionFormTestData[] = [
  {
    solutionName: 'CBT Therapist (DevTools Test)',
    category: 'therapists_counselors',
    effectiveness: 5,
    timeToResults: '1-2 months',
    sessionFrequency: 'Weekly',
    sessionLength: '50-60 minutes',
    cost: '$100-150/session',
    insuranceCoverage: 'Partial coverage',
    expectedCostType: 'per-session-only'
  },
  {
    solutionName: 'Life Coach (DevTools Test)',
    category: 'coaches_mentors',
    effectiveness: 4,
    timeToResults: '1-2 months',
    sessionFrequency: 'Bi-weekly',
    sessionLength: '45-50 minutes',
    cost: '$100-150/session',
    expectedCostType: 'per-session-only'
  },
  {
    solutionName: 'Acupuncturist (DevTools Test)',
    category: 'alternative_practitioners',
    effectiveness: 4,
    timeToResults: '3-4 weeks',
    sessionFrequency: 'Weekly',
    sessionLength: '30-45 minutes',
    cost: '$50-100/session',
    expectedCostType: 'per-session-only'
  },
  {
    solutionName: 'Psychiatrist (DevTools Test)',
    category: 'doctors_specialists',
    effectiveness: 4,
    timeToResults: '1-2 months',
    sessionFrequency: 'Monthly',
    waitTime: '2-4 weeks',
    cost: '$150-250/session',
    insuranceCoverage: 'Partial coverage',
    expectedCostType: 'per-session-only'
  },
  {
    solutionName: 'Personal Trainer (DevTools Test)',
    category: 'professional_services',
    effectiveness: 5,
    timeToResults: '1-2 weeks',
    sessionFrequency: 'Twice weekly',
    specialty: 'Fitness training',
    cost: '$100-200/month',
    expectedCostType: 'per-session-monthly-radio'
  },
  {
    solutionName: 'Physical Therapy (DevTools Test)',
    category: 'medical_procedures',
    effectiveness: 4,
    timeToResults: '3-4 weeks',
    sessionFrequency: 'Weekly',
    waitTime: '1-2 weeks',
    cost: '$100-200/session',
    expectedCostType: '3-way-radio'
  },
  {
    solutionName: 'Crisis Hotline (DevTools Test)',
    category: 'crisis_resources',
    effectiveness: 5,
    timeToResults: 'Immediately',
    responseTime: 'Within minutes',
    format: 'Phone',
    cost: 'Free',
    expectedCostType: 'static'
  }
];

async function fillSolutionName(page: Page, name: string) {
  // Use React-friendly input filling
  await page.evaluate((solutionName) => {
    const input = document.getElementById('solution-name') as HTMLInputElement;
    if (!input) throw new Error('Solution name input not found');

    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    if (!descriptor?.set) throw new Error('Cannot set input value');

    descriptor.set.call(input, solutionName);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, name);
}

async function openContributeModal(page: Page) {
  await page.goto(`${BASE_URL}/goal/${GOAL_ID}`);
  await page.waitForLoadState('networkidle');

  // Click "Share What Worked" button
  const shareButton = page.locator('button', { hasText: 'Share What Worked' });
  await shareButton.click();

  // Wait for modal
  await page.waitForSelector('input#solution-name');
}

async function verifyCategory(page: Page, expectedCategory: string) {
  // Check if category was auto-detected (might be in a hidden field or display element)
  const categoryValue = await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'));
    const categorySelect = selects.find(s => s.name === 'category' || s.id === 'category');
    return categorySelect?.value || null;
  });

  if (categoryValue) {
    expect(categoryValue).toBe(expectedCategory);
  }
}

async function fillEffectiveness(page: Page, rating: number) {
  const effectivenessLabels = [
    '😞Not at all',
    '😕Slightly',
    '😐Moderate',
    '😊Very',
    '🤩Extremely'
  ];

  const button = page.locator('button', { hasText: effectivenessLabels[rating - 1] });
  await button.click();
}

async function verifyCostUI(page: Page, expectedType: string, screenshotPath: string) {
  // Take screenshot before verification
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const costRadioCount = await page.locator('input[type="radio"][name="cost_type"]').count();

  switch (expectedType) {
    case 'per-session-only':
      // NO radio buttons should be visible
      expect(costRadioCount).toBe(0);

      // Verify dropdown shows per-session options
      const costSelect = page.locator('select[name="cost"]');
      await expect(costSelect).toBeVisible();

      const options = await costSelect.locator('option').allTextContents();
      const hasPerSessionFormat = options.some(opt =>
        opt.includes('/session') || opt.includes('per session')
      );
      expect(hasPerSessionFormat).toBeTruthy();
      break;

    case 'per-session-monthly-radio':
      // Radio buttons SHOULD be visible (2 options)
      expect(costRadioCount).toBe(2);

      // Verify both radio options exist
      await expect(page.locator('input[type="radio"][value="per-session"]')).toBeVisible();
      await expect(page.locator('input[type="radio"][value="monthly"]')).toBeVisible();
      break;

    case '3-way-radio':
      // Radio buttons SHOULD be visible (3 options)
      expect(costRadioCount).toBe(3);

      // Verify all three radio options exist
      await expect(page.locator('input[type="radio"][value="per-session"]')).toBeVisible();
      await expect(page.locator('input[type="radio"][value="monthly"]')).toBeVisible();
      await expect(page.locator('input[type="radio"][value="total"]')).toBeVisible();
      break;

    case 'static':
      // NO radio buttons
      expect(costRadioCount).toBe(0);

      // Static dropdown with simple options (Free, etc.)
      const staticCostSelect = page.locator('select[name="cost"]');
      await expect(staticCostSelect).toBeVisible();
      break;

    default:
      throw new Error(`Unknown cost type: ${expectedType}`);
  }
}

test.describe('SessionForm Cost Validation Fix #14', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure authenticated
    // Note: This assumes auth cookies are already set or you need to login first
  });

  for (const testData of TEST_DATA) {
    test(`${testData.category}: ${testData.solutionName}`, async ({ page }) => {
      console.log(`\n🧪 Testing: ${testData.category}`);

      // Open contribute modal
      await openContributeModal(page);

      // Fill solution name
      await fillSolutionName(page, testData.solutionName);

      // Click Continue
      await page.click('button:has-text("Continue")');

      // Wait for Step 1 to load
      await page.waitForSelector('button:has-text("😞Not at all")', { timeout: 10000 });

      // Verify category (if auto-detected)
      await verifyCategory(page, testData.category);

      // Fill effectiveness
      await fillEffectiveness(page, testData.effectiveness);

      // Fill time to results
      await page.selectOption('select[name="time_to_results"]', testData.timeToResults);

      // Fill category-specific fields
      if (testData.sessionFrequency) {
        await page.selectOption('select[name="session_frequency"]', testData.sessionFrequency.toLowerCase());
      }

      if (testData.sessionLength) {
        await page.selectOption('select[name="session_length"]', testData.sessionLength);
      }

      if (testData.waitTime) {
        await page.selectOption('select[name="wait_time"]', testData.waitTime);
      }

      if (testData.responseTime) {
        await page.selectOption('select[name="response_time"]', testData.responseTime);
      }

      if (testData.format) {
        await page.selectOption('select[name="format"]', testData.format);
      }

      if (testData.specialty) {
        await page.fill('input[name="specialty"]', testData.specialty);
      }

      // CRITICAL: Verify cost UI
      const screenshotPath = `chrome-devtools-testing/screenshots/${testData.category}-cost-ui.png`;
      await verifyCostUI(page, testData.expectedCostType, screenshotPath);

      console.log(`✅ Cost UI verified: ${testData.expectedCostType}`);

      // Fill cost
      if (testData.expectedCostType === 'per-session-monthly-radio') {
        // Select radio first
        await page.click('input[type="radio"][value="monthly"]');
      } else if (testData.expectedCostType === '3-way-radio') {
        // Select radio first
        await page.click('input[type="radio"][value="per-session"]');
      }

      await page.selectOption('select[name="cost"]', testData.cost);

      // Fill insurance if applicable
      if (testData.insuranceCoverage) {
        await page.selectOption('select[name="insurance_coverage"]', testData.insuranceCoverage);
      }

      // Continue to Step 2
      await page.click('button:has-text("Continue")');

      // Skip challenges (Step 2)
      await page.waitForSelector('button:has-text("Continue")', { timeout: 5000 });
      await page.click('button:has-text("Continue")');

      // Submit (Step 3)
      await page.waitForSelector('button:has-text("Submit")', { timeout: 5000 });
      await page.click('button:has-text("Submit")');

      // Wait for success
      await page.waitForSelector('text=Success', { timeout: 60000 });

      console.log(`✅ ${testData.category} submission successful`);

      // Query database for verification
      // TODO: Add Supabase query to verify rating_id and solution_id

      await page.screenshot({
        path: `chrome-devtools-testing/screenshots/${testData.category}-success.png`
      });
    });
  }
});

test.describe('Cost Dropdown Options Verification', () => {
  test('per-session-only categories show correct dropdown values', async ({ page }) => {
    await openContributeModal(page);
    await fillSolutionName(page, 'CBT Therapist (DevTools Test)');
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('button:has-text("😞Not at all")');

    // Fill required fields to enable cost dropdown
    await fillEffectiveness(page, 5);
    await page.selectOption('select[name="time_to_results"]', '1-2 months');

    // Check cost dropdown options
    const costOptions = await page.locator('select[name="cost"] option').allTextContents();

    // Should include per-session formatted options
    expect(costOptions).toContain('$50-100/session');
    expect(costOptions).toContain('$100-150/session');
    expect(costOptions).toContain('$150-250/session');
    expect(costOptions).toContain('$250-500/session');
    expect(costOptions).toContain('$500+/session');

    // Should NOT include monthly options
    expect(costOptions.every(opt => !opt.includes('/month'))).toBeTruthy();
  });
});
