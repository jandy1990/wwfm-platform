#!/usr/bin/env tsx

/**
 * COMPREHENSIVE ERROR AUDIT SCRIPT
 * Systematically documents every data quality issue in the anxiety goal
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Expected field structures from form dropdown options
const FIELD_VALIDATIONS = {
  frequency: [
    'As needed', 'Once daily', 'Twice daily', 'Three times daily',
    '2-3 times per week', 'Weekly', 'Monthly'
  ],
  length_of_use: [
    'Less than 1 week', '1-2 weeks', '2-4 weeks', '1-3 months',
    '3-6 months', '6-12 months', 'More than 1 year'
  ],
  time_commitment: [
    '5-10 minutes', '10-30 minutes', '30-60 minutes',
    '1-2 hours', '2+ hours'
  ],
  time_to_results: [
    'Immediate', 'Within days', '1-2 weeks', '2-4 weeks',
    '1-3 months', '3-6 months', 'Ongoing'
  ],
  format: [
    'Physical book', 'E-book', 'Audiobook', 'Online course', 'Video series'
  ],
  learning_difficulty: [
    'Beginner-friendly', 'Intermediate', 'Advanced', 'Expert level'
  ]
};

// Category-specific required fields (from GoalPageClient.tsx)
const CATEGORY_REQUIRED_FIELDS = {
  'medications': ['frequency', 'length_of_use', 'cost', 'time_to_results', 'side_effects'],
  'supplements_vitamins': ['frequency', 'length_of_use', 'cost', 'time_to_results', 'side_effects'],
  'natural_remedies': ['frequency', 'length_of_use', 'cost', 'time_to_results', 'side_effects'],
  'beauty_skincare': ['skincare_frequency', 'length_of_use', 'cost', 'time_to_results', 'side_effects'],
  'meditation_mindfulness': ['practice_length', 'frequency', 'time_to_results'],
  'exercise_movement': ['frequency', 'cost', 'time_to_results'],
  'habits_routines': ['time_commitment', 'cost', 'time_to_results'],
  'books_courses': ['format', 'learning_difficulty', 'cost', 'time_to_results'],
  'apps_software': ['usage_frequency', 'subscription_type', 'cost', 'time_to_results'],
  'therapists_counselors': ['session_frequency', 'session_length', 'cost', 'time_to_results'],
  'coaches_mentors': ['session_frequency', 'session_length', 'cost', 'time_to_results'],
  'alternative_practitioners': ['session_frequency', 'session_length', 'cost', 'time_to_results'],
  'doctors_specialists': ['session_frequency', 'wait_time', 'cost', 'time_to_results'],
  'medical_procedures': ['session_frequency', 'wait_time', 'cost', 'time_to_results'],
  'crisis_resources': ['response_time', 'cost', 'time_to_results'],
  'diet_nutrition': ['weekly_prep_time', 'still_following', 'cost', 'time_to_results'],
  'sleep': ['sleep_quality_change', 'still_following', 'cost', 'time_to_results'],
  'products_devices': ['ease_of_use', 'product_type', 'cost', 'time_to_results'],
  'hobbies_activities': ['time_commitment', 'frequency', 'cost', 'time_to_results'],
  'groups_communities': ['meeting_frequency', 'group_size', 'cost', 'time_to_results'],
  'financial_products': ['financial_benefit', 'access_time', 'cost', 'time_to_results'],
  'professional_services': ['session_frequency', 'session_length', 'cost', 'time_to_results']
};

interface ErrorReport {
  solution_name: string;
  category: string;
  errors: string[];
}

async function auditAllErrors(): Promise<void> {
  console.log('🔍 COMPREHENSIVE ERROR AUDIT STARTING...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Get all solutions for anxiety goal
  const { data: links, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      aggregated_fields,
      implementations!inner (
        name,
        category
      )
    `)
    .eq('goal_id', '56e2801e-0d78-4abd-a795-869e5b780ae7');

  if (error) {
    console.error('❌ Database query failed:', error);
    return;
  }

  if (!links) {
    console.error('❌ No data found');
    return;
  }

  console.log(`📊 Found ${links.length} solutions to audit`);
  console.log('');

  const errorReports: ErrorReport[] = [];
  let totalErrorCount = 0;

  for (const link of links) {
    const solution = link.implementations;
    const fields = link.aggregated_fields as any;
    const errors: string[] = [];

    if (!solution || !fields) {
      errors.push('Missing solution or field data');
      continue;
    }

    const requiredFields = CATEGORY_REQUIRED_FIELDS[solution.category as keyof typeof CATEGORY_REQUIRED_FIELDS];

    if (!requiredFields) {
      errors.push(`Unknown category: ${solution.category}`);
      continue;
    }

    // Check for missing required fields
    for (const fieldName of requiredFields) {
      if (!fields[fieldName]) {
        errors.push(`MISSING FIELD: ${fieldName}`);
      }
    }

    // Check each field for data quality issues
    for (const [fieldName, fieldData] of Object.entries(fields)) {
      if (!fieldData || typeof fieldData !== 'object') continue;

      const data = fieldData as any;

      // Check for duplicate values
      if (data.values && Array.isArray(data.values)) {
        const values = data.values.map((v: any) => v.value);
        const uniqueValues = [...new Set(values)];

        if (values.length !== uniqueValues.length) {
          const duplicates = values.filter((v: any, i: number) => values.indexOf(v) !== i);
          errors.push(`DUPLICATE VALUES in ${fieldName}: ${duplicates.join(', ')}`);
        }

        // Check for case issues
        for (const value of values) {
          if (typeof value === 'string') {
            if (value !== value.trim()) {
              errors.push(`WHITESPACE in ${fieldName}: "${value}"`);
            }
            if (value.toLowerCase() === value && value.length > 2) {
              errors.push(`LOWERCASE in ${fieldName}: "${value}"`);
            }
          }
        }

        // Check for invalid dropdown values
        if (FIELD_VALIDATIONS[fieldName as keyof typeof FIELD_VALIDATIONS]) {
          const validValues = FIELD_VALIDATIONS[fieldName as keyof typeof FIELD_VALIDATIONS];
          for (const value of values) {
            if (!validValues.includes(value)) {
              errors.push(`INVALID VALUE in ${fieldName}: "${value}"`);
            }
          }
        }

        // Check for single 100% distributions
        if (data.values.length === 1 && data.values[0].percentage === 100) {
          errors.push(`SINGLE 100% VALUE in ${fieldName}: "${data.values[0].value}"`);
        }

        // Check for identical percentages (suspicious)
        const percentages = data.values.map((v: any) => v.percentage);
        const uniquePercentages = [...new Set(percentages)];
        if (percentages.length > 2 && uniquePercentages.length === 1) {
          errors.push(`IDENTICAL PERCENTAGES in ${fieldName}: all ${percentages[0]}%`);
        }
      }

      // Check for [Object Object] issues (string fields not converted)
      if (typeof fieldData === 'string') {
        errors.push(`STRING FIELD (not DistributionData): ${fieldName} = "${fieldData}"`);
      }
    }

    if (errors.length > 0) {
      errorReports.push({
        solution_name: solution.name,
        category: solution.category,
        errors
      });
      totalErrorCount += errors.length;
    }
  }

  // Output comprehensive report
  console.log(`🚨 TOTAL ERRORS FOUND: ${totalErrorCount} across ${errorReports.length} solutions`);
  console.log('');

  if (errorReports.length === 0) {
    console.log('✅ No errors found - all data quality checks passed!');
    return;
  }

  // Group by error type for summary
  const errorTypeCounts: Record<string, number> = {};

  errorReports.forEach(report => {
    console.log(`❌ ${report.solution_name} (${report.category})`);
    report.errors.forEach(error => {
      console.log(`   • ${error}`);

      // Count error types
      const errorType = error.split(':')[0];
      errorTypeCounts[errorType] = (errorTypeCounts[errorType] || 0) + 1;
    });
    console.log('');
  });

  // Error type summary
  console.log('📊 ERROR TYPE SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Object.entries(errorTypeCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`${type}: ${count} occurrences`);
    });

  console.log('');
  console.log('🔧 RECOMMENDATIONS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Complete rebuild of field generation system required');
  console.log('2. Implement proper value deduplication');
  console.log('3. Add case normalization');
  console.log('4. Ensure all required fields are generated');
  console.log('5. Add validation against form dropdown options');
  console.log('6. Fix DistributionData conversion for string fields');
}

// Run the audit
auditAllErrors().catch(console.error);