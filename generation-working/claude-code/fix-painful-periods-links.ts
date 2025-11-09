import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const GOAL_ID = '749021fc-02a4-402b-8369-30ce58e93a3b'; // Manage painful periods

// Field data for the 6 solutions that failed
const solutionsToFix = [
  {
    searchTitle: 'Ibuprofen',
    effectiveness: 4.5,
    fields: {
      time_to_results: {
        mode: "30-60 minutes",
        values: [
          { value: "30-60 minutes", count: 55, percentage: 55, source: "research" },
          { value: "1-2 hours", count: 30, percentage: 30, source: "studies" },
          { value: "Less than 30 minutes", count: 10, percentage: 10, source: "research" },
          { value: "2-4 hours", count: 5, percentage: 5, source: "studies" }
        ]
      },
      frequency: {
        mode: "Every 4-6 hours",
        values: [
          { value: "Every 4-6 hours", count: 60, percentage: 60, source: "research" },
          { value: "Every 6-8 hours", count: 25, percentage: 25, source: "studies" },
          { value: "Once daily", count: 10, percentage: 10, source: "research" },
          { value: "As needed", count: 5, percentage: 5, source: "studies" }
        ]
      },
      length_of_use: {
        mode: "2-3 days",
        values: [
          { value: "2-3 days", count: 45, percentage: 45, source: "research" },
          { value: "3-5 days", count: 35, percentage: 35, source: "studies" },
          { value: "1-2 days", count: 15, percentage: 15, source: "research" },
          { value: "Entire period", count: 5, percentage: 5, source: "studies" }
        ]
      },
      cost: {
        mode: "$5-10/month",
        values: [
          { value: "$5-10/month", count: 50, percentage: 50, source: "research" },
          { value: "Under $5/month", count: 30, percentage: 30, source: "studies" },
          { value: "$10-20/month", count: 15, percentage: 15, source: "research" },
          { value: "$20-30/month", count: 5, percentage: 5, source: "studies" }
        ]
      },
      side_effects: {
        mode: "Stomach upset",
        values: [
          { value: "Stomach upset", count: 35, percentage: 35, source: "research" },
          { value: "None", count: 30, percentage: 30, source: "studies" },
          { value: "Nausea", count: 20, percentage: 20, source: "research" },
          { value: "Drowsiness", count: 10, percentage: 10, source: "studies" },
          { value: "Headache", count: 5, percentage: 5, source: "research" }
        ]
      }
    }
  },
  {
    searchTitle: 'Progestin-only birth control (Mirena IUD',
    effectiveness: 4.6,
    fields: {
      time_to_results: {
        mode: "3-6 months",
        values: [
          { value: "3-6 months", count: 50, percentage: 50, source: "research" },
          { value: "1-3 months", count: 30, percentage: 30, source: "studies" },
          { value: "6-12 months", count: 15, percentage: 15, source: "research" },
          { value: "First month", count: 5, percentage: 5, source: "studies" }
        ]
      },
      frequency: {
        mode: "Continuous release",
        values: [
          { value: "Continuous release", count: 100, percentage: 100, source: "research" }
        ]
      },
      length_of_use: {
        mode: "5 years",
        values: [
          { value: "5 years", count: 70, percentage: 70, source: "research" },
          { value: "3-5 years", count: 20, percentage: 20, source: "studies" },
          { value: "1-3 years", count: 8, percentage: 8, source: "research" },
          { value: "Less than 1 year", count: 2, percentage: 2, source: "studies" }
        ]
      },
      cost: {
        mode: "$800-1200 upfront",
        values: [
          { value: "$800-1200 upfront", count: 45, percentage: 45, source: "research" },
          { value: "Free with insurance", count: 35, percentage: 35, source: "studies" },
          { value: "$500-800 upfront", count: 15, percentage: 15, source: "research" },
          { value: "Over $1200", count: 5, percentage: 5, source: "studies" }
        ]
      },
      side_effects: {
        mode: "Irregular bleeding",
        values: [
          { value: "Irregular bleeding", count: 40, percentage: 40, source: "research" },
          { value: "Cramping initially", count: 25, percentage: 25, source: "studies" },
          { value: "Lighter periods", count: 20, percentage: 20, source: "research" },
          { value: "No periods", count: 10, percentage: 10, source: "studies" },
          { value: "None", count: 5, percentage: 5, source: "research" }
        ]
      }
    }
  },
  {
    searchTitle: 'Magnesium Glycinate Supplement',
    effectiveness: 4.2,
    fields: {
      time_to_results: {
        mode: "1-2 cycles",
        values: [
          { value: "1-2 cycles", count: 45, percentage: 45, source: "research" },
          { value: "First cycle", count: 30, percentage: 30, source: "studies" },
          { value: "2-3 cycles", count: 20, percentage: 20, source: "research" },
          { value: "Within days", count: 5, percentage: 5, source: "studies" }
        ]
      },
      frequency: {
        mode: "Once daily",
        values: [
          { value: "Once daily", count: 60, percentage: 60, source: "research" },
          { value: "Twice daily", count: 25, percentage: 25, source: "studies" },
          { value: "During period only", count: 10, percentage: 10, source: "research" },
          { value: "As needed", count: 5, percentage: 5, source: "studies" }
        ]
      },
      length_of_use: {
        mode: "Ongoing",
        values: [
          { value: "Ongoing", count: 55, percentage: 55, source: "research" },
          { value: "3-6 months", count: 25, percentage: 25, source: "studies" },
          { value: "1-3 months", count: 15, percentage: 15, source: "research" },
          { value: "During period only", count: 5, percentage: 5, source: "studies" }
        ]
      },
      cost: {
        mode: "$10-20/month",
        values: [
          { value: "$10-20/month", count: 50, percentage: 50, source: "research" },
          { value: "$5-10/month", count: 30, percentage: 30, source: "studies" },
          { value: "$20-30/month", count: 15, percentage: 15, source: "research" },
          { value: "Under $5/month", count: 5, percentage: 5, source: "studies" }
        ]
      },
      side_effects: {
        mode: "None",
        values: [
          { value: "None", count: 45, percentage: 45, source: "research" },
          { value: "Loose stools", count: 25, percentage: 25, source: "studies" },
          { value: "Mild nausea", count: 15, percentage: 15, source: "research" },
          { value: "Drowsiness", count: 10, percentage: 10, source: "studies" },
          { value: "Stomach upset", count: 5, percentage: 5, source: "research" }
        ]
      }
    }
  },
  {
    searchTitle: 'Vitamin B12',
    effectiveness: 3.9,
    fields: {
      time_to_results: {
        mode: "2-3 cycles",
        values: [
          { value: "2-3 cycles", count: 50, percentage: 50, source: "research" },
          { value: "1-2 cycles", count: 30, percentage: 30, source: "studies" },
          { value: "3-6 months", count: 15, percentage: 15, source: "research" },
          { value: "First cycle", count: 5, percentage: 5, source: "studies" }
        ]
      },
      frequency: {
        mode: "Once daily",
        values: [
          { value: "Once daily", count: 75, percentage: 75, source: "research" },
          { value: "Twice daily", count: 15, percentage: 15, source: "studies" },
          { value: "During period only", count: 8, percentage: 8, source: "research" },
          { value: "As needed", count: 2, percentage: 2, source: "studies" }
        ]
      },
      length_of_use: {
        mode: "3-6 months",
        values: [
          { value: "3-6 months", count: 45, percentage: 45, source: "research" },
          { value: "Ongoing", count: 30, percentage: 30, source: "studies" },
          { value: "1-3 months", count: 20, percentage: 20, source: "research" },
          { value: "During period only", count: 5, percentage: 5, source: "studies" }
        ]
      },
      cost: {
        mode: "$5-10/month",
        values: [
          { value: "$5-10/month", count: 55, percentage: 55, source: "research" },
          { value: "Under $5/month", count: 30, percentage: 30, source: "studies" },
          { value: "$10-20/month", count: 12, percentage: 12, source: "research" },
          { value: "$20-30/month", count: 3, percentage: 3, source: "studies" }
        ]
      },
      side_effects: {
        mode: "None",
        values: [
          { value: "None", count: 80, percentage: 80, source: "research" },
          { value: "Mild nausea", count: 10, percentage: 10, source: "studies" },
          { value: "Headache", count: 5, percentage: 5, source: "research" },
          { value: "Allergic reaction", count: 3, percentage: 3, source: "studies" },
          { value: "Sweating", count: 2, percentage: 2, source: "research" }
        ]
      }
    }
  },
  {
    searchTitle: 'Omega-3 fish oil',
    effectiveness: 4.0,
    fields: {
      time_to_results: {
        mode: "2-3 cycles",
        values: [
          { value: "2-3 cycles", count: 45, percentage: 45, source: "research" },
          { value: "1-2 cycles", count: 35, percentage: 35, source: "studies" },
          { value: "3-6 months", count: 15, percentage: 15, source: "research" },
          { value: "First cycle", count: 5, percentage: 5, source: "studies" }
        ]
      },
      frequency: {
        mode: "Once daily",
        values: [
          { value: "Once daily", count: 50, percentage: 50, source: "research" },
          { value: "Twice daily", count: 35, percentage: 35, source: "studies" },
          { value: "With meals", count: 10, percentage: 10, source: "research" },
          { value: "As needed", count: 5, percentage: 5, source: "studies" }
        ]
      },
      length_of_use: {
        mode: "Ongoing",
        values: [
          { value: "Ongoing", count: 60, percentage: 60, source: "research" },
          { value: "3-6 months", count: 25, percentage: 25, source: "studies" },
          { value: "6-12 months", count: 10, percentage: 10, source: "research" },
          { value: "1-3 months", count: 5, percentage: 5, source: "studies" }
        ]
      },
      cost: {
        mode: "$15-25/month",
        values: [
          { value: "$15-25/month", count: 45, percentage: 45, source: "research" },
          { value: "$10-15/month", count: 30, percentage: 30, source: "studies" },
          { value: "$25-40/month", count: 20, percentage: 20, source: "research" },
          { value: "$5-10/month", count: 5, percentage: 5, source: "studies" }
        ]
      },
      side_effects: {
        mode: "Fishy aftertaste",
        values: [
          { value: "Fishy aftertaste", count: 35, percentage: 35, source: "research" },
          { value: "None", count: 30, percentage: 30, source: "studies" },
          { value: "Burping", count: 20, percentage: 20, source: "research" },
          { value: "Nausea", count: 10, percentage: 10, source: "studies" },
          { value: "Stomach upset", count: 5, percentage: 5, source: "research" }
        ]
      }
    }
  },
  {
    searchTitle: 'Chamomile tea',
    effectiveness: 3.6,
    fields: {
      time_to_results: {
        mode: "30-60 minutes",
        values: [
          { value: "30-60 minutes", count: 45, percentage: 45, source: "research" },
          { value: "1-2 hours", count: 30, percentage: 30, source: "studies" },
          { value: "Less than 30 minutes", count: 20, percentage: 20, source: "research" },
          { value: "2-4 hours", count: 5, percentage: 5, source: "studies" }
        ]
      },
      frequency: {
        mode: "2-3 times daily during period",
        values: [
          { value: "2-3 times daily during period", count: 50, percentage: 50, source: "research" },
          { value: "Once daily", count: 25, percentage: 25, source: "studies" },
          { value: "As needed", count: 20, percentage: 20, source: "research" },
          { value: "4+ times daily", count: 5, percentage: 5, source: "studies" }
        ]
      },
      length_of_use: {
        mode: "During period only",
        values: [
          { value: "During period only", count: 60, percentage: 60, source: "research" },
          { value: "Week before + during", count: 25, percentage: 25, source: "studies" },
          { value: "Ongoing", count: 10, percentage: 10, source: "research" },
          { value: "As needed", count: 5, percentage: 5, source: "studies" }
        ]
      },
      cost: {
        mode: "$5-10/month",
        values: [
          { value: "$5-10/month", count: 50, percentage: 50, source: "research" },
          { value: "Under $5/month", count: 35, percentage: 35, source: "studies" },
          { value: "$10-15/month", count: 12, percentage: 12, source: "research" },
          { value: "$15-20/month", count: 3, percentage: 3, source: "studies" }
        ]
      },
      side_effects: {
        mode: "None",
        values: [
          { value: "None", count: 70, percentage: 70, source: "research" },
          { value: "Drowsiness", count: 15, percentage: 15, source: "studies" },
          { value: "Allergic reaction", count: 8, percentage: 8, source: "research" },
          { value: "Nausea", count: 5, percentage: 5, source: "studies" },
          { value: "Stomach upset", count: 2, percentage: 2, source: "research" }
        ]
      }
    }
  }
];

async function fixMissingLinks() {
  console.log('='.repeat(60));
  console.log('FIXING 6 MISSING GOAL LINKS');
  console.log('='.repeat(60));
  console.log(`Goal ID: ${GOAL_ID}`);
  console.log(`Solutions to fix: ${solutionsToFix.length}\n`);

  for (const solution of solutionsToFix) {
    console.log(`\nProcessing: ${solution.searchTitle}`);

    // Find the solution
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

    // Find existing variant
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

    // Check if link already exists
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

    // Create goal link
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

  // Verify final count
  const { count } = await supabase
    .from('goal_implementation_links')
    .select('*', { count: 'exact', head: true })
    .eq('goal_id', GOAL_ID);

  console.log(`✓ Total solutions for "Manage painful periods": ${count}`);
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
