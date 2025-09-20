const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.test.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkTestData() {
  console.log('\n=== Checking Test Data ===\n');
  
  // Check solutions
  const { data: solutions, error: solutionError } = await supabase
    .from('solutions')
    .select('id, title, solution_category')
    .eq('title', 'Anxiety Support Group (Test)')
    .order('created_at', { ascending: false });
  
  if (solutionError) {
    console.error('Error fetching solutions:', solutionError);
  } else {
    console.log(`Found ${solutions.length} solution(s) for "Anxiety Support Group (Test)":`);
    solutions.forEach(s => {
      console.log(`  - ID: ${s.id}, Category: ${s.solution_category}`);
    });
  }
  
  if (solutions && solutions.length > 0) {
    const solutionId = solutions[0].id;
    
    // Check variants
    const { data: variants } = await supabase
      .from('solution_variants')
      .select('id, variant_name, is_default')
      .eq('solution_id', solutionId);
    
    console.log(`\nFound ${variants?.length || 0} variant(s):`);
    variants?.forEach(v => {
      console.log(`  - ID: ${v.id}, Name: ${v.variant_name}, Default: ${v.is_default}`);
    });
    
    // Check ratings
    const { data: ratings } = await supabase
      .from('ratings')
      .select('id, user_id, goal_id, implementation_id, effectiveness')
      .eq('implementation_id', variants?.[0]?.id);
    
    console.log(`\nFound ${ratings?.length || 0} rating(s):`);
    ratings?.forEach(r => {
      console.log(`  - Goal: ${r.goal_id}, Effectiveness: ${r.effectiveness}`);
    });
    
    // Check goal_implementation_links
    const { data: links } = await supabase
      .from('goal_implementation_links')
      .select('id, goal_id, implementation_id, avg_effectiveness, rating_count')
      .eq('implementation_id', variants?.[0]?.id);
    
    console.log(`\nFound ${links?.length || 0} goal_implementation_link(s):`);
    links?.forEach(l => {
      console.log(`  - Goal: ${l.goal_id}, Avg: ${l.avg_effectiveness}, Count: ${l.rating_count}`);
    });
  }
  
  process.exit(0);
}

checkTestData().catch(console.error);