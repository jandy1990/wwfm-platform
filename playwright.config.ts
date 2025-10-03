import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test.local') })

// Determine port from environment or use defaults
const defaultPort = 3001
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || `http://localhost:${defaultPort}`

// Extract port from baseURL if provided
let port = defaultPort
if (process.env.PLAYWRIGHT_TEST_BASE_URL) {
  const match = process.env.PLAYWRIGHT_TEST_BASE_URL.match(/:(\d+)/)
  if (match) {
    port = parseInt(match[1])
  }
}

const shouldStartWebServer = process.env.PLAYWRIGHT_SKIP_WEB_SERVER !== '1'

const webServerEnvKeys = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'TEST_GOAL_ID',
  'SUPABASE_DB_PASSWORD',
  'NODE_ENV',
  'NEXT_DISABLE_FAST_REFRESH'
] as const

const webServerEnv = webServerEnvKeys.reduce<Record<string, string>>((acc, key) => {
  const value = process.env[key]
  if (value !== undefined) {
    acc[key] = value
  }
  return acc
}, {})

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,  // Disabled for pre-launch to avoid data conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,  // Run tests sequentially to avoid "already rated" errors
  reporter: 'html',
  timeout: 90000,  // 90 seconds per test (increased for reliability)
  
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
  
  webServer: shouldStartWebServer
    ? {
        command: 'npm run dev',
        port,
        timeout: 5 * 60 * 1000, // allow up to 5 minutes for first boot after restore
        reuseExistingServer: !process.env.CI,
        env: {
          ...process.env,
          ...webServerEnv,
          NEXT_DISABLE_FAST_REFRESH: process.env.NEXT_DISABLE_FAST_REFRESH ?? '1'
        }
      }
    : undefined,
})
