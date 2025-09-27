#!/usr/bin/env node

/**
 * COMPREHENSIVE SOLUTION-BY-SOLUTION DATA QUALITY AUDIT
 *
 * Analyzes all 140 anxiety goal solutions for:
 * 1. Data completeness (required fields for category)
 * 2. Data quality (single-value 100% issues)
 * 3. Percentage distributions for side effects/challenges/barriers
 * 4. Diet solutions still_following field issues
 */

import { createClient } from '@supabase/supabase-js';

// Category field requirements (based on GoalPageClient.tsx patterns)
const CATEGORY_REQUIREMENTS = {
  // Session-based categories
  'therapists_counselors': ['session_frequency', 'session_length', 'cost', 'time_to_results', 'challenges'],
  'coaches_mentors': ['session_frequency', 'session_length', 'cost', 'time_to_results', 'challenges'],
  'alternative_practitioners': ['session_frequency', 'session_length', 'cost', 'time_to_results', 'side_effects'],

  // Medical categories
  'doctors_specialists': ['session_frequency', 'wait_time', 'cost', 'time_to_results', 'challenges'],
  'medical_procedures': ['session_frequency', 'wait_time', 'cost', 'time_to_results', 'side_effects'],
  'crisis_resources': ['response_time', 'cost', 'time_to_results'],

  // Practice categories
  'meditation_mindfulness': ['practice_length', 'frequency', 'time_to_results', 'challenges'],
  'exercise_movement': ['frequency', 'cost', 'time_to_results', 'challenges'],
  'habits_routines': ['time_commitment', 'cost', 'time_to_results', 'challenges'],

  // Dosage categories
  'medications': ['frequency', 'length_of_use', 'cost', 'time_to_results', 'side_effects'],
  'supplements_vitamins': ['frequency', 'length_of_use', 'cost', 'time_to_results', 'side_effects'],
  'natural_remedies': ['frequency', 'length_of_use', 'cost', 'time_to_results', 'side_effects'],
  'beauty_skincare': ['skincare_frequency', 'length_of_use', 'cost', 'time_to_results', 'side_effects'],

  // Other categories
  'books_courses': ['format', 'learning_difficulty', 'cost', 'time_to_results', 'challenges'],
  'apps_software': ['usage_frequency', 'subscription_type', 'cost', 'time_to_results', 'challenges'],
  'diet_nutrition': ['weekly_prep_time', 'still_following', 'cost', 'time_to_results', 'challenges'],
  'sleep': ['previous_sleep_hours', 'still_following', 'cost', 'time_to_results', 'challenges'],
  'products_devices': ['ease_of_use', 'product_type', 'cost', 'time_to_results', 'challenges'],
  'hobbies_activities': ['time_commitment', 'frequency', 'cost', 'time_to_results', 'challenges'],
  'groups_communities': ['meeting_frequency', 'group_size', 'cost', 'time_to_results', 'challenges'],
  'financial_products': ['financial_benefit', 'access_time', 'time_to_results', 'challenges'],
  'professional_services': ['session_frequency', 'specialty', 'cost', 'time_to_results', 'challenges']
};

// Special fields that should have percentage distributions
const PERCENTAGE_FIELDS = ['side_effects', 'challenges', 'barriers'];

// Initialize Supabase (you'll need to add your credentials)
const supabaseUrl = process.env.SUPABASE_URL || 'https://wqxkhxdbxdtpuvuvgirx.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

class SolutionAuditor {
  constructor() {
    this.anxietyGoalId = '56e2801e-0d78-4abd-a795-869e5b780ae7';
    this.results = {
      criticalIssues: [],
      dataQualityIssues: [],
      missingFields: [],
      singleValueIssues: [],
      dietIssues: [],
      summary: {
        totalSolutions: 0,
        completelyBroken: 0,
        missingFields: 0,
        qualityIssues: 0,
        perfectSolutions: 0
      }
    };
  }

  async run() {
    console.log('🚀 Starting comprehensive solution audit...\n');

    const solutions = await this.getAllSolutions();
    this.results.summary.totalSolutions = solutions.length;

    for (const solution of solutions) {
      await this.auditSolution(solution);
    }

    this.generateReport();
  }

  async getAllSolutions() {
    const { data, error } = await supabase
      .from('goal_implementation_links')
      .select(`
        implementation_id,
        aggregated_fields,
        solution_variants(
          solutions(title, solution_category)
        )
      `)
      .eq('goal_id', this.anxietyGoalId);

    if (error) throw error;

    return data.map(item => ({
      title: item.solution_variants.solutions.title,
      category: item.solution_variants.solutions.solution_category,
      implementation_id: item.implementation_id,
      aggregated_fields: item.aggregated_fields || {}
    }));
  }

