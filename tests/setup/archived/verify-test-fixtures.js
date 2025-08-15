const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wqxkhxdbxdtpuvuvgirx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGtoeGRieGR0cHV2dXZnaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjgzMTUsImV4cCI6MjA2MzEwNDMxNX0.eBP6_TUB4Qa9KwPvEnUxrp7e7AGtOA3_Zs3CxaObPTo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyAndApproveTestFixtures() {
  console.log('🔍 Verifying Test Fixtures...\n');
  
  try {
    // 1. Check all test fixtures
    const { data: fixtures, error: fetchError } = await supabase
      .from('solutions')
      .select('id, title, solution_category, is_approved, source_type')
      .eq('source_type', 'test_fixture')
      .order('solution_category');
    
    if (fetchError) {
      console.error('❌ Error fetching test fixtures:', fetchError);
      return;
    }
    
    console.log(`Found ${fixtures.length} test fixtures\n`);
    
    // 2. Check approval status
    const unapproved = fixtures.filter(f => !f.is_approved);
    const approved = fixtures.filter(f => f.is_approved);
    
    console.log(`✅ Approved: ${approved.length}`);
    console.log(`❌ Unapproved: ${unapproved.length}\n`);
    
    // 3. Display SQL to approve if needed
    if (unapproved.length > 0) {
      console.log('⚠️  Some fixtures need approval.');
      console.log('Run this SQL in Supabase SQL Editor:\n');
      console.log('UPDATE solutions');
      console.log('SET is_approved = true');
      console.log('WHERE source_type = \'test_fixture\';\n');
      
      console.log('Unapproved fixtures:');
      unapproved.forEach(f => {
        console.log(`  - ${f.title} (${f.solution_category})`);
      });
    }
    
    // 4. Final status
    console.log('\n' + '='.repeat(50));
    if (approved.length === fixtures.length) {
      console.log('✅ ALL TEST FIXTURES ARE APPROVED AND READY!');
      console.log('You can now run: npm run test:forms');
    } else {
      console.log('⚠️  Some fixtures need approval. See SQL above.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

verifyAndApproveTestFixtures();