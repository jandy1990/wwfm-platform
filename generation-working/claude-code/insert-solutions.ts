import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Solution {
  index: number;
  title: string;
  description: string;
  solution_category: string;
  avg_effectiveness: number;
  aggregated_fields: any;
}

interface FinalOutput {
  goal_id: string;
  goal_title: string;
  solutions: Solution[];
}

async function insertSolutions() {
  console.log('Loading final-output.json...');

  const filePath = path.join(__dirname, 'final-output.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const data: FinalOutput = JSON.parse(fileContent);

  console.log(`\nGoal: ${data.goal_title}`);
  console.log(`Goal ID: ${data.goal_id}`);
  console.log(`Solutions to insert: ${data.solutions.length}\n`);

  const results = {
    inserted: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (const solution of data.solutions) {
    try {
      console.log(`[${solution.index}/${data.solutions.length}] Inserting: ${solution.title}`);

      // Step 1: Insert solution
      const { data: solutionData, error: solutionError } = await supabase
        .from('solutions')
        .insert({
          title: solution.title,
          description: solution.description,
          solution_category: solution.solution_category,
          is_approved: true
        })
        .select('id')
        .single();

      if (solutionError) {
        throw new Error(`Solution insert failed: ${solutionError.message}`);
      }

      const solutionId = solutionData.id;
      console.log(`  ✓ Solution ID: ${solutionId}`);

      // Step 2: Insert solution variant
      const { data: variantData, error: variantError } = await supabase
        .from('solution_variants')
        .insert({
          solution_id: solutionId,
          variant_name: 'Standard'
        })
        .select('id')
        .single();

      if (variantError) {
        throw new Error(`Variant insert failed: ${variantError.message}`);
      }

      const variantId = variantData.id;
      console.log(`  ✓ Variant ID: ${variantId}`);

      // Step 3: Insert goal implementation link
      const { error: linkError } = await supabase
        .from('goal_implementation_links')
        .insert({
          goal_id: data.goal_id,
          implementation_id: variantId,
          avg_effectiveness: solution.avg_effectiveness,
          aggregated_fields: solution.aggregated_fields
        });

      if (linkError) {
        throw new Error(`Link insert failed: ${linkError.message}`);
      }

      console.log(`  ✓ Link created\n`);
      results.inserted++;

    } catch (error) {
      const errorMsg = `Failed to insert ${solution.title}: ${error}`;
      console.error(`  ✗ ${errorMsg}\n`);
      results.failed++;
      results.errors.push(errorMsg);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('INSERTION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Successfully inserted: ${results.inserted}`);
  console.log(`✗ Failed: ${results.failed}`);
  console.log(`Total: ${data.solutions.length}`);

  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(err => console.log(`  - ${err}`));
  }

  // Validation query
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION');
  console.log('='.repeat(60));

  const { count, error: countError } = await supabase
    .from('goal_implementation_links')
    .select('*', { count: 'exact', head: true })
    .eq('goal_id', data.goal_id);

  if (countError) {
    console.error(`Validation query failed: ${countError.message}`);
  } else {
    console.log(`Solutions in database for goal: ${count}`);
    console.log(`Expected: ${data.solutions.length}`);
    console.log(`Match: ${count === data.solutions.length ? '✓ YES' : '✗ NO'}`);
  }

  return results;
}

// Run the insertion
insertSolutions()
  .then(results => {
    if (results.failed === 0) {
      console.log('\n✓ All solutions inserted successfully!');
      process.exit(0);
    } else {
      console.error(`\n✗ Insertion completed with ${results.failed} failures`);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n✗ Fatal error:', error);
    process.exit(1);
  });
