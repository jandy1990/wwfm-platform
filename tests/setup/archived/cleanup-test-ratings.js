#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function cleanupTestRatings() {
  console.log('🧹 Cleaning up test user ratings...');
  
  try {
    // Get test user
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;
    
    const testUser = userData.users.find(u => u.email === 'test@wwfm-platform.com');
    if (!testUser) {
      console.log('Test user not found');
      return;
    }
    
    console.log(`Found test user: ${testUser.id}`);
    
    // Delete all ratings from test user
    const { data: deletedRatings, error: deleteError } = await supabase
      .from('user_solution_ratings')
      .delete()
      .eq('user_id', testUser.id)
      .select();
      
    if (deleteError) {
      console.error('Error deleting ratings:', deleteError);
      return;
    }
    
    console.log(`✅ Deleted ${deletedRatings?.length || 0} test user ratings`);
    
    // Also delete any test-generated solutions (not test fixtures)
    const { data: testSolutions, error: fetchError } = await supabase
      .from('solutions')
      .select('id, title')
      .eq('created_by', testUser.id)
      .not('source_type', 'eq', 'test_fixture');
      
    if (fetchError) {
      console.error('Error fetching test solutions:', fetchError);
      return;
    }
    
    if (testSolutions && testSolutions.length > 0) {
      console.log(`Found ${testSolutions.length} test-generated solutions to clean up`);
      
      for (const solution of testSolutions) {
        // Delete solution and all related data
        const { error: delError } = await supabase
          .from('solutions')
          .delete()
          .eq('id', solution.id);
          
        if (delError) {
          console.error(`Error deleting solution ${solution.title}:`, delError);
        } else {
          console.log(`  - Deleted: ${solution.title}`);
        }
      }
    }
    
    console.log('✅ Cleanup complete');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanupTestRatings();
}

module.exports = { cleanupTestRatings };