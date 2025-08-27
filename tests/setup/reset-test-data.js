#!/usr/bin/env node

/**
 * Reset Test Data
 * Cleans all test data while preserving fixtures
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const TEST_GOAL_ID = process.env.TEST_GOAL_ID || '56e2801e-0d78-4abd-a795-869e5b780ae7';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetTestData() {
  console.log('🧹 Resetting all test data...\n');
  
  try {
    // 1. Get all test fixture solution IDs
    console.log('1. Finding test fixtures...');
    const { data: fixtures, error: fixtureError } = await supabase
      .from('solutions')
      .select('id, title')
      .eq('source_type', 'test_fixture')
      .like('title', '%(Test)%');
    
    if (fixtureError) throw fixtureError;
    console.log(`   Found ${fixtures?.length || 0} test fixtures`);
    
    if (!fixtures || fixtures.length === 0) {
      console.log('   ⚠️  No test fixtures found - nothing to clean');
      return;
    }
    
    // 2. Get all variant IDs for test fixtures
    const solutionIds = fixtures.map(f => f.id);
    const { data: variants, error: variantError } = await supabase
      .from('solution_variants')
      .select('id')
      .in('solution_id', solutionIds);
    
    if (variantError) throw variantError;
    const variantIds = variants?.map(v => v.id) || [];
    console.log(`   Found ${variantIds.length} variants`);
    
    // 3. Clear ratings
    console.log('\n2. Clearing ratings...');
    const { count: ratingCount, error: ratingError } = await supabase
      .from('ratings')
      .delete()
      .eq('goal_id', TEST_GOAL_ID)
      .in('implementation_id', variantIds);
    
    if (ratingError) {
      console.log('   ⚠️  Error clearing ratings:', ratingError.message);
    } else {
      console.log(`   ✅ Cleared ${ratingCount || 0} ratings`);
    }
    
    // 4. Clear/reset goal_implementation_links
    console.log('\n3. Resetting goal_implementation_links...');
    const { count: linkCount, error: linkError } = await supabase
      .from('goal_implementation_links')
      .delete()
      .eq('goal_id', TEST_GOAL_ID)
      .in('implementation_id', variantIds);
    
    if (linkError) {
      console.log('   ⚠️  Error resetting links:', linkError.message);
    } else {
      console.log(`   ✅ Reset ${linkCount || 0} implementation links`);
    }
    
    // 5. Clear any orphaned data
    console.log('\n4. Cleaning orphaned data...');
    
    // Clear any ratings without valid implementation_id
    const { count: orphanCount } = await supabase
      .from('ratings')
      .delete()
      .eq('goal_id', TEST_GOAL_ID)
      .is('implementation_id', null);
    
    if (orphanCount > 0) {
      console.log(`   ✅ Cleared ${orphanCount} orphaned ratings`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ Test data reset complete!');
    console.log('\nSummary:');
    console.log(`  • Preserved: ${fixtures.length} test fixtures`);
    console.log(`  • Cleared: ${ratingCount || 0} ratings`);
    console.log(`  • Reset: ${linkCount || 0} implementation links`);
    console.log(`  • Removed: ${orphanCount || 0} orphaned records`);
    console.log('\nYour test environment is clean and ready for testing!');
    
  } catch (error) {
    console.error('\n❌ Reset failed:', error.message);
    process.exit(1);
  }
}

// Run the reset
resetTestData();