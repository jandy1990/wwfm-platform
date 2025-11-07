import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Solution {
  index: number;
  title: string;
  solution_category: string;
  avg_effectiveness: number;
  aggregated_fields: any;
}

interface FinalOutput {
  goal_id: string;
  goal_title: string;
  target_count: number;
  actual_count: number;
  solutions: Solution[];
}

interface InsertionResult {
  linkedExisting: number;
  createdNew: number;
  linkedSolutions: string[];
  createdSolutions: string[];
  errors: string[];
}

/**
 * Extract core title for fuzzy matching
 * Removes parenthetical info, brand details, etc.
 */
function extractCoreTitle(title: string): string {
  // Remove content in parentheses
  let core = title.replace(/\([^)]*\)/g, '').trim();

  // Remove common qualifiers
  const qualifiers = [
    'technique', 'method', 'program', 'system',
    'app', 'therapy', 'medication', 'supplement'
  ];

  for (const qual of qualifiers) {
    const regex = new RegExp(`\\b${qual}\\b`, 'gi');
    core = core.replace(regex, '').trim();
  }

  return core;
}

/**
 * Search for existing solution by fuzzy title match
 */
async function findExistingSolution(
  title: string,
  category: string
): Promise<{ id: string; title: string } | null> {

  const coreTitle = extractCoreTitle(title);

  // Try exact match first
  const { data: exactMatch } = await supabase
    .from('solutions')
    .select('id, title')
    .eq('solution_category', category)
    .ilike('title', title)
    .limit(1);

  if (exactMatch && exactMatch.length > 0) {
    return exactMatch[0];
  }

  // Try core title fuzzy match
  const { data: fuzzyMatch } = await supabase
    .from('solutions')
    .select('id, title')
    .eq('solution_category', category)
    .ilike('title', `%${coreTitle}%`)
    .limit(1);

  if (fuzzyMatch && fuzzyMatch.length > 0) {
    return fuzzyMatch[0];
  }

  return null;
}

/**
 * Find or create solution variant for this goal
 */
