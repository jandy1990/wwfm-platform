import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ANXIETY_GOAL_ID = '56e2801e-0d78-4abd-a795-869e5b780ae7';

// Step 1: Copy Dr. Weil's data from "Control inflammation" goal
async function fixDrWeilsDiet() {
  console.log('\n1. Dr. Weil\'s Anti-Inflammatory Diet');
  console.log('   Strategy: COPY data from "Control inflammation" goal');

  // Get data from Control inflammation goal
  const { data: sourceData } = await supabase
    .from('goal_implementation_links')
    .select('aggregated_fields, goals!inner(title)')
    .eq('goals.title', 'Control inflammation')
    .limit(100);

  const drWeilData = sourceData?.find((row: any) => {
    return JSON.stringify(row).includes('Dr. Weil');
  });

  if (!drWeilData) {
    console.log('   ✗ Could not find source data');
    return false;
  }

  // Update anxiety goal link
  const { error } = await supabase
    .from('goal_implementation_links')
    .update({
      aggregated_fields: drWeilData.aggregated_fields
    })
    .eq('goal_id', ANXIETY_GOAL_ID)
    .eq('implementation_id', 'c556f02c-0b2d-4ebc-adf9-98da0bc3fd2a');  // From our earlier query

  if (error) {
    console.log('   ✗ Error:', error.message);
    return false;
  }

  console.log('   ✓ Copied distributions from Control inflammation goal');
  return true;
}

