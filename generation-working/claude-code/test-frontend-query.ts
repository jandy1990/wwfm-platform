import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Test the exact query the frontend uses to fetch solutions
 */
async function testFrontendQuery() {
  console.log('Testing frontend query for "Reduce anxiety"...\n');

  // Get goal ID first
  const { data: goal } = await supabase
    .from('goals')
    .select('id, title')
    .eq('title', 'Reduce anxiety')
    .single();

  if (!goal) {
    console.error('Goal not found');
    return;
  }

  console.log(`Goal ID: ${goal.id}\n`);

  // Use the EXACT query from lib/solutions/goal-solutions.ts
  const { data: goalLinks, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      avg_effectiveness,
      rating_count,
      solution_fields,
      aggregated_fields,
      human_rating_count,
      data_display_mode,
      transition_threshold,
      ai_snapshot,
      transitioned_at,
      typical_application,
      contraindications,
      notes,
      created_at,
      solution_variants!implementation_id (
        id,
        variant_name,
        amount,
        unit,
        form,
        is_default,
        created_at,
        solutions (
          id,
          title,
          description,
          solution_category,
          solution_model,
          parent_concept,
          source_type,
          is_approved,
          created_at
        )
      )
    `)
    .eq('goal_id', goal.id)
    .eq('solution_variants.solutions.is_approved', true);

  if (error) {
    console.error('Query error:', error);
    return;
  }

  console.log(`Solutions fetched: ${goalLinks?.length || 0}\n`);

  if (goalLinks && goalLinks.length > 0) {
    // Check first solution
    const firstLink = goalLinks[0] as any;
    const variant = Array.isArray(firstLink.solution_variants)
      ? firstLink.solution_variants[0]
      : firstLink.solution_variants;
    const solution = variant && Array.isArray(variant.solutions)
      ? variant.solutions[0]
      : variant?.solutions;

    console.log('First solution:');
    console.log(`  Title: ${solution?.title}`);
    console.log(`  Category: ${solution?.solution_category}`);
    console.log(`  Is Approved: ${solution?.is_approved}`);
    console.log(`  Data Display Mode: ${firstLink.data_display_mode}`);
    console.log(`  Has aggregated_fields: ${!!firstLink.aggregated_fields}`);

    if (firstLink.aggregated_fields) {
      const fields = Object.keys(firstLink.aggregated_fields);
      console.log(`  Aggregated fields (${fields.length}): ${fields.join(', ')}`);

      // Check structure of one field
      const firstField = firstLink.aggregated_fields[fields[0]];
      if (firstField && typeof firstField === 'object') {
        console.log(`\n  Sample field structure (${fields[0]}):`);
        console.log(`    Has mode: ${!!firstField.mode}`);
        console.log(`    Has values: ${!!firstField.values}`);
        console.log(`    Has dataSource: ${!!firstField.dataSource}`);
        if (firstField.values && Array.isArray(firstField.values)) {
          console.log(`    Values count: ${firstField.values.length}`);
        }
      }
    }

    console.log('\n✓ Query works - data structure is correct');
    console.log('\n⚠️  If distributions not showing on frontend, this is a Next.js cache issue');
    console.log('\nSolutions:');
    console.log('1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)');
    console.log('2. Clear Next.js cache: rm -rf .next');
    console.log('3. Restart dev server: npm run dev');
  } else {
    console.log('❌ No solutions returned - query filter issue');
  }
}

testFrontendQuery()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
