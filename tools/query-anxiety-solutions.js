const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findAnxietyGoalAndSolutions() {
  try {
    // First, find the "Calm My Anxiety" goal
    console.log('Searching for anxiety-related goals...\n');
    
    const { data: goals, error: goalError } = await supabase
      .from('goals')
      .select('id, title, description')
      .or('title.ilike.%anxiety%,description.ilike.%anxiety%')
      .order('title');

    if (goalError) {
      console.error('Error fetching goals:', goalError);
      return;
    }

    console.log(`Found ${goals.length} anxiety-related goals:`);
    goals.forEach(goal => {
      console.log(`- ${goal.title} (ID: ${goal.id})`);
    });

    // Find the specific "Calm My Anxiety" goal
    const calmAnxietyGoal = goals.find(g => 
      g.title.toLowerCase().includes('calm') && 
      g.title.toLowerCase().includes('anxiety')
    ) || goals[0]; // Fall back to first anxiety goal if exact match not found

    if (!calmAnxietyGoal) {
      console.log('\nNo anxiety goals found');
      return;
    }

    console.log(`\nFetching solutions for: "${calmAnxietyGoal.title}" (ID: ${calmAnxietyGoal.id})\n`);

    // Get the first 10 solutions for this goal with all details
    const { data: goalLinks, error: linksError } = await supabase
      .from('goal_implementation_links')
      .select(`
        id,
        avg_effectiveness,
        rating_count,
        solution_fields,
        typical_application,
        contraindications,
        notes,
        solution_variants!implementation_id (
          id,
          variant_name,
          amount,
          unit,
          form,
          is_default,
          solutions (
            id,
            title,
            description,
            solution_category,
            solution_model,
            parent_concept,
            source_type,
            is_approved
          )
        )
      `)
      .eq('goal_id', calmAnxietyGoal.id)
      .eq('solution_variants.solutions.is_approved', true)
      .order('avg_effectiveness', { ascending: false })
      .limit(10);

    if (linksError) {
      console.error('Error fetching solutions:', linksError);
      return;
    }

    console.log(`Found ${goalLinks.length} solutions\n`);
    console.log('='.repeat(80));

    // Display detailed information for each solution
    goalLinks.forEach((link, index) => {
      const variant = link.solution_variants;
      const solution = variant.solutions;
      
      console.log(`\n${index + 1}. ${solution.title}`);
      console.log('-'.repeat(40));
      console.log(`Category: ${solution.solution_category}`);
      console.log(`Effectiveness Rating: ${link.avg_effectiveness || 'Not rated'}`);
      console.log(`Number of Ratings: ${link.rating_count || 0}`);
      console.log(`Source Type: ${solution.source_type}`);
      
      if (variant.variant_name !== 'Standard') {
        console.log(`\nVariant: ${variant.variant_name}`);
        if (variant.amount) console.log(`Amount: ${variant.amount}${variant.unit || ''}`);
        if (variant.form) console.log(`Form: ${variant.form}`);
      }
      
      if (link.solution_fields && Object.keys(link.solution_fields).length > 0) {
        console.log('\nSolution Fields:');
        Object.entries(link.solution_fields).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            console.log(`  ${key}: ${JSON.stringify(value)}`);
          }
        });
      }
      
      if (link.typical_application) {
        console.log(`\nTypical Application: ${link.typical_application}`);
      }
      
      if (link.contraindications) {
        console.log(`Contraindications: ${link.contraindications}`);
      }
      
      if (link.notes) {
        console.log(`Notes: ${link.notes}`);
      }
      
      if (solution.description) {
        console.log(`\nDescription: ${solution.description}`);
      }
      
      console.log('\n' + '='.repeat(80));
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

findAnxietyGoalAndSolutions();