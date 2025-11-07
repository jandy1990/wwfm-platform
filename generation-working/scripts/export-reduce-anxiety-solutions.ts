/**
 * Export all solutions for "Reduce anxiety" goal (BEFORE state)
 * Goal ID: 56e2801e-0d78-4abd-a795-869e5b780ae7
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const GOAL_ID = '56e2801e-0d78-4abd-a795-869e5b780ae7';

async function exportSolutions() {
  console.log('🔍 Fetching solutions for "Reduce anxiety" goal...');

  // Get goal metadata
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('id, title, description, arena_id, created_at')
    .eq('id', GOAL_ID)
    .single();

  if (goalError) {
    console.error('❌ Error fetching goal:', goalError);
    process.exit(1);
  }

  // Get all goal-solution links with full solution data
  const { data: links, error: linksError } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      avg_effectiveness,
      rating_count,
      human_rating_count,
      aggregated_fields,
      data_display_mode,
      created_at,
      implementation_id,
      solution_variants!inner (
        id,
        variant_name,
        amount,
        unit,
        form,
        solution_id,
        solutions!inner (
          id,
          title,
          description,
          solution_category,
          source_type,
          created_at,
          is_approved
        )
      )
    `)
    .eq('goal_id', GOAL_ID)
    .order('avg_effectiveness', { ascending: false });

  if (linksError) {
    console.error('❌ Error fetching links:', linksError);
    process.exit(1);
  }

  console.log(`✅ Found ${links?.length || 0} solution links`);

  // Transform data for export
  const solutions = links?.map(link => {
    const variant = link.solution_variants;
    const solution = variant?.solutions;

    return {
      link_id: link.id,
      solution_id: solution?.id,
      title: solution?.title,
      description: solution?.description,
      category: solution?.solution_category,
      source_type: solution?.source_type,
      is_approved: solution?.is_approved,
      created_at: solution?.created_at,

      // Variant data
      variant_id: variant?.id,
      variant_name: variant?.variant_name,
      amount: variant?.amount,
      unit: variant?.unit,
      form: variant?.form,

      // Effectiveness data
      effectiveness: link.avg_effectiveness,
      rating_count: link.rating_count,
      human_rating_count: link.human_rating_count,
      data_display_mode: link.data_display_mode,

      // Field distributions (full JSONB)
      aggregated_fields: link.aggregated_fields,

      link_created_at: link.created_at
    };
  });

  // Prepare export object
  const exportData = {
    metadata: {
      export_date: new Date().toISOString(),
      export_purpose: 'Quality comparison test - BEFORE state',
      goal_id: goal.id,
      goal_title: goal.title,
      goal_description: goal.description
    },
    stats: {
      total_links: links?.length || 0,
      unique_solutions: new Set(solutions?.map(s => s.solution_id)).size,
      avg_effectiveness: (solutions?.reduce((sum, s) => sum + (s.effectiveness || 0), 0) || 0) / (solutions?.length || 1),
      categories: [...new Set(solutions?.map(s => s.category))].sort()
    },
    solutions: solutions
  };

  // Write to file
  const outputPath = join(
    process.cwd(),
    'archive/2025-11-07-quality-comparison/before-reduce-anxiety.json'
  );

  writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

  console.log(`\n✅ Export complete!`);
  console.log(`📁 Saved to: ${outputPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   - Total links: ${exportData.stats.total_links}`);
  console.log(`   - Unique solutions: ${exportData.stats.unique_solutions}`);
  console.log(`   - Avg effectiveness: ${exportData.stats.avg_effectiveness.toFixed(2)}`);
  console.log(`   - Categories: ${exportData.stats.categories.join(', ')}`);
}

exportSolutions().catch(console.error);
