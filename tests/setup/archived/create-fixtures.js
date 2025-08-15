#!/usr/bin/env node

// Script to create all test fixtures in the database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.test.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const testFixtures = [
  { title: 'Headspace (Test)', category: 'apps_software' },
  { title: 'Prozac (Test)', category: 'medications', variant: '20mg tablet', dosage: { amount: 20, unit: 'mg', form: 'tablet' } },
  { title: 'Vitamin D (Test)', category: 'supplements_vitamins', variant: '1000IU softgel', dosage: { amount: 1000, unit: 'IU', form: 'softgel' } },
  { title: 'Lavender Oil (Test)', category: 'natural_remedies', variant: '5 drops oil', dosage: { amount: 5, unit: 'drops', form: 'oil' } },
  { title: 'Retinol Cream (Test)', category: 'beauty_skincare' },
  { title: 'Running (Test)', category: 'exercise_movement' },
  { title: 'Mindfulness Meditation (Test)', category: 'meditation_mindfulness' },
  { title: 'Morning Routine (Test)', category: 'habits_routines' },
  { title: 'CBT Therapy (Test)', category: 'therapists_counselors' },
  { title: 'Psychiatrist (Test)', category: 'doctors_specialists' },
  { title: 'Life Coach (Test)', category: 'coaches_mentors' },
  { title: 'Acupuncture (Test)', category: 'alternative_practitioners' },
  { title: 'Financial Advisor (Test)', category: 'professional_services' },
  { title: 'Physical Therapy (Test)', category: 'medical_procedures' },
  { title: 'Crisis Hotline (Test)', category: 'crisis_resources' },
  { title: 'Fitbit (Test)', category: 'products_devices' },
  { title: 'Cognitive Therapy Book (Test)', category: 'books_courses' },
  { title: 'Anxiety Support Group (Test)', category: 'support_groups' },
  { title: 'Running Club (Test)', category: 'groups_communities' },
  { title: 'Mediterranean Diet (Test)', category: 'diet_nutrition' },
  { title: 'Sleep Hygiene (Test)', category: 'sleep' },
  { title: 'Painting (Test)', category: 'hobbies_activities' },
  { title: 'High Yield Savings (Test)', category: 'financial_products' }
];

async function createTestFixtures() {
  console.log('🚀 Creating test fixtures...\n');

  // First, clean up any existing test fixtures
  console.log('🧹 Cleaning up existing test fixtures...');
  
  // Get existing test fixture solutions
  const { data: existingSolutions } = await supabase
    .from('solutions')
    .select('id')
    .eq('source_type', 'test_fixture');

  if (existingSolutions && existingSolutions.length > 0) {
    const solutionIds = existingSolutions.map(s => s.id);
    
    // Delete variants first (foreign key constraint)
    await supabase
      .from('solution_variants')
      .delete()
      .in('solution_id', solutionIds);
    
    // Then delete solutions
    await supabase
      .from('solutions')
      .delete()
      .eq('source_type', 'test_fixture');
    
    console.log(`Deleted ${existingSolutions.length} existing test fixtures\n`);
  }

  // Create new test fixtures
  console.log('✨ Creating new test fixtures...\n');
  
  let created = 0;
  let failed = 0;

  for (const fixture of testFixtures) {
    try {
      // Create the solution
      const { data: solution, error: solutionError } = await supabase
        .from('solutions')
        .insert({
          title: fixture.title,
          solution_category: fixture.category,
          source_type: 'test_fixture',
          is_approved: true,
          created_by: '00000000-0000-0000-0000-000000000000'
        })
        .select()
        .single();

      if (solutionError) {
        console.error(`❌ Failed to create ${fixture.title}:`, solutionError.message);
        failed++;
        continue;
      }

      // Create the variant
      const variantData = {
        solution_id: solution.id,
        variant_name: fixture.variant || 'Standard',
        is_primary: true
      };

      // Add dosage info if present
      if (fixture.dosage) {
        variantData.dosage_amount = fixture.dosage.amount;
        variantData.dosage_unit = fixture.dosage.unit;
        variantData.dosage_form = fixture.dosage.form;
      }

      const { error: variantError } = await supabase
        .from('solution_variants')
        .insert(variantData);

      if (variantError) {
        console.error(`❌ Failed to create variant for ${fixture.title}:`, variantError.message);
        failed++;
        continue;
      }

      console.log(`✅ Created: ${fixture.title}`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating ${fixture.title}:`, error.message);
      failed++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Created: ${created} fixtures`);
  if (failed > 0) {
    console.log(`   ❌ Failed: ${failed} fixtures`);
  }

  // Verify the setup
  const { data: finalCheck, error: checkError } = await supabase
    .from('solutions')
    .select('title, solution_category, is_approved')
    .eq('source_type', 'test_fixture')
    .order('solution_category');

  if (checkError) {
    console.error('\n❌ Error verifying fixtures:', checkError.message);
    process.exit(1);
  }

  console.log(`\n✨ Test fixtures ready! Found ${finalCheck.length} fixtures in database.`);
  
  if (finalCheck.length === 23) {
    console.log('✅ All 23 test fixtures are properly set up!');
    console.log('\nYou can now run: npm run test:forms');
  } else {
    console.log(`⚠️  Expected 23 fixtures but found ${finalCheck.length}`);
    console.log('Some fixtures may have failed to create.');
  }
}

createTestFixtures().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});