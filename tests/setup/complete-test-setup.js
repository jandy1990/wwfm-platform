#!/usr/bin/env node

/**
 * Complete Test Setup - All-in-One
 * This single script handles all test setup requirements
 */

const dotenv = require('dotenv');

// Load environment variables for disposable/local Supabase first, then fall back to the default dev file.
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.test.local', override: true });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Please ensure .env.test.local (or .env.local) provides:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('   - SUPABASE_SERVICE_KEY (for test setup only)');
  process.exit(1);
}

// Admin client - bypasses all RLS policies (use ONLY for setup/teardown)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Regular client - respects RLS policies (use for user operations)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test configuration
const TEST_USER_EMAIL = 'test@wwfm-platform.com';
const TEST_USER_PASSWORD = 'TestPassword123!';
const TEST_GOAL_ID = '56e2801e-0d78-4abd-a795-869e5b780ae7';

// Test fixtures data - MUST match test-solutions.ts exactly!
const TEST_FIXTURES = [
  // Apps & Software
  { title: 'Headspace (Test)', category: 'apps_software', variant: 'Standard' },
  
  // Dosage categories (need specific variants)
  { title: 'Prozac (Test)', category: 'medications', variant: '20mg tablet' },
  { title: 'Vitamin D (Test)', category: 'supplements_vitamins', variant: '1000 IU capsule' },
  { title: 'Lavender Oil (Test)', category: 'natural_remedies', variant: '10ml bottle' },
  { title: 'Retinol Cream (Test)', category: 'beauty_skincare', variant: '30ml tube' },
  
  // Practice categories
  { title: 'Running (Test)', category: 'exercise_movement', variant: 'Standard' },
  { title: 'Mindfulness Meditation (Test)', category: 'meditation_mindfulness', variant: 'Standard' },
  { title: 'Morning Routine (Test)', category: 'habits_routines', variant: 'Standard' },
  
  // Session categories
  { title: 'CBT Therapy (Test)', category: 'therapists_counselors', variant: 'Standard' },
  { title: 'Psychiatrist (Test)', category: 'doctors_specialists', variant: 'Standard' },
  { title: 'Life Coach (Test)', category: 'coaches_mentors', variant: 'Standard' },
  { title: 'Acupuncture (Test)', category: 'alternative_practitioners', variant: 'Standard' },
  { title: 'Financial Advisor (Test)', category: 'professional_services', variant: 'Standard' },
  { title: 'Physical Therapy (Test)', category: 'medical_procedures', variant: 'Standard' },
  { title: 'Crisis Hotline (Test)', category: 'crisis_resources', variant: 'Standard' },
  
  // Purchase categories
  { title: 'Fitbit (Test)', category: 'products_devices', variant: 'Standard' },
  { title: 'Cognitive Therapy Book (Test)', category: 'books_courses', variant: 'Standard' },
  
  // Community categories
  { title: 'Anxiety Support Group (Test)', category: 'support_groups', variant: 'Standard' },
  { title: 'Running Club (Test)', category: 'groups_communities', variant: 'Standard' },
  
  // Lifestyle categories
  { title: 'Mediterranean Diet (Test)', category: 'diet_nutrition', variant: 'Standard' },
  { title: 'Sleep Hygiene (Test)', category: 'sleep', variant: 'Standard' },
  
  // Financial category
  { title: 'High Yield Savings (Test)', category: 'financial_products', variant: 'Standard' },
  
  // Hobby category
  { title: 'Painting (Test)', category: 'hobbies_activities', variant: 'Standard' }
];

// Main setup function
async function runCompleteSetup() {
  console.log('🚀 WWFM Complete Test Setup\n');
  
  let success = true;
  
  // Step 1: Check/Create Test User
  console.log('📋 Step 1: Checking test user...');
  const userExists = await checkTestUser();
  if (!userExists) {
    console.log('   Creating test user...');
    success = await createTestUser() && success;
  } else {
    console.log('   ✅ Test user exists');
  }
  
  // Step 2: Clean up old ratings
  console.log('\n📋 Step 2: Cleaning up old test ratings...');
  await cleanupTestRatings();
  
  // Step 3: Setup test fixtures
  console.log('\n📋 Step 3: Setting up test fixtures...');
  success = await setupTestFixtures() && success;
  
  // Step 4: Verify setup
  console.log('\n📋 Step 4: Verifying setup...');
  success = await verifySetup() && success;
  
  // Final report
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('\n✅ Test setup complete! You can now run tests with:');
    console.log('   npm run test:forms');
    console.log('\n📝 Other useful commands:');
    console.log('   npm run test:forms:ui       # Interactive UI mode');
    console.log('   npm run test:forms:headed   # See browser while testing');
    console.log('   npm run test:forms:debug    # Debug mode');
  } else {
    console.log('\n❌ Setup completed with errors. Please fix issues before running tests.');
    process.exit(1);
  }
}