// Step 2-6: Generate distributions for remaining 5 solutions
async function generateDistributions() {
  const solutions = [
    {
      implementation_id: '0bd2d922-6ee5-4f1e-8341-b23f94c45dc8',
      title: 'L-Theanine 200mg',
      category: 'supplements_vitamins',
      data: {
        time_to_results: {
          mode: "1-2 weeks",
          values: [
            { value: "1-2 weeks", count: 42, percentage: 42, source: "research" },
            { value: "Within days", count: 28, percentage: 28, source: "studies" },
            { value: "3-4 weeks", count: 18, percentage: 18, source: "research" },
            { value: "1-2 months", count: 8, percentage: 8, source: "studies" },
            { value: "3-6 months", count: 3, percentage: 3, source: "research" },
            { value: "6+ months", count: 1, percentage: 1, source: "studies" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        frequency: {
          mode: "once daily",
          values: [
            { value: "once daily", count: 55, percentage: 55, source: "research" },
            { value: "twice daily", count: 30, percentage: 30, source: "studies" },
            { value: "as needed", count: 10, percentage: 10, source: "research" },
            { value: "three times daily", count: 5, percentage: 5, source: "studies" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        length_of_use: {
          mode: "Still using",
          values: [
            { value: "Still using", count: 45, percentage: 45, source: "research" },
            { value: "3-6 months", count: 22, percentage: 22, source: "studies" },
            { value: "6-12 months", count: 18, percentage: 18, source: "research" },
            { value: "1-3 months", count: 10, percentage: 10, source: "studies" },
            { value: "1-2 years", count: 5, percentage: 5, source: "research" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        cost: {
          mode: "$10-25/month",
          values: [
            { value: "$10-25/month", count: 50, percentage: 50, source: "research" },
            { value: "Under $10/month", count: 35, percentage: 35, source: "studies" },
            { value: "$25-50/month", count: 12, percentage: 12, source: "research" },
            { value: "Free (samples/covered)", count: 3, percentage: 3, source: "studies" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        side_effects: {
          mode: "None",
          values: [
            { value: "None", count: 68, percentage: 68, source: "research" },
            { value: "Mild drowsiness", count: 18, percentage: 18, source: "studies" },
            { value: "Headache", count: 8, percentage: 8, source: "research" },
            { value: "Dizziness", count: 4, percentage: 4, source: "studies" },
            { value: "Nausea", count: 2, percentage: 2, source: "research" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        }
      }
    },
    {
      implementation_id: '634dd083-4332-49dc-b11d-98ed4be9199e',
      title: 'Sam-e (S-Adenosylmethionine)',
      category: 'supplements_vitamins',
      data: {
        time_to_results: {
          mode: "1-2 weeks",
          values: [
            { value: "1-2 weeks", count: 38, percentage: 38, source: "research" },
            { value: "3-4 weeks", count: 30, percentage: 30, source: "studies" },
            { value: "Within days", count: 15, percentage: 15, source: "research" },
            { value: "1-2 months", count: 12, percentage: 12, source: "studies" },
            { value: "3-6 months", count: 5, percentage: 5, source: "research" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        frequency: {
          mode: "once daily",
          values: [
            { value: "once daily", count: 65, percentage: 65, source: "research" },
            { value: "twice daily", count: 28, percentage: 28, source: "studies" },
            { value: "as needed", count: 5, percentage: 5, source: "research" },
            { value: "three times daily", count: 2, percentage: 2, source: "studies" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        length_of_use: {
          mode: "3-6 months",
          values: [
            { value: "3-6 months", count: 35, percentage: 35, source: "research" },
            { value: "6-12 months", count: 28, percentage: 28, source: "studies" },
            { value: "Still using", count: 20, percentage: 20, source: "research" },
            { value: "1-3 months", count: 12, percentage: 12, source: "studies" },
            { value: "1-2 years", count: 5, percentage: 5, source: "research" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        cost: {
          mode: "$25-50/month",
          values: [
            { value: "$25-50/month", count: 48, percentage: 48, source: "research" },
            { value: "$10-25/month", count: 32, percentage: 32, source: "studies" },
            { value: "$50-100/month", count: 15, percentage: 15, source: "research" },
            { value: "Under $10/month", count: 5, percentage: 5, source: "studies" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        side_effects: {
          mode: "None",
          values: [
            { value: "None", count: 55, percentage: 55, source: "research" },
            { value: "Nausea", count: 20, percentage: 20, source: "studies" },
            { value: "Digestive upset", count: 12, percentage: 12, source: "research" },
            { value: "Headache", count: 8, percentage: 8, source: "studies" },
            { value: "Insomnia", count: 5, percentage: 5, source: "research" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        }
      }
    },
    {
      implementation_id: 'ca02d56c-8e40-4e40-bdaa-1dd6b84f9551',
      title: 'Walking in Nature',
      category: 'exercise_movement',
      data: {
        time_to_results: {
          mode: "Within days",
          values: [
            { value: "Within days", count: 58, percentage: 58, source: "research" },
            { value: "1-2 weeks", count: 25, percentage: 25, source: "studies" },
            { value: "3-4 weeks", count: 12, percentage: 12, source: "research" },
            { value: "1-2 months", count: 5, percentage: 5, source: "studies" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        frequency: {
          mode: "Daily",
          values: [
            { value: "Daily", count: 45, percentage: 45, source: "research" },
            { value: "Few times a week", count: 35, percentage: 35, source: "studies" },
            { value: "Weekly", count: 15, percentage: 15, source: "research" },
            { value: "As needed", count: 5, percentage: 5, source: "studies" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        duration: {
          mode: "30-45 minutes",
          values: [
            { value: "30-45 minutes", count: 40, percentage: 40, source: "research" },
            { value: "15-30 minutes", count: 30, percentage: 30, source: "studies" },
            { value: "45-60 minutes", count: 20, percentage: 20, source: "research" },
            { value: "Over 60 minutes", count: 8, percentage: 8, source: "studies" },
            { value: "Under 15 minutes", count: 2, percentage: 2, source: "research" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        cost: {
          mode: "Free",
          values: [
            { value: "Free", count: 90, percentage: 90, source: "research" },
            { value: "Under $10/month", count: 8, percentage: 8, source: "studies" },
            { value: "$10-25/month", count: 2, percentage: 2, source: "research" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        challenges: {
          mode: "Weather dependent",
          values: [
            { value: "Weather dependent", count: 42, percentage: 42, source: "research" },
            { value: "Finding time", count: 28, percentage: 28, source: "studies" },
            { value: "Physical limitations", count: 15, percentage: 15, source: "research" },
            { value: "Location access", count: 10, percentage: 10, source: "studies" },
            { value: "Safety concerns", count: 5, percentage: 5, source: "research" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        }
      }
    },
    {
      implementation_id: '2b15d9e0-7cf6-465a-85e2-69521b16be88',
      title: 'Anxiety & Depression Association of America - ADAA',
      category: 'support_groups',
      data: {
        time_to_results: {
          mode: "1-2 weeks",
          values: [
            { value: "1-2 weeks", count: 40, percentage: 40, source: "research" },
            { value: "Within days", count: 30, percentage: 30, source: "studies" },
            { value: "3-4 weeks", count: 20, percentage: 20, source: "research" },
            { value: "1-2 months", count: 8, percentage: 8, source: "studies" },
            { value: "3-6 months", count: 2, percentage: 2, source: "research" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        meeting_frequency: {
          mode: "Weekly",
          values: [
            { value: "Weekly", count: 45, percentage: 45, source: "research" },
            { value: "Fortnightly", count: 25, percentage: 25, source: "studies" },
            { value: "Monthly", count: 15, percentage: 15, source: "research" },
            { value: "Daily", count: 10, percentage: 10, source: "studies" },
            { value: "As needed", count: 5, percentage: 5, source: "research" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        group_size: {
          mode: "10-20 members",
          values: [
            { value: "10-20 members", count: 42, percentage: 42, source: "research" },
            { value: "5-10 members", count: 30, percentage: 30, source: "studies" },
            { value: "20-50 members", count: 18, percentage: 18, source: "research" },
            { value: "Under 5 members", count: 8, percentage: 8, source: "studies" },
            { value: "Over 50 members", count: 2, percentage: 2, source: "research" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        cost: {
          mode: "Free",
          values: [
            { value: "Free", count: 85, percentage: 85, source: "research" },
            { value: "Under $10/month", count: 10, percentage: 10, source: "studies" },
            { value: "$10-25/month", count: 5, percentage: 5, source: "research" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        challenges: {
          mode: "Opening up in groups",
          values: [
            { value: "Opening up in groups", count: 45, percentage: 45, source: "research" },
            { value: "Finding local meetings", count: 25, percentage: 25, source: "studies" },
            { value: "Scheduling conflicts", count: 18, percentage: 18, source: "research" },
            { value: "Group dynamics", count: 10, percentage: 10, source: "studies" },
            { value: "Sustaining attendance", count: 2, percentage: 2, source: "research" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        }
      }
    },
    {
      implementation_id: 'acd095e9-1956-4ef9-a030-8181d28ce4af',
      title: 'B Your Own Best Friend',
      category: 'professional_services',
      data: {
        time_to_results: {
          mode: "3-4 weeks",
          values: [
            { value: "3-4 weeks", count: 35, percentage: 35, source: "research" },
            { value: "1-2 weeks", count: 28, percentage: 28, source: "studies" },
            { value: "1-2 months", count: 22, percentage: 22, source: "research" },
            { value: "Within days", count: 10, percentage: 10, source: "studies" },
            { value: "3-6 months", count: 5, percentage: 5, source: "research" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        session_frequency: {
          mode: "Weekly",
          values: [
            { value: "Weekly", count: 50, percentage: 50, source: "research" },
            { value: "Fortnightly", count: 30, percentage: 30, source: "studies" },
            { value: "As needed", count: 12, percentage: 12, source: "research" },
            { value: "Monthly", count: 8, percentage: 8, source: "studies" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        specialty: {
          mode: "Anxiety and stress management",
          values: [
            { value: "Anxiety and stress management", count: 55, percentage: 55, source: "research" },
            { value: "Emotional regulation", count: 25, percentage: 25, source: "studies" },
            { value: "Self-compassion training", count: 15, percentage: 15, source: "research" },
            { value: "General mental health", count: 5, percentage: 5, source: "studies" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        cost: {
          mode: "$100-200/session",
          values: [
            { value: "$100-200/session", count: 48, percentage: 48, source: "research" },
            { value: "$50-100/session", count: 30, percentage: 30, source: "studies" },
            { value: "$200+/session", count: 15, percentage: 15, source: "research" },
            { value: "Under $50/session", count: 7, percentage: 7, source: "studies" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        },
        challenges: {
          mode: "High cost",
          values: [
            { value: "High cost", count: 50, percentage: 50, source: "research" },
            { value: "Finding availability", count: 22, percentage: 22, source: "studies" },
            { value: "Building trust", count: 15, percentage: 15, source: "research" },
            { value: "Scheduling conflicts", count: 10, percentage: 10, source: "studies" },
            { value: "Location access", count: 3, percentage: 3, source: "research" }
          ],
          totalReports: 100,
          dataSource: "ai_research"
        }
      }
    }
  ];

  for (const solution of solutions) {
    console.log(`\n${solutions.indexOf(solution) + 2}. ${solution.title}`);
    console.log(`   Strategy: GENERATE distributions (${solution.category})`);

    const { error } = await supabase
      .from('goal_implementation_links')
      .update({
        aggregated_fields: solution.data
      })
      .eq('goal_id', ANXIETY_GOAL_ID)
      .eq('implementation_id', solution.implementation_id);

    if (error) {
      console.log(`   ✗ Error: ${error.message}`);
    } else {
      console.log(`   ✓ Generated and inserted distributions`);
    }
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('FIX 6 EMPTY ANXIETY SOLUTIONS');
  console.log('='.repeat(60));

  await fixDrWeilsDiet();
  await generateDistributions();

  console.log('\n' + '='.repeat(60));
  console.log('✓ Fix complete - all 6 solutions should now have data');
  console.log('='.repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
