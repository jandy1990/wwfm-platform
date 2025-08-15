import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test.local') })

// Determine port from environment or use defaults
const defaultPort = 3000
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || `http://localhost:${defaultPort}`

// Extract port from baseURL if provided
let port = defaultPort
if (process.env.PLAYWRIGHT_TEST_BASE_URL) {
  const match = process.env.PLAYWRIGHT_TEST_BASE_URL.match(/:(\d+)/)
  if (match) {
    port = parseInt(match[1])
  }
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,  // Disabled for pre-launch to avoid data conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,  // Run tests sequentially to avoid "already rated" errors
  reporter: 'html',
  timeout: 60000,  // 60 seconds per test (up from default 30s)
  
  // Global setup for authentication
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  
  use: {
    baseURL,
    trace: 'on-first-retry',
    // Use saved auth state
    storageState: 'tests/setup/auth.json',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    port,
    timeout: 120 * 1000, // 2 minutes
    reuseExistingServer: !process.env.CI,
  },
})
