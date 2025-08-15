#!/usr/bin/env node

/**
 * Complete Test Fixture Setup Script
 * 
 * This script creates ALL necessary test fixtures for E2E testing:
 * 1. Creates 23 test solutions (one for each category)
 * 2. Creates variants for each solution
 * 3. Links all solutions to the test goal
 * 4. Verifies everything is set up correctly
 * 
 * Run this before running tests: node tests/setup/setup-test-fixtures.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.test.local' });

// Initialize Supabase client with service key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Test goal ID (Reduce anxiety)
const TEST_GOAL_ID = process.env.TEST_GOAL_ID || '56e2801e-0d78-4abd-a795-869e5b780ae7';

// Define all test fixtures with their categories and variants
const TEST_FIXTURES = [
  { title: 'Headspace (Test)', category: 'apps_software', variant: 'Standard' },
  { title: 'Prozac (Test)', category: 'medications', variant: '20mg tablet', dosage: { amount: 20, unit: 'mg', form: 'tablet' } },
  { title: 'Vitamin D (Test)', category: 'supplements_vitamins', variant: '1000IU softgel', dosage: { amount: 1000, unit: 'IU', form: 'softgel' } },
  { title: 'Lavender Oil (Test)', category: 'natural_remedies', variant: '5 drops oil', dosage: { amount: 5, unit: 'drops', form: 'oil' } },
  { title: 'Retinol Cream (Test)', category: 'beauty_skincare', variant: 'Standard' },
  { title: 'Running (Test)', category: 'exercise_movement', variant: 'Standard' },
  { title: 'Mindfulness Meditation (Test)', category: 'meditation_mindfulness', variant: 'Standard' },
  { title: 'Morning Routine (Test)', category: 'habits_routines', variant: 'Standard' },
  { title: 'CBT Therapy (Test)', category: 'therapists_counselors', variant: 'Standard' },
  { title: 'Psychiatrist (Test)', category: 'doctors_specialists', variant: 'Standard' },
  { title: 'Life Coach (Test)', category: 'coaches_mentors', variant: 'Standard' },
  { title: 'Acupuncture (Test)', category: 'alternative_practitioners', variant: 'Standard' },
  { title: 'Financial Advisor (Test)', category: 'professional_services', variant: 'Standard' },
  { title: 'Physical Therapy (Test)', category: 'medical_procedures', variant: 'Standard' },
  { title: 'Crisis Hotline (Test)', category: 'crisis_resources', variant: 'Standard' },
  { title: 'Fitbit (Test)', category: 'products_devices', variant: 'Standard' },
  { title: 'Cognitive Therapy Book (Test)', category: 'books_courses', variant: 'Standard' },
  { title: 'Anxiety Support Group (Test)', category: 'support_groups', variant: 'Standard' },
  { title: 'Running Club (Test)', category: 'groups_communities', variant: 'Standard' },
  { title: 'Mediterranean Diet (Test)', category: 'diet_nutrition', variant: 'Standard' },
  { title: 'Sleep Hygiene (Test)', category: 'sleep', variant: 'Standard' },
  { title: 'Painting (Test)', category: 'hobbies_activities', variant: 'Standard' },
  { title: 'High Yield Savings (Test)', category: 'financial_products', variant: 'Standard' }
];

async function setupTestFixtures() {
  console.log('🚀 Setting up test fixtures for E2E testing...\n');
  
  try {
    // Step 1: Clean up existing test fixtures
    console.log('🧹 Step 1: Cleaning up existing test fixtures...');
    await cleanupExistingFixtures();
    
    // Step 2: Create test solutions
    console.log('\n✨ Step 2: Creating test solutions...');
    const solutionMap = await createTestSolutions();
    
    // Step 3: Create variants for each solution
    console.log('\n📦 Step 3: Creating solution variants...');
    const variantMap = await createSolutionVariants(solutionMap);
    
    // Step 4: Link solutions to test goal
    console.log('\n🔗 Step 4: Linking solutions to test goal...');
    await linkSolutionsToGoal(variantMap);
    
    // Step 5: Verify setup
    console.log('\n✅ Step 5: Verifying setup...');
    await verifySetup();
    
    console.log('\n🎉 Test fixtures setup complete!');
    console.log('You can now run: npm run test:forms');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function cleanupExistingFixtures() {
  // First, remove any existing goal links for test fixtures
  const { data: existingSolutions } = await supabase
    .from('solutions')
    .select('id')
    .eq('source_type', 'test_fixture');
  
  if (existingSolutions && existingSolutions.length > 0) {
    const solutionIds = existingSolutions.map(s => s.id);
    
    // Get all variant IDs for these solutions
    const { data: variants } = await supabase
      .from('solution_variants')
      .select('id')
      .in('solution_id', solutionIds);
    
    if (variants && variants.length > 0) {
      const variantIds = variants.map(v => v.id);
      
      // Delete goal links
      await supabase
        .from('goal_implementation_links')
        .delete()
        .in('implementation_id', variantIds);
      
      // Delete variants
      await supabase
        .from('solution_variants')
        .delete()
        .in('solution_id', solutionIds);
    }
    
    // Delete solutions
    await supabase
      .from('solutions')
      .delete()
      .eq('source_type', 'test_fixture');
    
    console.log(`  Cleaned up ${existingSolutions.length} existing test fixtures`);
  } else {
    console.log('  No existing test fixtures to clean up');
  }
}

async function createTestSolutions() {
  const solutionMap = new Map();
  let created = 0;
  let failed = 0;
  
  for (const fixture of TEST_FIXTURES) {
    const { data, error } = await supabase
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
    
    if (error) {
      console.error(`  ❌ Failed to create ${fixture.title}:`, error.message);
      failed++;
    } else {
      solutionMap.set(fixture.title, data.id);
      created++;
      console.log(`  ✅ Created: ${fixture.title}`);
    }
  }
  
  console.log(`  Summary: ${created} created, ${failed} failed`);
  
  if (failed > 0) {
    throw new Error(`Failed to create ${failed} solutions`);
  }
  
  return solutionMap;
}

async function createSolutionVariants(solutionMap) {
  const variantMap = new Map();
  let created = 0;
  let failed = 0;
  
  for (const fixture of TEST_FIXTURES) {
    const solutionId = solutionMap.get(fixture.title);
    if (!solutionId) continue;
    
    const variantData = {
      solution_id: solutionId,
      variant_name: fixture.variant,
      is_default: true
    };
    
    // Add dosage info if present
    if (fixture.dosage) {
      variantData.amount = fixture.dosage.amount;
      variantData.unit = fixture.dosage.unit;
      variantData.form = fixture.dosage.form;
    }
    
    const { data, error } = await supabase
      .from('solution_variants')
      .insert(variantData)
      .select()
      .single();
    
    if (error) {
      console.error(`  ❌ Failed to create variant for ${fixture.title}:`, error.message);
      failed++;
    } else {
      variantMap.set(fixture.title, data.id);
      created++;
      console.log(`  ✅ Created variant: ${fixture.variant} for ${fixture.title}`);
    }
  }
  
  console.log(`  Summary: ${created} variants created, ${failed} failed`);
  
  if (failed > 0) {
    throw new Error(`Failed to create ${failed} variants`);
  }
  
  return variantMap;
}

async function linkSolutionsToGoal(variantMap) {
  let linked = 0;
  let failed = 0;
  
  // Create all links in a batch
  const links = Array.from(variantMap.entries()).map(([title, variantId]) => ({
    goal_id: TEST_GOAL_ID,
    implementation_id: variantId,
    avg_effectiveness: 4.0,
    rating_count: 1,
    solution_fields: {}
  }));
  
  const { data, error } = await supabase
    .from('goal_implementation_links')
    .insert(links)
    .select();
  
  if (error) {
    console.error('  ❌ Failed to create goal links:', error.message);
    throw new Error('Failed to link solutions to goal');
  }
  
  console.log(`  ✅ Linked ${data.length} solutions to test goal`);
}

async function verifySetup() {
  // Check that all fixtures exist, are approved, have variants, and are linked to goal
  const { data: verification } = await supabase
    .from('solutions')
    .select(`
      title,
      solution_category,
      is_approved,
      solution_variants!inner(
        id,
        variant_name,
        goal_implementation_links!inner(
          goal_id,
          avg_effectiveness
        )
      )
    `)
    .eq('source_type', 'test_fixture')
    .eq('solution_variants.goal_implementation_links.goal_id', TEST_GOAL_ID);
  
  if (!verification || verification.length !== 23) {
    console.error(`  ❌ Verification failed: Expected 23 fixtures, found ${verification?.length || 0}`);
    
    // Detailed check to find what's missing
    const { data: allFixtures } = await supabase
      .from('solutions')
      .select('title, is_approved')
      .eq('source_type', 'test_fixture');
    
    console.log('\n  Fixture status:');
    for (const fixture of allFixtures || []) {
      console.log(`    - ${fixture.title}: approved=${fixture.is_approved}`);
    }
    
    throw new Error('Setup verification failed');
  }
  
  console.log(`  ✅ All 23 test fixtures are properly set up:`);
  console.log(`     - All approved`);
  console.log(`     - All have variants`);
  console.log(`     - All linked to test goal`);
  console.log(`     - All have effectiveness ratings`);
}

// Run the setup
setupTestFixtures().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});