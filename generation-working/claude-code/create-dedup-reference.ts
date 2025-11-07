import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ExistingSolution {
  title: string;
  solution_id: string;
  variant_id: string;
  solution_category: string;
  in_current_goal: boolean;
  avg_effectiveness?: number;
}

async function createDedupReference(goalId: string, goalTitle: string) {
  console.log(`Creating deduplication reference for: ${goalTitle}`);
  console.log(`Goal ID: ${goalId}\n`);

  // Step 1: Get all solutions currently linked to this goal
  console.log('Step 1: Fetching existing solutions for this goal...');
  const { data: currentGoalSolutions, error: currentError } = await supabase
    .from('goal_implementation_links')
    .select(`
      implementation_id,
      avg_effectiveness,
      solution_variants!inner(
        id,
        solution_id,
        solutions!inner(
          id,
          title,
          solution_category
        )
      )
    `)
    .eq('goal_id', goalId);

  if (currentError) {
    console.error('Error fetching current goal solutions:', currentError);
    throw currentError;
  }

  const existingSolutions: ExistingSolution[] = [];
  const currentSolutionIds = new Set<string>();

  currentGoalSolutions?.forEach((link: any) => {
    const solution = link.solution_variants.solutions;
    currentSolutionIds.add(solution.id);

    existingSolutions.push({
      title: solution.title,
      solution_id: solution.id,
      variant_id: link.solution_variants.id,
      solution_category: solution.solution_category,
      in_current_goal: true,
      avg_effectiveness: parseFloat(link.avg_effectiveness)
    });
  });

  console.log(`  ✓ Found ${existingSolutions.length} existing solutions for this goal\n`);

  // Step 2: Get ALL solutions in database (for broader deduplication)
  console.log('Step 2: Fetching all solutions in database for cross-goal deduplication...');
  const { data: allSolutions, error: allError } = await supabase
    .from('solutions')
    .select('id, title, solution_category')
    .eq('is_approved', true)
    .order('title');

  if (allError) {
    console.error('Error fetching all solutions:', allError);
    throw allError;
  }

  // Add solutions NOT in current goal
  allSolutions?.forEach((solution: any) => {
    if (!currentSolutionIds.has(solution.id)) {
      existingSolutions.push({
        title: solution.title,
        solution_id: solution.id,
        variant_id: '', // Will need to create variant if we link this
        solution_category: solution.solution_category,
        in_current_goal: false
      });
    }
  });

  console.log(`  ✓ Total solutions in database: ${allSolutions?.length}\n`);

  // Step 3: Analyze gaps
  console.log('Step 3: Analyzing category gaps...');
  const categoryCount: Record<string, number> = {};
  existingSolutions
    .filter(s => s.in_current_goal)
    .forEach(s => {
      categoryCount[s.solution_category] = (categoryCount[s.solution_category] || 0) + 1;
    });

  const gaps: string[] = [];

  // Check for missing categories
  const commonCategories = [
    'medications', 'therapists_counselors', 'apps_software',
    'supplements_vitamins', 'exercise_movement', 'meditation_mindfulness',
    'books_courses', 'habits_routines'
  ];

  commonCategories.forEach(cat => {
    const count = categoryCount[cat] || 0;
    if (count === 0) {
      gaps.push(`Missing category: ${cat} (0 solutions)`);
    } else if (count < 3) {
      gaps.push(`Underrepresented: ${cat} (only ${count} solution${count > 1 ? 's' : ''})`);
    }
  });

  console.log('\n  Category Distribution:');
  Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`    ${cat}: ${count} solutions`);
    });

  console.log('\n  Identified Gaps:');
  gaps.forEach(gap => console.log(`    • ${gap}`));

  // Step 4: Calculate target
  const currentCount = existingSolutions.filter(s => s.in_current_goal).length;
  const targetTotal = 45; // TODO: Make this configurable or smart
  const targetNewCount = Math.max(0, targetTotal - currentCount);

  console.log(`\n  Current: ${currentCount} solutions`);
  console.log(`  Target Total: ${targetTotal} solutions`);
  console.log(`  Need to Generate: ${targetNewCount} NEW solutions\n`);

  // Step 5: Create reference file
  const reference = {
    goal_id: goalId,
    goal_title: goalTitle,
    generated_at: new Date().toISOString(),
    existing_solutions: existingSolutions,
    gaps_to_fill: gaps,
    category_distribution: categoryCount,
    current_count: currentCount,
    target_total: targetTotal,
    target_new_count: targetNewCount
  };

  const outputPath = path.join(__dirname, '../existing-solutions-reference.json');
  fs.writeFileSync(outputPath, JSON.stringify(reference, null, 2));

  console.log('='.repeat(60));
  console.log('DEDUPLICATION REFERENCE CREATED');
  console.log('='.repeat(60));
  console.log(`Output: ${outputPath}`);
  console.log(`\nExisting solutions: ${existingSolutions.length} total`);
  console.log(`  - In current goal: ${existingSolutions.filter(s => s.in_current_goal).length}`);
  console.log(`  - Available for linking: ${existingSolutions.filter(s => !s.in_current_goal).length}`);
  console.log(`\nGaps identified: ${gaps.length}`);
  console.log(`Target new solutions: ${targetNewCount}`);
  console.log('\n✓ Ready to provide to Claude Web for Phase One');
}

// Run with goal ID and title as arguments
const goalId = process.argv[2] || '56e2801e-0d78-4abd-a795-869e5b780ae7';
const goalTitle = process.argv[3] || 'Reduce anxiety';

createDedupReference(goalId, goalTitle)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n✗ Fatal error:', error);
    process.exit(1);
  });