  async auditSolution(solution) {
    const issues = [];
    const { title, category, aggregated_fields } = solution;

    console.log(`🔍 Auditing: ${title} (${category})`);

    // 1. Check data completeness
    const completenessIssues = this.checkDataCompleteness(solution);
    issues.push(...completenessIssues);

    // 2. Check data quality within fields
    const qualityIssues = this.checkDataQuality(solution);
    issues.push(...qualityIssues);

    // 3. Check percentage distributions
    const percentageIssues = this.checkPercentageDistributions(solution);
    issues.push(...percentageIssues);

    // 4. Check diet-specific issues
    if (category === 'diet_nutrition') {
      const dietIssues = this.checkDietSpecificIssues(solution);
      issues.push(...dietIssues);
    }

    // Categorize solution
    this.categorizeSolution(solution, issues);
  }

  checkDataCompleteness(solution) {
    const { title, category, aggregated_fields } = solution;
    const requiredFields = CATEGORY_REQUIREMENTS[category] || [];
    const existingFields = Object.keys(aggregated_fields);
    const missingFields = requiredFields.filter(field => !existingFields.includes(field));

    const issues = [];

    if (missingFields.length > 0) {
      const severity = missingFields.length >= requiredFields.length * 0.5 ? 'CRITICAL' : 'HIGH';
      issues.push({
        type: 'MISSING_FIELDS',
        severity,
        title,
        category,
        missing: missingFields,
        has: existingFields,
        message: `Missing ${missingFields.length}/${requiredFields.length} required fields: ${missingFields.join(', ')}`
      });
    }

    return issues;
  }

  checkDataQuality(solution) {
    const { title, category, aggregated_fields } = solution;
    const issues = [];

    for (const [fieldName, fieldData] of Object.entries(aggregated_fields)) {
      // Skip metadata fields
      if (fieldName === '_metadata') continue;

      // Check if field is a string (should be DistributionData)
      if (typeof fieldData === 'string') {
        issues.push({
          type: 'STRING_FIELD',
          severity: 'HIGH',
          title,
          category,
          field: fieldName,
          value: fieldData,
          message: `Field '${fieldName}' is string "${fieldData}" instead of DistributionData object`
        });
        continue;
      }

      // Check if field has proper structure
      if (!fieldData.values || !Array.isArray(fieldData.values)) {
        issues.push({
          type: 'INVALID_STRUCTURE',
          severity: 'HIGH',
          title,
          category,
          field: fieldName,
          message: `Field '${fieldName}' missing values array`
        });
        continue;
      }

      // Check for single-value 100% issues
      if (fieldData.values.length === 1 && fieldData.values[0].percentage === 100) {
        issues.push({
          type: 'SINGLE_VALUE_100',
          severity: 'MEDIUM',
          title,
          category,
          field: fieldName,
          value: fieldData.values[0].value,
          message: `Field '${fieldName}' has single value at 100%: "${fieldData.values[0].value}"`
        });
      }

      // Check for insufficient diversity (less than 3 options)
      if (fieldData.values.length < 3) {
        issues.push({
          type: 'LOW_DIVERSITY',
          severity: 'MEDIUM',
          title,
          category,
          field: fieldName,
          optionCount: fieldData.values.length,
          message: `Field '${fieldName}' has only ${fieldData.values.length} options (should have 3+)`
        });
      }

      // Check for fallback sources (trash data)
      const hasFallbackSources = fieldData.values.some(v =>
        v.source && (v.source.includes('fallback') || v.source.includes('equal_'))
      );

      if (hasFallbackSources) {
        issues.push({
          type: 'FALLBACK_SOURCES',
          severity: 'HIGH',
          title,
          category,
          field: fieldName,
          message: `Field '${fieldName}' has fallback/mechanistic sources (trash data)`
        });
      }
    }

    return issues;
  }

  checkPercentageDistributions(solution) {
    const { title, category, aggregated_fields } = solution;
    const issues = [];

    // Check specific fields that should have good percentage distributions
    for (const fieldName of PERCENTAGE_FIELDS) {
      if (!aggregated_fields[fieldName]) continue;

      const fieldData = aggregated_fields[fieldName];
      if (!fieldData.values || !Array.isArray(fieldData.values)) continue;

      // Check if percentages are too concentrated (one option >80%)
      const maxPercentage = Math.max(...fieldData.values.map(v => v.percentage || 0));
      if (maxPercentage > 80) {
        issues.push({
          type: 'CONCENTRATED_DISTRIBUTION',
          severity: 'MEDIUM',
          title,
          category,
          field: fieldName,
          maxPercentage,
          message: `Field '${fieldName}' has concentrated distribution (${maxPercentage}% in one option)`
        });
      }
    }

    return issues;
  }

