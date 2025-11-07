#!/usr/bin/env node
/**
 * Quick database connection test
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wqxkhxdbxdtpuvuvgirx.supabase.co';
const supabaseKey = 'sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const GOAL_ID = '56e2801e-0d78-4abd-a795-869e5b780ae7';

async function checkDatabase() {
  console.log('🔍 Checking database connection and existing solutions...\n');

  // Check existing solutions for this goal
  const { data: links, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      solution_id,
      solutions!inner (
        id,
        title,
        solution_category
      )
    `)
    .eq('goal_id', GOAL_ID);

  if (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }

  console.log(`✅ Connected successfully!`);
  console.log(`📊 Found ${links.length} existing solutions for "Reduce anxiety"\n`);

  if (links.length > 0) {
    console.log('Existing solutions by category:');
    const byCategory = {};
    links.forEach(link => {
      const cat = link.solutions.solution_category;
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
      });
  }

  console.log('\n✅ Ready to proceed with solution generation!');
}

checkDatabase().catch(console.error);