// Check if test user exists
async function checkTestUser() {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });
    
    if (data?.user) {
      await supabase.auth.signOut();
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// Create test user
async function createTestUser() {
  try {
    console.log(`   Creating user: ${TEST_USER_EMAIL}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      options: {
        data: { 
          full_name: 'Test User',
          email_confirmed: true 
        }
      }
    });
    
    if (error) {
      console.error('   ❌ Failed to create user:', error.message);
      return false;
    }
    
    console.log('   ✅ Test user created');
    console.log('   ⚠️  Note: You may need to confirm the email in Supabase Dashboard');
    return true;
  } catch (error) {
    console.error('   ❌ Error creating user:', error);
    return false;
  }
}

// Clean up test ratings
async function cleanupTestRatings() {
  try {
    // Use admin client to delete ALL test ratings
    const { error: deleteError } = await supabaseAdmin
      .from('ratings')
      .delete()
      .eq('goal_id', TEST_GOAL_ID);
    
    if (deleteError) {
      console.log('   ⚠️  Could not clean ratings:', deleteError.message);
    } else {
      console.log('   ✅ Cleaned up old ratings');
    }
  } catch (error) {
    console.log('   ⚠️  Cleanup skipped:', error.message);
  }
}

// Setup test fixtures
async function setupTestFixtures() {
  try {
    console.log('   🔐 Using admin privileges for test fixture setup...');
    
    // Get test user ID for created_by field
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });
    
    const userId = authData?.user?.id || 'e22feb1a-e617-4c8d-9747-0fb958068e1d';
    
    // Clean up ALL existing test fixtures using admin client
    console.log('   🧹 Cleaning up ALL existing test fixtures...');
    
    // Delete all test-related goal links
    await supabaseAdmin
      .from('goal_implementation_links')
      .delete()
      .eq('goal_id', TEST_GOAL_ID);
    
    // Find and delete all test fixtures
    const { data: existingFixtures } = await supabaseAdmin
      .from('solutions')
      .select('id')
      .like('title', '%(Test)%');
    
    if (existingFixtures && existingFixtures.length > 0) {
      const fixtureIds = existingFixtures.map(f => f.id);
      
      // Delete all variants for test fixtures
      await supabaseAdmin
        .from('solution_variants')
        .delete()
        .in('solution_id', fixtureIds);
      
      // Delete all test fixtures
      await supabaseAdmin
        .from('solutions')
        .delete()
        .in('id', fixtureIds);
      
      console.log(`   ✅ Cleaned up ${existingFixtures.length} test fixtures`);
    }
    
    console.log('   Creating test fixtures...');
    
    // Create each fixture using admin client
    for (const fixture of TEST_FIXTURES) {
      // Create solution with admin client (no RLS restrictions)
      const { data: solution, error: createError } = await supabaseAdmin
        .from('solutions')
        .insert({
          title: fixture.title,
          solution_category: fixture.category,
          source_type: 'test_fixture',
          is_approved: true,
          created_by: userId
        })
        .select()
        .single();
      
      if (createError) {
        console.error(`   ❌ Failed to create ${fixture.title}:`, createError.message);
        continue;
      }
      
      // Create variant with admin client
      const { data: variant, error: variantError } = await supabaseAdmin
        .from('solution_variants')
        .insert({
          solution_id: solution.id,
          variant_name: fixture.variant,
          is_default: true
        })
        .select()
        .single();
      
      if (variantError) {
        console.error(`   ❌ Failed to create variant for ${fixture.title}:`, variantError.message);
        continue;
      }
      
      // Create link to test goal with admin client
      const { error: linkError } = await supabaseAdmin
        .from('goal_implementation_links')
        .insert({
          goal_id: TEST_GOAL_ID,
          implementation_id: variant.id
        });
      
      if (linkError) {
        console.error(`   ❌ Failed to link ${fixture.title} to goal:`, linkError.message);
      }
    }
    
    console.log('   ✅ Test fixtures created');
    
    // Final cleanup: Delete ALL ratings to ensure clean slate (using admin)
    console.log('   🧹 Final cleanup: removing all test ratings...');
    try {
      const { error: cleanupError } = await supabaseAdmin
        .from('ratings')
        .delete()
        .eq('goal_id', TEST_GOAL_ID);
      
      if (!cleanupError) {
        console.log('   ✅ All test ratings cleared');
      }
    } catch (e) {
      console.log('   ⚠️  Could not clear ratings, but continuing...');
    }
    
    // Sign out test user
    await supabase.auth.signOut();
    
    return true;
  } catch (error) {
    console.error('   ❌ Error setting up fixtures:', error);
    // Make sure to sign out even on error
    await supabase.auth.signOut();
    return false;
  }
}

// Verify setup
async function verifySetup() {
  try {
    // Check fixtures exist
    const { data: fixtures, error } = await supabase
      .from('solutions')
      .select('title, is_approved')
      .eq('source_type', 'test_fixture');
    
    if (error) {
      console.error('   ❌ Could not verify fixtures:', error.message);
      return false;
    }
    
    const expectedCount = TEST_FIXTURES.length;
    const actualCount = fixtures?.length || 0;
    
    if (actualCount < expectedCount) {
      console.error(`   ❌ Expected ${expectedCount} fixtures, found ${actualCount}`);
      return false;
    }
    
    // Check all are approved
    const unapproved = fixtures?.filter(f => !f.is_approved) || [];
    if (unapproved.length > 0) {
      console.error(`   ❌ ${unapproved.length} fixtures are not approved`);
      return false;
    }
    
    // Check goal links
    const { data: links, error: linkError } = await supabase
      .from('goal_implementation_links')
      .select('implementation_id')
      .eq('goal_id', TEST_GOAL_ID);
    
    if (linkError) {
      console.error('   ❌ Could not verify goal links:', linkError.message);
      return false;
    }
    
    if (!links || links.length === 0) {
      console.error('   ❌ No fixtures linked to test goal');
      return false;
    }
    
    console.log(`   ✅ All ${actualCount} test fixtures verified`);
    console.log(`   ✅ ${links.length} fixtures linked to test goal`);
    return true;
    
  } catch (error) {
    console.error('   ❌ Verification failed:', error);
    return false;
  }
}

// Run the setup
runCompleteSetup().catch(console.error);
