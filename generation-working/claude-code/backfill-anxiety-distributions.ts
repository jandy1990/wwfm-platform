import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ANXIETY_GOAL_ID = '56e2801e-0d78-4abd-a795-869e5b780ae7';

interface Solution {
  index: number;
  title: string;
  solution_category: string;
  effectiveness?: number;
  avg_effectiveness?: number;
  [key: string]: any;
}

/**
 * Transform solution object into aggregated_fields format
 */
function transformToAggregatedFields(solution: Solution): any {
  const {
    index,
    title,
    solution_category,
    effectiveness,
    avg_effectiveness,
    ...fieldData
  } = solution;

  return fieldData;
}

/**
 * Find implementation_id for a solution title
 */
async function findImplementationId(solutionTitle: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      implementation_id,
      solution_variants!inner(
        solutions!inner(
          title
        )
      )
    `)
    .eq('goal_id', ANXIETY_GOAL_ID)
    .limit(50);

  if (error) {
    console.error('Error querying links:', error);
    return null;
  }

  // Find matching title (case-insensitive)
  for (const row of data) {
    const rowTitle = (row.solution_variants as any).solutions.title;
    if (rowTitle.toLowerCase() === solutionTitle.toLowerCase()) {
      return row.implementation_id;
    }
  }

  return null;
}

/**
 * Update aggregated_fields for a solution
 */
async function updateAggregatedFields(
  implementationId: string,
  aggregatedFields: any,
  solutionTitle: string
): Promise<boolean> {

  const { error } = await supabase
    .from('goal_implementation_links')
    .update({
      aggregated_fields: aggregatedFields
    })
    .eq('goal_id', ANXIETY_GOAL_ID)
    .eq('implementation_id', implementationId);

  if (error) {
    console.error(`  ✗ Error updating ${solutionTitle}:`, error.message);
    return false;
  }

  return true;
}

/**
 * Main backfill function
 */
async function backfillAnxietyDistributions(): Promise<void> {
  console.log('='.repeat(60));
  console.log('BACKFILL ANXIETY SOLUTION DISTRIBUTIONS');
  console.log('='.repeat(60));

  // Read final-output.json
  const finalOutputPath = path.join(__dirname, '../archive/wave1-goal3-reduce-anxiety/final-output.json');

  if (!fs.existsSync(finalOutputPath)) {
    console.error('✗ final-output.json not found at:', finalOutputPath);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(finalOutputPath, 'utf-8');
  const finalOutput = JSON.parse(fileContent);

  console.log(`Goal: ${finalOutput.goal_title || 'Reduce anxiety'}`);
  console.log(`Solutions in JSON: ${finalOutput.solutions.length}\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  // Process each solution
  for (const solution of finalOutput.solutions) {
    console.log(`[${solution.index}] ${solution.title}`);

    try {
      // Find implementation_id
      const implementationId = await findImplementationId(solution.title);

      if (!implementationId) {
        console.log(`  ⚠ Not found in database, skipping...`);
        skipped++;
        continue;
      }

      // Transform fields
      const aggregatedFields = transformToAggregatedFields(solution);
      const fieldCount = Object.keys(aggregatedFields).length;

      if (fieldCount === 0) {
        console.log(`  ⚠ No field data in JSON, skipping...`);
        skipped++;
        continue;
      }

      console.log(`  ✓ Found ${fieldCount} field distributions`);

      // Update database
      const success = await updateAggregatedFields(
        implementationId,
        aggregatedFields,
        solution.title
      );

      if (success) {
        console.log(`  ✓ Updated database with distributions`);
        updated++;
      } else {
        errors++;
      }

    } catch (error: any) {
      console.error(`  ✗ Error: ${error.message}`);
      errors++;
    }

    console.log('');
  }

  // Summary
  console.log('='.repeat(60));
  console.log('BACKFILL SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Updated: ${updated} solutions`);
  console.log(`⚠ Skipped: ${skipped} solutions`);
  console.log(`✗ Errors: ${errors} solutions`);
  console.log('='.repeat(60));
}

// Run backfill
backfillAnxietyDistributions()
  .then(() => {
    console.log('\n✓ Backfill complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n✗ Fatal error:', error);
    process.exit(1);
  });
