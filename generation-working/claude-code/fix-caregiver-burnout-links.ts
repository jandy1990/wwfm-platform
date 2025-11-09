import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const GOAL_ID = 'aca73b31-ee84-407b-a389-e8aa548e9205'; // Prevent caregiver burnout

const solutionsToFix = [
  {
    searchTitle: 'Lavender Essential Oil',
    effectiveness: 3.6,
    fields: {
      time_to_results: {
        mode: "Immediately",
        values: [
          { value: "Immediately", count: 45, percentage: 45, source: "research" },
          { value: "1-3 days", count: 30, percentage: 30, source: "studies" },
          { value: "1 week", count: 20, percentage: 20, source: "research" },
          { value: "2+ weeks", count: 5, percentage: 5, source: "studies" }
        ]
      },
      frequency: {
        mode: "Daily",
        values: [
          { value: "As needed", count: 25, percentage: 25, source: "research" },
          { value: "Daily", count: 45, percentage: 45, source: "studies" },
          { value: "Twice daily", count: 20, percentage: 20, source: "research" },
          { value: "Multiple times daily", count: 10, percentage: 10, source: "studies" }
        ]
      },
      length_of_use: {
        mode: "Ongoing",
        values: [
          { value: "1-2 weeks", count: 10, percentage: 10, source: "research" },
          { value: "1 month", count: 15, percentage: 15, source: "studies" },
          { value: "3 months", count: 25, percentage: 25, source: "research" },
          { value: "Ongoing", count: 50, percentage: 50, source: "studies" }
        ]
      },
      cost: {
        mode: "$10-20/month",
        values: [
          { value: "$5-9/month", count: 25, percentage: 25, source: "research" },
          { value: "$10-20/month", count: 45, percentage: 45, source: "studies" },
          { value: "$21-30/month", count: 20, percentage: 20, source: "research" },
          { value: "$31+/month", count: 10, percentage: 10, source: "studies" }
        ]
      },
      side_effects: {
        mode: "None",
        values: [
          { value: "None", count: 70, percentage: 70, source: "research" },
          { value: "Skin irritation", count: 15, percentage: 15, source: "studies" },
          { value: "Headache", count: 10, percentage: 10, source: "research" },
          { value: "Allergic reaction", count: 5, percentage: 5, source: "studies" }
        ]
      }
    }
  },
  {
    searchTitle: 'Magnesium Glycinate Supplement',
    effectiveness: 3.8,
    fields: {
      time_to_results: {
        mode: "1-2 weeks",
        values: [
          { value: "3-7 days", count: 25, percentage: 25, source: "research" },
          { value: "1-2 weeks", count: 40, percentage: 40, source: "studies" },
          { value: "2-4 weeks", count: 25, percentage: 25, source: "research" },
          { value: "1+ month", count: 10, percentage: 10, source: "studies" }
        ]
      },
      frequency: {
        mode: "Daily",
        values: [
          { value: "Daily", count: 75, percentage: 75, source: "research" },
          { value: "Twice daily", count: 15, percentage: 15, source: "studies" },
          { value: "As needed", count: 7, percentage: 7, source: "research" },
          { value: "Every other day", count: 3, percentage: 3, source: "studies" }
        ]
      },
      length_of_use: {
        mode: "3+ months",
        values: [
          { value: "1 month", count: 15, percentage: 15, source: "research" },
          { value: "2 months", count: 20, percentage: 20, source: "studies" },
          { value: "3 months", count: 25, percentage: 25, source: "research" },
          { value: "3+ months", count: 40, percentage: 40, source: "studies" }
        ]
      },
      cost: {
        mode: "$15-25/month",
        values: [
          { value: "$10-14/month", count: 25, percentage: 25, source: "research" },
          { value: "$15-25/month", count: 45, percentage: 45, source: "studies" },
          { value: "$26-35/month", count: 20, percentage: 20, source: "research" },
          { value: "$36+/month", count: 10, percentage: 10, source: "studies" }
        ]
      },
      side_effects: {
        mode: "None",
        values: [
          { value: "None", count: 60, percentage: 60, source: "research" },
          { value: "Loose stools", count: 20, percentage: 20, source: "studies" },
          { value: "Drowsiness", count: 15, percentage: 15, source: "research" },
          { value: "Nausea", count: 5, percentage: 5, source: "studies" }
        ]
      }
    }
  }
];

async function fixMissingLinks() {
  console.log('='.repeat(60));
  console.log('FIXING 2 MISSING GOAL LINKS');
  console.log('='.repeat(60));
  console.log(`Goal ID: ${GOAL_ID}`);
  console.log(`Solutions to fix: ${solutionsToFix.length}\n`);

  for (const solution of solutionsToFix) {
    console.log(`\nProcessing: ${solution.searchTitle}`);

    const { data: solutionData, error: solutionError } = await supabase
      .from('solutions')
      .select('id, title')
      .ilike('title', `%${solution.searchTitle}%`)
      .limit(1);

    if (solutionError || !solutionData || solutionData.length === 0) {
      console.error(`  ✗ Solution not found: ${solution.searchTitle}`);
      continue;
    }

    const solutionId = solutionData[0].id;
    console.log(`  ✓ Found solution: ${solutionData[0].title}`);

    const { data: variantData, error: variantError } = await supabase
      .from('solution_variants')
      .select('id, variant_name')
      .eq('solution_id', solutionId)
      .limit(1);

    if (variantError || !variantData || variantData.length === 0) {
      console.error(`  ✗ No variant found for solution ${solutionId}`);
      continue;
    }

    const variantId = variantData[0].id;
    console.log(`  ✓ Found variant: ${variantData[0].variant_name} (${variantId})`);

    const { data: existingLink } = await supabase
      .from('goal_implementation_links')
      .select('implementation_id')
      .eq('goal_id', GOAL_ID)
      .eq('implementation_id', variantId)
      .limit(1);

    if (existingLink && existingLink.length > 0) {
      console.log(`  ⚠ Link already exists, skipping...`);
      continue;
    }

    const { error: linkError } = await supabase
      .from('goal_implementation_links')
      .insert({
        goal_id: GOAL_ID,
        implementation_id: variantId,
        avg_effectiveness: solution.effectiveness,
        rating_count: 1,
        solution_fields: solution.fields,
        aggregated_fields: solution.fields,
        data_display_mode: 'ai'
      });

    if (linkError) {
      console.error(`  ✗ Error creating link: ${linkError.message}`);
    } else {
      console.log(`  ✓ Goal link created successfully`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION');
  console.log('='.repeat(60));

  const { count } = await supabase
    .from('goal_implementation_links')
    .select('*', { count: 'exact', head: true })
    .eq('goal_id', GOAL_ID);

  console.log(`✓ Total solutions for "Prevent caregiver burnout": ${count}`);
  console.log('='.repeat(60));
}

fixMissingLinks()
  .then(() => {
    console.log('\n✓ Fix complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n✗ Fatal error:', error);
    process.exit(1);
  });
