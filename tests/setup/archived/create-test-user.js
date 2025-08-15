// Script to create a test user for form testing
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')

// Load test environment
dotenv.config({ path: path.resolve(__dirname, '../../.env.test.local') })

const TEST_USER_EMAIL = 'test@wwfm-platform.com'
const TEST_USER_PASSWORD = 'TestPassword123!'

async function setupTestUser() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
  
  console.log('🔧 Setting up test user...')
  
  try {
    // First, try to sign in to see if user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    })
    
    if (signInData?.user) {
      console.log('✅ Test user already exists:', TEST_USER_EMAIL)
      return { email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }
    }
    
    // If sign in failed, try to create the user
    console.log('Creating new test user...')
    
    // Use admin API to create user with confirmed email
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: 'Test User',
        is_test_user: true
      }
    })
    
    if (createError) {
      // If user already exists but password is different, update it
      if (createError.message?.includes('already exists')) {
        console.log('User exists, updating password...')
        const { data: users } = await supabase.auth.admin.listUsers()
        const existingUser = users?.users?.find(u => u.email === TEST_USER_EMAIL)
        
        if (existingUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: TEST_USER_PASSWORD }
          )
          
          if (updateError) {
            throw updateError
          }
          
          console.log('✅ Updated test user password')
          return { email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }
        }
      }
      throw createError
    }
    
    console.log('✅ Created test user:', TEST_USER_EMAIL)
    return { email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }
    
  } catch (error) {
    console.error('❌ Failed to setup test user:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  setupTestUser()
    .then(() => {
      console.log('\n📝 Test User Credentials:')
      console.log(`Email: ${TEST_USER_EMAIL}`)
      console.log(`Password: ${TEST_USER_PASSWORD}`)
      console.log('\nYou can now run: npm run test:forms')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Setup failed:', error)
      process.exit(1)
    })
}

module.exports = { setupTestUser, TEST_USER_EMAIL, TEST_USER_PASSWORD }
