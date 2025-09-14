#!/bin/bash

# This script sets up Playwright for browser testing in the WWFM project

echo "🎭 Setting up Playwright for browser testing..."

# Install Playwright
echo "Installing Playwright..."
npm install -D @playwright/test

# Install browsers
echo "Installing browsers for testing..."
npx playwright install

# Create test directory
echo "Creating e2e test directory..."
mkdir -p e2e

# Create the goal page test
cat > e2e/goal-page.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test.describe('Goal Page Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a goal page
    await page.goto('http://localhost:3000/goal/reduce-anxiety');
    await page.waitForLoadState('networkidle');
  });

  test('solutions should appear above the fold', async ({ page }) => {
    // Check if solution cards are visible in viewport
    const firstSolution = page.locator('.solution-card').first();
    await expect(firstSolution).toBeVisible();
    
    // Check if it's above the fold (within first 700px)
    const box = await firstSolution.boundingBox();
    expect(box?.y).toBeLessThan(700);
    
    console.log(`✅ First solution appears at ${box?.y}px from top`);
  });

  test('wisdom section should be compact', async ({ page }) => {
    // Check if wisdom section exists and is compact
    const wisdomSection = page.locator('[data-testid="goal-wisdom"], .goal-wisdom, [class*="wisdom"]').first();
    
    if (await wisdomSection.count() > 0) {
      const box = await wisdomSection.boundingBox();
      // Wisdom section should be less than 200px tall for "compact"
      expect(box?.height).toBeLessThan(200);
      console.log(`✅ Wisdom section height: ${box?.height}px`);
    }
  });

  test('no duplicate solution count text', async ({ page }) => {
    // Find all text containing "X solutions"
    const solutionCounts = await page.locator('text=/\\d+ solutions?/i').all();
    
    // Should only appear once
    expect(solutionCounts.length).toBeLessThanOrEqual(1);
    console.log(`✅ Solution count appears ${solutionCounts.length} time(s)`);
  });

  test('people also worked on should be at bottom', async ({ page }) => {
    // Find "People also worked on" section
    const relatedSection = page.locator('text=/people also worked on/i').first();
    
    if (await relatedSection.count() > 0) {
      const relatedBox = await relatedSection.boundingBox();
      
      // Find last solution card
      const lastSolution = page.locator('.solution-card').last();
      const solutionBox = await lastSolution.boundingBox();
      
      // Related section should be below solutions
      expect(relatedBox?.y).toBeGreaterThan(solutionBox?.y || 0);
      console.log(`✅ Related section is below solutions`);
    }
  });

  test('screenshot goal page for review', async ({ page }) => {
    await page.screenshot({ 
      path: 'e2e/screenshots/goal-page.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved to e2e/screenshots/goal-page.png');
  });
});
EOF

# Create Playwright config
cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
EOF

echo "✅ Playwright setup complete!"
echo ""
echo "To run the tests:"
echo "  npx playwright test"
echo ""
echo "To run with UI:"
echo "  npx playwright test --ui"
echo ""
echo "To see the report after running tests:"
echo "  npx playwright show-report"
