import { chromium, FullConfig } from '@playwright/test'
import path from 'path'

const TEST_USER_EMAIL = 'test@wwfm-platform.com'
const TEST_USER_PASSWORD = 'TestPassword123!'

async function globalSetup(config: FullConfig) {
  console.log('🔐 Setting up authentication for tests...')
  
  try {
    // Launch browser to save auth state
    const browser = await chromium.launch()
    const page = await browser.newPage()
    
    // Get the baseURL from config (which now has auto-detection)
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000'
    console.log(`🌐 Using baseURL: ${baseURL}`)
    
    // Navigate to sign in page
    await page.goto(`${baseURL}/auth/signin`)
    
    // Wait for the form to be ready
    await page.waitForSelector('#email', { timeout: 10000 })
    
    // Fill in credentials using the correct selectors
    await page.fill('#email', TEST_USER_EMAIL)
    await page.fill('#password', TEST_USER_PASSWORD)
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Wait for successful redirect
    try {
      await page.waitForURL(/\/(dashboard|goal|$)/, { timeout: 10000 })
      console.log('✅ Login successful')
    } catch (error) {
      // Check if we got an error message
      const errorElement = await page.$('.bg-red-100')
      if (errorElement) {
        const errorText = await errorElement.textContent()
        console.error('❌ Login failed with error:', errorText)
        
        // If user doesn't exist, provide instructions
        if (errorText?.includes('Invalid login credentials')) {
          console.log('\n📝 Please create a test user in Supabase Dashboard:')
          console.log('   Email:', TEST_USER_EMAIL)
          console.log('   Password:', TEST_USER_PASSWORD)
          console.log('   Make sure to confirm the email address')
        }
      }
      throw new Error('Failed to sign in test user')
    }
    
    // Save authentication state
    const authFile = path.join(__dirname, 'auth.json')
    await page.context().storageState({ path: authFile })
    
    await browser.close()
    
    console.log('✅ Authentication state saved successfully')
    console.log(`   Test user: ${TEST_USER_EMAIL}`)
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  }
}

export default globalSetup