  checkDietSpecificIssues(solution) {
    const { title, aggregated_fields } = solution;
    const issues = [];

    // Check still_following field specifically
    const stillFollowing = aggregated_fields.still_following;
    if (stillFollowing && stillFollowing.values) {
      // Check for the "0% still following at 100%" issue
      const zeroFollowingAt100 = stillFollowing.values.find(v =>
        v.value.toLowerCase().includes('no') ||
        v.value.toLowerCase().includes('stopped') ||
        v.value === '0'
      );

      if (zeroFollowingAt100 && zeroFollowingAt100.percentage === 100) {
        issues.push({
          type: 'DIET_STILL_FOLLOWING_BROKEN',
          severity: 'HIGH',
          title,
          field: 'still_following',
          message: `still_following field shows "${zeroFollowingAt100.value}" at 100%`
        });
      }

      // Check if only has 1-2 options (should have 3-4 for diet adherence)
      if (stillFollowing.values.length < 3) {
        issues.push({
          type: 'DIET_ADHERENCE_LOW_OPTIONS',
          severity: 'MEDIUM',
          title,
          field: 'still_following',
          optionCount: stillFollowing.values.length,
          message: `still_following field has only ${stillFollowing.values.length} options (should have 3-4)`
        });
      }
    }

    return issues;
  }

  categorizeSolution(solution, issues) {
    const { title } = solution;
    const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
    const highIssues = issues.filter(i => i.severity === 'HIGH');

    if (criticalIssues.length > 0) {
      this.results.summary.completelyBroken++;
      this.results.criticalIssues.push({ title, issues: criticalIssues });
    } else if (highIssues.length > 0) {
      this.results.summary.missingFields++;
      this.results.missingFields.push({ title, issues: highIssues });
    } else if (issues.length > 0) {
      this.results.summary.qualityIssues++;
      this.results.dataQualityIssues.push({ title, issues });
    } else {
      this.results.summary.perfectSolutions++;
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 COMPREHENSIVE SOLUTION AUDIT REPORT');
    console.log('='.repeat(80));

    const { summary } = this.results;
    console.log(`\n📊 SUMMARY:`);
    console.log(`Total Solutions: ${summary.totalSolutions}`);
    console.log(`🔴 Completely Broken: ${summary.completelyBroken}`);
    console.log(`🟡 Missing Fields: ${summary.missingFields}`);
    console.log(`🟠 Data Quality Issues: ${summary.qualityIssues}`);
    console.log(`🟢 Perfect Solutions: ${summary.perfectSolutions}`);

    // Critical Issues
    if (this.results.criticalIssues.length > 0) {
      console.log(`\n🚨 CRITICAL ISSUES (${this.results.criticalIssues.length}):`);
      this.results.criticalIssues.forEach(item => {
        console.log(`\n❌ ${item.title}:`);
        item.issues.forEach(issue => {
          console.log(`   ${issue.message}`);
        });
      });
    }

    // High Priority Issues
    if (this.results.missingFields.length > 0) {
      console.log(`\n⚠️  HIGH PRIORITY ISSUES (${this.results.missingFields.length}):`);
      this.results.missingFields.forEach(item => {
        console.log(`\n🔸 ${item.title}:`);
        item.issues.forEach(issue => {
          console.log(`   ${issue.message}`);
        });
      });
    }

    // Data Quality Issues
    if (this.results.dataQualityIssues.length > 0 && this.results.dataQualityIssues.length <= 10) {
      console.log(`\n🔧 DATA QUALITY ISSUES (${this.results.dataQualityIssues.length}):`);
      this.results.dataQualityIssues.forEach(item => {
        console.log(`\n🔹 ${item.title}:`);
        item.issues.forEach(issue => {
          console.log(`   ${issue.message}`);
        });
      });
    } else if (this.results.dataQualityIssues.length > 10) {
      console.log(`\n🔧 DATA QUALITY ISSUES (${this.results.dataQualityIssues.length} - showing first 10):`);
      this.results.dataQualityIssues.slice(0, 10).forEach(item => {
        console.log(`\n🔹 ${item.title}:`);
        item.issues.forEach(issue => {
          console.log(`   ${issue.message}`);
        });
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Audit Complete!');
    console.log('='.repeat(80));
  }
}

// Run the audit
const auditor = new SolutionAuditor();
auditor.run().catch(console.error);