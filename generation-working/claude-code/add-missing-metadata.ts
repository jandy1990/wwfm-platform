import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Add _metadata field to all solutions missing it
 * This is required for the frontend to display field distributions
 */
async function addMissingMetadata() {
  console.log('='.repeat(60));
  console.log('ADD MISSING _METADATA TO SOLUTIONS');
  console.log('='.repeat(60));

  // Get all solutions missing _metadata
  const { data: solutions, error: fetchError } = await supabase
    .from('goal_implementation_links')
    .select(`
      implementation_id,
      goal_id,
      aggregated_fields,
      goals!inner(title),
      solution_variants!inner(
        solutions!inner(title, solution_category)
      )
    `)
    .eq('data_display_mode', 'ai')
    .is('aggregated_fields->_metadata', null);

  if (fetchError) {
    console.error('Error fetching solutions:', fetchError);
    process.exit(1);
  }

  if (!solutions || solutions.length === 0) {
    console.log('✓ No solutions missing _metadata!');
    process.exit(0);
  }

  console.log(`Found ${solutions.length} solutions missing _metadata\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const solution of solutions) {
    const goalTitle = (solution.goals as any).title;
    const solutionTitle = (solution.solution_variants as any).solutions.title;
    const solutionCategory = (solution.solution_variants as any).solutions.solution_category;

    console.log(`[${updated + skipped + errors + 1}/${solutions.length}] ${solutionTitle}`);
    console.log(`  Goal: ${goalTitle}`);
    console.log(`  Category: ${solutionCategory}`);

    // Check if aggregated_fields has actual data
    const fieldKeys = Object.keys(solution.aggregated_fields || {}).filter(k => k !== '_metadata');
    if (fieldKeys.length === 0) {
      console.log(`  ⚠ No field data, skipping...`);
      skipped++;
      continue;
    }

    // Create metadata object
    const metadata = {
      confidence: "high",
      ai_enhanced: true,
      data_source: "ai_training_data",
      target_goal: goalTitle,
      generated_at: new Date().toISOString(),
      user_ratings: 0,
      value_mapped: true,
      mapping_version: "field-generator-v3",
      source_solution: solutionTitle
    };

    // Add metadata to existing aggregated_fields
    const updatedFields = {
      ...solution.aggregated_fields,
      _metadata: metadata
    };

    // Update database
    const { error: updateError } = await supabase
      .from('goal_implementation_links')
      .update({
        aggregated_fields: updatedFields
      })
      .eq('goal_id', solution.goal_id)
      .eq('implementation_id', solution.implementation_id);

    if (updateError) {
      console.log(`  ✗ Error: ${updateError.message}`);
      errors++;
    } else {
      console.log(`  ✓ Added _metadata`);
      updated++;
    }

    console.log('');
  }

  // Summary
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Updated: ${updated} solutions`);
  console.log(`⚠ Skipped: ${skipped} solutions`);
  console.log(`✗ Errors: ${errors} solutions`);
  console.log('='.repeat(60));
}

addMissingMetadata()
  .then(() => {
    console.log('\n✓ Complete - all solutions should now display on frontend');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Fatal error:', error);
    process.exit(1);
  });
