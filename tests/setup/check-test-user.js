const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')

// Load test environment
dotenv.config({ path: path.resolve(__dirname, '../../.env.test.local') })

async function checkTestUser() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
  
  console.log('Checking for test user...')
  
  try {
    // List all users and find test user
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    
    if (error) throw error
    
    const testUser = users.find(u => u.email === 'test@wwfm-platform.com')
    
    if (testUser) {
      console.log('✅ Test user exists!')
      console.log('User ID:', testUser.id)
      console.log('Email:', testUser.email)
      console.log('Created:', testUser.created_at)
      console.log('Confirmed:', testUser.email_confirmed_at ? 'Yes' : 'No')
    } else {
      console.log('❌ Test user not found')
      console.log('Total users in system:', users.length)
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkTestUser()