async function findOrCreateVariant(
  solutionId: string,
  category: string
): Promise<string> {

  // Categories that use real variants
  const variantCategories = [
    'medications',
    'supplements_vitamins',
    'natural_remedies',
    'beauty_skincare'
  ];

  if (!variantCategories.includes(category)) {
    // For non-variant categories, create a generic variant
    const { data: existingVariant } = await supabase
      .from('solution_variants')
      .select('id')
      .eq('solution_id', solutionId)
      .limit(1);

    if (existingVariant && existingVariant.length > 0) {
      return existingVariant[0].id;
    }

    // Create generic variant
    const { data: newVariant, error } = await supabase
      .from('solution_variants')
      .insert({
        solution_id: solutionId,
        variant_name: 'Standard'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating variant:', error);
      throw error;
    }

    return newVariant.id;
  }

  // For variant categories, create specific variant
  // (In practice, this would use dosage info from the solution data)
  const { data: newVariant, error } = await supabase
    .from('solution_variants')
    .insert({
      solution_id: solutionId,
      variant_name: 'Standard'
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating variant:', error);
    throw error;
  }

  return newVariant.id;
}

/**
 * Check if goal-solution link already exists
 */
async function linkExists(goalId: string, implementationId: string): Promise<boolean> {
  const { data } = await supabase
    .from('goal_implementation_links')
    .select('implementation_id')
    .eq('goal_id', goalId)
    .eq('implementation_id', implementationId)
    .limit(1);

  return data !== null && data.length > 0;
}

/**
 * Create goal-solution link with aggregated fields
 */
async function createGoalLink(
  goalId: string,
  implementationId: string,
  effectiveness: number,
  aggregatedFields: any
): Promise<void> {

  const { error } = await supabase
    .from('goal_implementation_links')
    .insert({
      goal_id: goalId,
      implementation_id: implementationId,
      avg_effectiveness: effectiveness,
      aggregated_fields: aggregatedFields,
      data_display_mode: 'ai'
    });

  if (error) {
    console.error('Error creating goal link:', error);
    throw error;
  }
}

/**
 * Main insertion function with deduplication
 */
async function insertSolutionsWithDedup(): Promise<InsertionResult> {

  const result: InsertionResult = {
    linkedExisting: 0,
    createdNew: 0,
    linkedSolutions: [],
    createdSolutions: [],
    errors: []
  };

  // Read final-output.json
  const finalOutputPath = path.join(__dirname, '../final-output.json');
  const fileContent = fs.readFileSync(finalOutputPath, 'utf-8');
  const finalOutput: FinalOutput = JSON.parse(fileContent);

  console.log('='.repeat(60));
  console.log('INSERTING SOLUTIONS WITH DEDUPLICATION');
  console.log('='.repeat(60));
  console.log(`Goal: ${finalOutput.goal_title}`);
  console.log(`Goal ID: ${finalOutput.goal_id}`);
  console.log(`Solutions to process: ${finalOutput.solutions.length}\n`);

  // Process each solution
  for (const solution of finalOutput.solutions) {
    console.log(`\n[${solution.index}/${finalOutput.solutions.length}] Processing: ${solution.title}`);

    try {
      // Step A: Check for existing solution
      const existing = await findExistingSolution(
        solution.title,
        solution.solution_category
      );

      let solutionId: string;

      if (existing) {
        // Use existing solution
        solutionId = existing.id;
        result.linkedExisting++;
        result.linkedSolutions.push(solution.title);
        console.log(`  ✓ Linking to existing: ${existing.title}`);
      } else {
        // Create new solution
        const { data: newSolution, error: insertError } = await supabase
          .from('solutions')
          .insert({
            title: solution.title,
            description: '', // No descriptions per user requirement
            solution_category: solution.solution_category,
            is_approved: true
          })
          .select('id')
          .single();

        if (insertError) {
          const errorMsg = `Error creating solution "${solution.title}": ${insertError.message}`;
          console.error(`  ✗ ${errorMsg}`);
          result.errors.push(errorMsg);
          continue;
        }

        solutionId = newSolution.id;
        result.createdNew++;
        result.createdSolutions.push(solution.title);
        console.log(`  ✓ Created new: ${solution.title}`);
      }

      // Step B: Find or create variant
      const variantId = await findOrCreateVariant(
        solutionId,
        solution.solution_category
      );
      console.log(`  ✓ Variant ID: ${variantId}`);

      // Step C: Check if link already exists
      const alreadyLinked = await linkExists(finalOutput.goal_id, variantId);

      if (alreadyLinked) {
        console.log(`  ⚠ Link already exists, skipping...`);
        continue;
      }

      // Step D: Create goal implementation link
      await createGoalLink(
        finalOutput.goal_id,
        variantId,
        solution.avg_effectiveness,
        solution.aggregated_fields
      );
      console.log(`  ✓ Goal link created with aggregated fields`);

    } catch (error: any) {
      const errorMsg = `Error processing "${solution.title}": ${error.message}`;
      console.error(`  ✗ ${errorMsg}`);
      result.errors.push(errorMsg);
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('INSERTION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Linked to existing: ${result.linkedExisting} solutions`);
  console.log(`✓ Created new: ${result.createdNew} solutions`);
  console.log(`Total: ${result.linkedExisting + result.createdNew} solutions`);

  if (result.errors.length > 0) {
    console.log(`\n✗ Errors encountered: ${result.errors.length}`);
    result.errors.forEach(err => console.log(`  - ${err}`));
  }

  // Verify count matches expected
  const totalProcessed = result.linkedExisting + result.createdNew;
  if (totalProcessed !== finalOutput.actual_count) {
    console.log(`\n⚠ WARNING: Processed ${totalProcessed} but expected ${finalOutput.actual_count}`);
  }

  // List what was linked vs created
  if (result.linkedSolutions.length > 0) {
    console.log('\nExisting solutions reused:');
    result.linkedSolutions.forEach(title => console.log(`  - ${title}`));
  }

  if (result.createdSolutions.length > 0) {
    console.log('\nNew solutions created:');
    result.createdSolutions.forEach(title => console.log(`  - ${title}`));
  }

  console.log('\n' + '='.repeat(60));

  return result;
}

// Run insertion
insertSolutionsWithDedup()
  .then(() => {
    console.log('\n✓ Insertion complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n✗ Fatal error:', error);
    process.exit(1);
  });
