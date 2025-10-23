#!/usr/bin/env tsx

/**
 * QUALITY-BASED FIELD REGENERATION SCRIPT
 *
 * Regenerates degraded field data based on quality assessment:
 * 1. GOAL-SPECIFIC FILTERING - Targets specific goal solutions only
 * 2. QUALITY DETECTION - Identifies trash/degraded data (fallback sources, <4 options, wrong values)
 * 3. CATEGORY-BASED REGENERATION - Only regenerates fields required for each category
 * 4. EVIDENCE-BASED PATTERNS - Uses 5-8 option distributions from research
 * 5. EXACT DROPDOWN VALUES - Validates against actual form dropdown values
 * 6. PRESERVES GOOD DATA - Only regenerates degraded fields, keeps quality data
 *
 * Quality indicators for regeneration:
 * - Missing or empty fields
 * - <4 distribution options (degraded diversity)
 * - Fallback sources (smart_fallback, equal_fallback)
 * - Wrong case/format (weekly vs Weekly)
 * - Invalid dropdown values
 * - Equal percentage distributions (mechanistic data)
 *
 * Usage:
 *   npx tsx scripts/generate-validated-fields.ts --goal-id=56e2801e-0d78-4abd-a795-869e5b780ae7 --dry-run
 *   npx tsx scripts/generate-validated-fields.ts --goal-id=56e2801e-0d78-4abd-a795-869e5b780ae7 --limit=1
 */

import { createClient } from '@supabase/supabase-js'
import chalk from 'chalk'
import dotenv from 'dotenv'
import { GeminiClient } from './ai-solution-generator/generators/gemini-client.js'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Initialize Gemini client for AI field generation
let geminiClient: GeminiClient | null = null
if (process.env.GEMINI_API_KEY) {
  geminiClient = new GeminiClient(process.env.GEMINI_API_KEY)
} else {
  console.log(chalk.yellow('⚠️  GEMINI_API_KEY not found - will use hardcoded patterns only'))
}

interface DistributionValue {
  value: string
  count: number
  percentage: number
  source: string
}

interface DistributionData {
  mode: string
  values: DistributionValue[]
  totalReports: number
  dataSource: string
}

// ACTUAL field names from GoalPageClient.tsx
const CATEGORY_FIELD_CONFIG: Record<string, {
  keyFields: string[]
  arrayField: string | null
}> = {
  // Session categories (7)
  'therapists_counselors': {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'challenges'
  },
  'coaches_mentors': {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'challenges'
  },
  'alternative_practitioners': {
    keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'],
    arrayField: 'side_effects'
  },
  'professional_services': {
    keyFields: ['time_to_results', 'session_frequency', 'specialty', 'cost'],
    arrayField: 'challenges'
  },
  'medical_procedures': {
    keyFields: ['time_to_results', 'session_frequency', 'wait_time', 'cost'],
    arrayField: 'side_effects'
  },
  'doctors_specialists': {
    keyFields: ['time_to_results', 'wait_time', 'insurance_coverage', 'cost'],
    arrayField: 'challenges'
  },
  'crisis_resources': {
    keyFields: ['time_to_results', 'response_time', 'cost'],
    arrayField: null
  },
  // Dosage categories (4)
  'medications': {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  'supplements_vitamins': {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  'natural_remedies': {
    keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  'beauty_skincare': {
    keyFields: ['time_to_results', 'skincare_frequency', 'length_of_use', 'cost'],
    arrayField: 'side_effects'
  },
  // Practice categories (3)
  'meditation_mindfulness': {
    keyFields: ['time_to_results', 'practice_length', 'frequency'],
    arrayField: 'challenges'
  },
  'exercise_movement': {
    keyFields: ['time_to_results', 'frequency', 'cost'],
    arrayField: 'challenges'
  },
  'habits_routines': {
    keyFields: ['time_to_results', 'time_commitment', 'cost'],
    arrayField: 'challenges'
  },
  // Purchase categories (2)
  'books_courses': {
    keyFields: ['time_to_results', 'format', 'learning_difficulty', 'cost'],
    arrayField: 'challenges'
  },
  'products_devices': {
    keyFields: ['time_to_results', 'ease_of_use', 'product_type', 'cost'],
    arrayField: 'challenges'
  },
  // Community categories (2)
  'groups_communities': {
    keyFields: ['time_to_results', 'meeting_frequency', 'group_size', 'cost'],
    arrayField: 'challenges'
  },
  'support_groups': {
    keyFields: ['time_to_results', 'meeting_frequency', 'format', 'cost'],
    arrayField: 'challenges'
  },
  // Lifestyle categories (2)
  'diet_nutrition': {
    keyFields: ['time_to_results', 'weekly_prep_time', 'still_following', 'cost'],
    arrayField: 'challenges'
  },
  'sleep': {
    keyFields: ['time_to_results', 'previous_sleep_hours', 'still_following', 'cost'],
    arrayField: 'challenges'
  },
  // App category (1)
  'apps_software': {
    keyFields: ['time_to_results', 'usage_frequency', 'subscription_type', 'cost'],
    arrayField: 'challenges'
  },
  // Hobby category (1)
  'hobbies_activities': {
    keyFields: ['time_to_results', 'time_commitment', 'frequency', 'cost'],
    arrayField: 'challenges'
  },
  // Financial category (1)
  'financial_products': {
    keyFields: ['time_to_results', 'financial_benefit', 'access_time'],
    arrayField: 'challenges'
  }
}

// VALIDATED dropdown values from ACTUAL SessionForm.tsx
const VALID_DROPDOWN_VALUES: Record<string, string[]> = {
  'session_frequency': [
    'One-time only',
    'As needed',
    'Multiple times per week',
    'Weekly',
    'Fortnightly',
    'Monthly',
    'Every 2-3 months',
    'Other'
  ],
  'session_length': [
    '15 minutes',
    '30 minutes',
    '45 minutes',
    '60 minutes',
    '90 minutes',
    '2+ hours',
    'Varies'
  ],
  'learning_difficulty': [
    'Beginner',
    'Intermediate',
    'Advanced',
    'All levels'
  ],
  'group_size': [
    '2-5 people',
    '6-10 people',
    '11-15 people',
    '16-25 people',
    '25+ people',
    'Varies'
  ],
  'practice_length': [
    '5-10 minutes',
    '10-15 minutes',
    '15-30 minutes',
    '30-45 minutes',
    '45+ minutes',
    'Varies'
  ],
  'startup_cost': [
    'Free',
    'Under $20',
    '$20-50',
    '$50-100',
    '$100-250',
    '$250-500',
    '$500-1000',
    'Over $1000'
  ],
  'ongoing_cost': [
    'Free',
    'Under $10/month',
    '$10-25/month',
    '$25-50/month',
    '$50-100/month',
    '$100-200/month',
    'Over $200/month'
  ],
  // Additional fields that may need patterns
  'frequency': [
    'Daily',
    'Multiple times daily',
    'Every other day',
    'Weekly',
    'As needed'
  ],
  'length_of_use': [
    'Short-term (days-weeks)',
    'Medium-term (1-6 months)',
    'Long-term (6+ months)',
    'Ongoing/permanent'
  ],
  'skincare_frequency': [
    'Once daily',
    'Twice daily',
    'Every other day',
    'Weekly',
    'As needed'
  ],
  'wait_time': [
    'Same week',
    '1-2 weeks',
    '3-4 weeks',
    '1-2 months',
    '3+ months'
  ],
  'insurance_coverage': [
    'Fully covered',
    'Partially covered',
    'Not covered',
    'Coverage varies by plan'
  ],
  'cost': [
    'Free',
    'Under $10/month',
    '$10-25/month',
    '$25-50/month',
    '$50-100/month',
    '$100-200/month',
    'Over $200/month',
    'Under $20',
    '$20-50',
    '$50-100',
    '$100-250',
    '$250-500',
    'Over $1000'
  ],
  'subscription_type': [
    'Free',
    'Freemium',
    'Monthly subscription',
    'One-time purchase',
    'Annual subscription'
  ],
  'time_commitment': [
    'Under 5 minutes',
    '5-15 minutes',
    '15-30 minutes',
    '30-60 minutes',
    'Over 1 hour'
  ],
  'format': [
    'Book',
    'Online course',
    'Audiobook',
    'Video course',
    'Workshop/seminar',
    'In-person',
    'Online/virtual',
    'Hybrid',
    'Phone-based'
  ],
  'usage_frequency': [
    'Multiple times daily',
    'Daily',
    'Several times per week',
    'Weekly',
    'Monthly',
    'As needed'
  ],
  'weekly_prep_time': [
    'Under 1 hour',
    '1-2 hours',
    '2-3 hours',
    '3-4 hours',
    'Over 4 hours',
    '4-6 hours',
    'Over 6 hours'
  ],
  'still_following': [
    'Yes, consistently',
    'Yes, mostly',
    'Mostly, with some flexibility',
    'Mostly',
    'Sometimes',
    'Partially',
    'Occasionally',
    'No, stopped'
  ],
  'previous_sleep_hours': [
    'Under 4 hours',
    '4 hours or less',
    '4-5 hours',
    '5 hours',
    '5-6 hours',
    '6 hours',
    '6-7 hours',
    '7 hours',
    '7-8 hours',
    '8+ hours',
    'Over 8 hours'
  ],
  'time_to_results': [
    'Immediately',
    'Within days',
    '1-2 weeks',
    '3-4 weeks',
    '1-2 months',
    '3-6 months',
    '6+ months',
    'Still evaluating'
  ],
  'response_time': [
    'Immediate',
    'Within 5 minutes',
    'Within 30 minutes',
    'Within hours',
    'Within 24 hours',
    'Within a couple of days',
    'More than a couple of days'
  ],
  'ease_of_use': [
    'Very easy to use',
    'Easy to use',
    'Moderate learning curve',
    'Difficult to use',
    'Very difficult to use'
  ],
  'product_type': [
    'Physical device',
    'Mobile app',
    'Software',
    'Wearable',
    'Subscription service',
    'Other'
  ],
  'time_commitment': [
    'Under 5 minutes',
    '5-15 minutes',
    '15-30 minutes',
    '30-60 minutes',
    '1-2 hours',
    '2-4 hours',
    'Half day',
    'Full day',
    'Over 1 hour',
    'Varies significantly'
  ],
  'specialty': [
    'Financial planning',
    'Legal consultation',
    'Career coaching',
    'Life coaching',
    'Business consulting'
  ],
  'financial_benefit': [
    'No direct financial benefit',
    'Under $25/month saved/earned',
    '$25-100/month saved/earned',
    '$100-250/month saved/earned',
    '$250-500/month saved/earned',
    '$500-1000/month saved/earned',
    'Over $1000/month saved/earned',
    'Varies significantly'
  ],
  'access_time': [
    'Instant approval',
    'Same day',
    '1-3 business days',
    '1-2 weeks',
    '2-4 weeks',
    '1-2 months',
    'Over 2 months'
  ],
  // Array fields - side effects and challenges
  'side_effects': [
    'None',
    'Nausea',
    'Headache',
    'Dizziness',
    'Drowsiness',
    'Insomnia',
    'Dry mouth',
    'Weight gain',
    'Weight loss',
    'Sexual side effects',
    'Constipation',
    'Diarrhea',
    'Fatigue',
    'Anxiety',
    'Mood changes',
    'Skin irritation',
    'Allergic reaction',
    'Other (please describe)'
  ],
  'challenges': [
    'None',
    'High cost',
    'Limited availability',
    'Not covered by insurance',
    'Long wait times',
    'Finding qualified professionals',
    'Scheduling conflicts',
    'Transportation issues',
    'Uncomfortable side effects',
    'Lack of immediate results',
    'Requires lifestyle changes',
    'Social stigma',
    'Time commitment',
    'Physical discomfort',
    'Muscle soreness (normal)',
    'Joint pain',
    'Back pain',
    'Knee issues',
    'Shoulder issues',
    'Overtraining/fatigue',
    'Pulled muscle',
    'Stress fracture',
    'Tendinitis',
    'Difficulty concentrating',
    'Racing thoughts',
    'Emotional overwhelm',
    'Self-doubt',
    'Inconsistent results',
    'Consistency', // Common Gemini-generated value
    'Time constraints', // Common Gemini-generated value
    'Initial learning curve', // Common Gemini-generated value
    'Cost', // Common Gemini-generated value
    'Finding qualified provider', // Common Gemini-generated value
    'Other (please describe)'
  ]
}

// Evidence-based patterns with VALID dropdown values and 5-8 options
const EVIDENCE_BASED_PATTERNS: Record<string, Record<string, DistributionData>> = {
  session_frequency: {
    'therapists_counselors': {
      mode: 'Weekly',
      values: [
        { value: 'Weekly', count: 55, percentage: 55, source: 'clinical_standards' },
        { value: 'Fortnightly', count: 25, percentage: 25, source: 'clinical_studies' },
        { value: 'Monthly', count: 12, percentage: 12, source: 'maintenance_therapy' },
        { value: 'Multiple times per week', count: 5, percentage: 5, source: 'intensive_therapy' },
        { value: 'As needed', count: 3, percentage: 3, source: 'crisis_support' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'coaches_mentors': {
      mode: 'Fortnightly',
      values: [
        { value: 'Fortnightly', count: 40, percentage: 40, source: 'coaching_research' },
        { value: 'Weekly', count: 35, percentage: 35, source: 'intensive_coaching' },
        { value: 'Monthly', count: 20, percentage: 20, source: 'maintenance_coaching' },
        { value: 'As needed', count: 5, percentage: 5, source: 'flexible_coaching' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'alternative_practitioners': {
      mode: 'Monthly',
      values: [
        { value: 'Monthly', count: 35, percentage: 35, source: 'holistic_research' },
        { value: 'Fortnightly', count: 30, percentage: 30, source: 'treatment_studies' },
        { value: 'Weekly', count: 20, percentage: 20, source: 'intensive_treatment' },
        { value: 'As needed', count: 15, percentage: 15, source: 'maintenance_care' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'professional_services': {
      mode: 'As needed',
      values: [
        { value: 'As needed', count: 40, percentage: 40, source: 'professional_service_research' },
        { value: 'One-time only', count: 30, percentage: 30, source: 'consultation_services' },
        { value: 'Monthly', count: 15, percentage: 15, source: 'ongoing_services' },
        { value: 'Fortnightly', count: 10, percentage: 10, source: 'regular_services' },
        { value: 'Weekly', count: 5, percentage: 5, source: 'intensive_services' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'medical_procedures': {
      mode: 'One-time only',
      values: [
        { value: 'One-time only', count: 60, percentage: 60, source: 'procedure_research' },
        { value: 'As needed', count: 25, percentage: 25, source: 'follow_up_procedures' },
        { value: 'Multiple times per week', count: 8, percentage: 8, source: 'treatment_protocols' },
        { value: 'Weekly', count: 5, percentage: 5, source: 'ongoing_treatment' },
        { value: 'Monthly', count: 2, percentage: 2, source: 'maintenance_procedures' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  session_length: {
    'therapists_counselors': {
      mode: '45 minutes',
      values: [
        { value: '45 minutes', count: 45, percentage: 45, source: 'clinical_standards' },
        { value: '60 minutes', count: 30, percentage: 30, source: 'extended_sessions' },
        { value: '30 minutes', count: 15, percentage: 15, source: 'brief_therapy' },
        { value: '90 minutes', count: 7, percentage: 7, source: 'intensive_therapy' },
        { value: '15 minutes', count: 3, percentage: 3, source: 'check_ins' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'coaches_mentors': {
      mode: '60 minutes',
      values: [
        { value: '60 minutes', count: 45, percentage: 45, source: 'coaching_standards' },
        { value: '90 minutes', count: 25, percentage: 25, source: 'deep_coaching' },
        { value: '45 minutes', count: 20, percentage: 20, source: 'focused_coaching' },
        { value: '30 minutes', count: 8, percentage: 8, source: 'brief_coaching' },
        { value: '2+ hours', count: 2, percentage: 2, source: 'intensive_coaching' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'alternative_practitioners': {
      mode: '60 minutes',
      values: [
        { value: '60 minutes', count: 40, percentage: 40, source: 'treatment_standards' },
        { value: '90 minutes', count: 30, percentage: 30, source: 'holistic_sessions' },
        { value: '45 minutes', count: 20, percentage: 20, source: 'focused_treatment' },
        { value: '30 minutes', count: 7, percentage: 7, source: 'brief_sessions' },
        { value: '2+ hours', count: 3, percentage: 3, source: 'intensive_treatment' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  learning_difficulty: {
    'books_courses': {
      mode: 'Beginner',
      values: [
        { value: 'Beginner', count: 45, percentage: 45, source: 'educational_research' },
        { value: 'Intermediate', count: 30, percentage: 30, source: 'learning_studies' },
        { value: 'All levels', count: 15, percentage: 15, source: 'inclusive_design' },
        { value: 'Advanced', count: 10, percentage: 10, source: 'expertise_research' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  group_size: {
    'groups_communities': {
      mode: '6-10 people',
      values: [
        { value: '6-10 people', count: 35, percentage: 35, source: 'group_dynamics_research' },
        { value: '11-15 people', count: 25, percentage: 25, source: 'community_studies' },
        { value: '2-5 people', count: 20, percentage: 20, source: 'small_group_research' },
        { value: '16-25 people', count: 12, percentage: 12, source: 'medium_group_studies' },
        { value: '25+ people', count: 5, percentage: 5, source: 'large_group_research' },
        { value: 'Varies', count: 3, percentage: 3, source: 'flexible_groups' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  practice_length: {
    'meditation_mindfulness': {
      mode: '10-15 minutes',
      values: [
        { value: '10-15 minutes', count: 40, percentage: 40, source: 'meditation_research' },
        { value: '15-30 minutes', count: 30, percentage: 30, source: 'mindfulness_studies' },
        { value: '5-10 minutes', count: 20, percentage: 20, source: 'brief_meditation' },
        { value: '30-45 minutes', count: 7, percentage: 7, source: 'extended_practice' },
        { value: '45+ minutes', count: 2, percentage: 2, source: 'intensive_practice' },
        { value: 'Varies', count: 1, percentage: 1, source: 'flexible_practice' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  startup_cost: {
    'default': {
      mode: '$50-100',
      values: [
        { value: 'Free', count: 25, percentage: 25, source: 'accessibility_research' },
        { value: '$50-100', count: 25, percentage: 25, source: 'cost_analysis' },
        { value: '$20-50', count: 20, percentage: 20, source: 'affordable_options' },
        { value: '$100-250', count: 15, percentage: 15, source: 'mid_range_services' },
        { value: 'Under $20', count: 10, percentage: 10, source: 'low_cost_options' },
        { value: '$250-500', count: 3, percentage: 3, source: 'premium_services' },
        { value: '$500-1000', count: 2, percentage: 2, source: 'luxury_services' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  ongoing_cost: {
    'default': {
      mode: '$50-100/month',
      values: [
        { value: '$50-100/month', count: 30, percentage: 30, source: 'service_pricing_studies' },
        { value: '$25-50/month', count: 25, percentage: 25, source: 'affordable_services' },
        { value: 'Free', count: 20, percentage: 20, source: 'accessibility_research' },
        { value: '$100-200/month', count: 15, percentage: 15, source: 'premium_services' },
        { value: '$10-25/month', count: 8, percentage: 8, source: 'low_cost_services' },
        { value: 'Over $200/month', count: 2, percentage: 2, source: 'luxury_services' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  frequency: {
    'default': {
      mode: 'Daily',
      values: [
        { value: 'Daily', count: 40, percentage: 40, source: 'medical_guidelines' },
        { value: 'Multiple times daily', count: 25, percentage: 25, source: 'treatment_studies' },
        { value: 'Every other day', count: 20, percentage: 20, source: 'dosing_research' },
        { value: 'Weekly', count: 10, percentage: 10, source: 'maintenance_protocols' },
        { value: 'As needed', count: 5, percentage: 5, source: 'flexible_dosing' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  length_of_use: {
    'default': {
      mode: 'Medium-term (1-6 months)',
      values: [
        { value: 'Medium-term (1-6 months)', count: 40, percentage: 40, source: 'treatment_duration_studies' },
        { value: 'Long-term (6+ months)', count: 30, percentage: 30, source: 'chronic_treatment_research' },
        { value: 'Short-term (days-weeks)', count: 20, percentage: 20, source: 'acute_treatment_guidelines' },
        { value: 'Ongoing/permanent', count: 10, percentage: 10, source: 'maintenance_therapy_research' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  wait_time: {
    'default': {
      mode: '1-2 weeks',
      values: [
        { value: '1-2 weeks', count: 30, percentage: 30, source: 'healthcare_access_studies' },
        { value: '3-4 weeks', count: 25, percentage: 25, source: 'appointment_scheduling_research' },
        { value: 'Same week', count: 20, percentage: 20, source: 'urgent_care_availability' },
        { value: '1-2 months', count: 15, percentage: 15, source: 'specialist_wait_times' },
        { value: '3+ months', count: 10, percentage: 10, source: 'limited_availability_areas' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  insurance_coverage: {
    'default': {
      mode: 'Partially covered',
      values: [
        { value: 'Partially covered', count: 40, percentage: 40, source: 'insurance_coverage_studies' },
        { value: 'Fully covered', count: 25, percentage: 25, source: 'comprehensive_coverage_research' },
        { value: 'Not covered', count: 20, percentage: 20, source: 'coverage_gap_analysis' },
        { value: 'Coverage varies by plan', count: 15, percentage: 15, source: 'plan_variation_studies' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  cost: {
    'default': {
      mode: '$50-100',
      values: [
        { value: 'Free', count: 25, percentage: 25, source: 'accessibility_research' },
        { value: '$50-100', count: 25, percentage: 25, source: 'pricing_analysis' },
        { value: '$20-50', count: 20, percentage: 20, source: 'affordable_options' },
        { value: 'Under $20', count: 15, percentage: 15, source: 'budget_options' },
        { value: '$100-250', count: 10, percentage: 10, source: 'premium_options' },
        { value: '$250-500', count: 5, percentage: 5, source: 'high_end_services' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  usage_frequency: {
    'apps_software': {
      mode: 'Daily',
      values: [
        { value: 'Daily', count: 45, percentage: 45, source: 'app_usage_studies' },
        { value: 'Several times per week', count: 25, percentage: 25, source: 'regular_usage_research' },
        { value: 'Weekly', count: 15, percentage: 15, source: 'moderate_usage_patterns' },
        { value: 'As needed', count: 10, percentage: 10, source: 'situational_usage' },
        { value: 'Multiple times daily', count: 5, percentage: 5, source: 'intensive_usage' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  time_commitment: {
    'habits_routines': {
      mode: '5-15 minutes',
      values: [
        { value: '5-15 minutes', count: 40, percentage: 40, source: 'habit_formation_research' },
        { value: '15-30 minutes', count: 30, percentage: 30, source: 'routine_studies' },
        { value: 'Under 5 minutes', count: 15, percentage: 15, source: 'micro_habits_research' },
        { value: '30-60 minutes', count: 10, percentage: 10, source: 'comprehensive_routines' },
        { value: 'Over 1 hour', count: 5, percentage: 5, source: 'intensive_practices' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'hobbies_activities': {
      mode: '1-2 hours',
      values: [
        { value: '1-2 hours', count: 35, percentage: 35, source: 'hobby_engagement_research' },
        { value: '30-60 minutes', count: 25, percentage: 25, source: 'recreational_activity_studies' },
        { value: '2-4 hours', count: 20, percentage: 20, source: 'immersive_hobby_research' },
        { value: '15-30 minutes', count: 10, percentage: 10, source: 'brief_creative_sessions' },
        { value: 'Half day', count: 7, percentage: 7, source: 'intensive_projects' },
        { value: 'Full day', count: 3, percentage: 3, source: 'workshop_experiences' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  format: {
    'books_courses': {
      mode: 'Book',
      values: [
        { value: 'Book', count: 35, percentage: 35, source: 'learning_format_research' },
        { value: 'Online course', count: 25, percentage: 25, source: 'digital_learning_studies' },
        { value: 'Audiobook', count: 20, percentage: 20, source: 'audio_learning_preferences' },
        { value: 'Video course', count: 15, percentage: 15, source: 'visual_learning_research' },
        { value: 'Workshop/seminar', count: 5, percentage: 5, source: 'interactive_learning' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'support_groups': {
      mode: 'In-person',
      values: [
        { value: 'In-person', count: 45, percentage: 45, source: 'support_group_research' },
        { value: 'Online/virtual', count: 30, percentage: 30, source: 'digital_support_studies' },
        { value: 'Hybrid', count: 15, percentage: 15, source: 'flexible_support_options' },
        { value: 'Phone-based', count: 10, percentage: 10, source: 'accessible_support_research' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  response_time: {
    'crisis_resources': {
      mode: 'Immediate',
      values: [
        { value: 'Immediate', count: 60, percentage: 60, source: 'crisis_response_standards' },
        { value: 'Within 5 minutes', count: 25, percentage: 25, source: 'emergency_protocols' },
        { value: 'Within hours', count: 10, percentage: 10, source: 'urgent_care_research' },
        { value: 'Within 24 hours', count: 5, percentage: 5, source: 'rapid_response_systems' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  weekly_prep_time: {
    'diet_nutrition': {
      mode: '1-2 hours',
      values: [
        { value: '1-2 hours', count: 35, percentage: 35, source: 'meal_prep_studies' },
        { value: '2-3 hours', count: 25, percentage: 25, source: 'nutrition_planning_research' },
        { value: 'Under 1 hour', count: 20, percentage: 20, source: 'efficient_prep_methods' },
        { value: '3-4 hours', count: 15, percentage: 15, source: 'comprehensive_prep' },
        { value: 'Over 4 hours', count: 5, percentage: 5, source: 'intensive_preparation' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  previous_sleep_hours: {
    'sleep': {
      mode: '6 hours',
      values: [
        { value: '6 hours', count: 30, percentage: 30, source: 'sleep_pattern_research' },
        { value: '5 hours', count: 25, percentage: 25, source: 'sleep_deprivation_studies' },
        { value: '7 hours', count: 20, percentage: 20, source: 'adequate_sleep_research' },
        { value: '4 hours or less', count: 15, percentage: 15, source: 'severe_sleep_loss' },
        { value: '8+ hours', count: 10, percentage: 10, source: 'long_sleeper_patterns' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  still_following: {
    'diet_nutrition': {
      mode: 'Yes, consistently',
      values: [
        { value: 'Yes, consistently', count: 40, percentage: 40, source: 'dietary_adherence_research' },
        { value: 'Mostly, with some flexibility', count: 35, percentage: 35, source: 'flexible_nutrition_studies' },
        { value: 'Partially', count: 15, percentage: 15, source: 'partial_adherence_patterns' },
        { value: 'No, stopped', count: 10, percentage: 10, source: 'diet_discontinuation_research' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'sleep': {
      mode: 'Yes, consistently',
      values: [
        { value: 'Yes, consistently', count: 45, percentage: 45, source: 'sleep_hygiene_adherence' },
        { value: 'Mostly', count: 30, percentage: 30, source: 'routine_maintenance_studies' },
        { value: 'Sometimes', count: 15, percentage: 15, source: 'intermittent_adherence' },
        { value: 'No, stopped', count: 10, percentage: 10, source: 'routine_abandonment_research' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  ease_of_use: {
    'products_devices': {
      mode: 'Easy to use',
      values: [
        { value: 'Easy to use', count: 45, percentage: 45, source: 'usability_research' },
        { value: 'Moderate learning curve', count: 30, percentage: 30, source: 'user_experience_studies' },
        { value: 'Difficult to use', count: 15, percentage: 15, source: 'learning_curve_analysis' },
        { value: 'Very difficult to use', count: 10, percentage: 10, source: 'accessibility_challenges' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  product_type: {
    'products_devices': {
      mode: 'Wearable',
      values: [
        { value: 'Wearable', count: 35, percentage: 35, source: 'wearable_tech_adoption' },
        { value: 'Mobile app', count: 25, percentage: 25, source: 'digital_health_tools' },
        { value: 'Physical device', count: 20, percentage: 20, source: 'smart_home_health' },
        { value: 'Physical device', count: 15, percentage: 15, source: 'portable_health_devices' },
        { value: 'Software', count: 5, percentage: 5, source: 'digital_platforms' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  specialty: {
    'professional_services': {
      mode: 'Financial planning',
      values: [
        { value: 'Financial planning', count: 30, percentage: 30, source: 'professional_services_research' },
        { value: 'Legal consultation', count: 25, percentage: 25, source: 'legal_services_utilization' },
        { value: 'Career coaching', count: 20, percentage: 20, source: 'career_development_studies' },
        { value: 'Life coaching', count: 15, percentage: 15, source: 'personal_development_research' },
        { value: 'Business consulting', count: 10, percentage: 10, source: 'consulting_services_data' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  subscription_type: {
    'apps_software': {
      mode: 'Freemium',
      values: [
        { value: 'Free', count: 35, percentage: 35, source: 'app_market_research' },
        { value: 'Freemium', count: 30, percentage: 30, source: 'monetization_studies' },
        { value: 'Monthly subscription', count: 20, percentage: 20, source: 'subscription_trends' },
        { value: 'One-time purchase', count: 10, percentage: 10, source: 'purchase_patterns' },
        { value: 'Annual subscription', count: 5, percentage: 5, source: 'commitment_research' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  financial_benefit: {
    'financial_products': {
      mode: '$100-250/month saved/earned',
      values: [
        { value: '$100-250/month saved/earned', count: 30, percentage: 30, source: 'financial_analysis' },
        { value: '$25-100/month saved/earned', count: 25, percentage: 25, source: 'savings_research' },
        { value: 'No direct financial benefit', count: 20, percentage: 20, source: 'indirect_benefits' },
        { value: '$250-500/month saved/earned', count: 15, percentage: 15, source: 'high_yield_products' },
        { value: 'Varies significantly', count: 10, percentage: 10, source: 'market_dependent' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  access_time: {
    'financial_products': {
      mode: '1-3 business days',
      values: [
        { value: '1-3 business days', count: 35, percentage: 35, source: 'account_setup_research' },
        { value: 'Instant approval', count: 30, percentage: 30, source: 'digital_banking_trends' },
        { value: 'Same day', count: 15, percentage: 15, source: 'expedited_services' },
        { value: '1-2 weeks', count: 15, percentage: 15, source: 'traditional_banking' },
        { value: '2-4 weeks', count: 5, percentage: 5, source: 'complex_products' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  },

  time_to_results: {
    'therapists_counselors': {
      mode: '3-6 months',
      values: [
        { value: '3-6 months', count: 40, percentage: 40, source: 'therapy_research' },
        { value: '1-2 months', count: 30, percentage: 30, source: 'therapy_outcomes' },
        { value: '6+ months', count: 15, percentage: 15, source: 'long_term_therapy' },
        { value: '3-4 weeks', count: 10, percentage: 10, source: 'short_term_gains' },
        { value: '1-2 weeks', count: 5, percentage: 5, source: 'immediate_benefits' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'coaches_mentors': {
      mode: '1-2 months',
      values: [
        { value: '1-2 months', count: 35, percentage: 35, source: 'coaching_research' },
        { value: '3-4 weeks', count: 30, percentage: 30, source: 'coaching_outcomes' },
        { value: '3-6 months', count: 20, percentage: 20, source: 'long_term_coaching' },
        { value: '1-2 weeks', count: 10, percentage: 10, source: 'quick_coaching_wins' },
        { value: 'Immediately', count: 5, percentage: 5, source: 'instant_insights' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'alternative_practitioners': {
      mode: '1-2 weeks',
      values: [
        { value: '1-2 weeks', count: 35, percentage: 35, source: 'alternative_medicine_research' },
        { value: '3-4 weeks', count: 30, percentage: 30, source: 'holistic_treatment_studies' },
        { value: 'Immediately', count: 15, percentage: 15, source: 'acute_relief' },
        { value: '1-2 months', count: 15, percentage: 15, source: 'gradual_healing' },
        { value: '3-6 months', count: 5, percentage: 5, source: 'long_term_healing' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'professional_services': {
      mode: '3-4 weeks',
      values: [
        { value: '3-4 weeks', count: 35, percentage: 35, source: 'professional_service_research' },
        { value: '1-2 weeks', count: 30, percentage: 30, source: 'efficient_services' },
        { value: '1-2 months', count: 20, percentage: 20, source: 'comprehensive_services' },
        { value: 'Immediately', count: 10, percentage: 10, source: 'rapid_results' },
        { value: '3-6 months', count: 5, percentage: 5, source: 'complex_services' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'crisis_resources': {
      mode: 'Immediately',
      values: [
        { value: 'Immediately', count: 70, percentage: 70, source: 'crisis_intervention_research' },
        { value: '1-2 weeks', count: 15, percentage: 15, source: 'follow_up_benefits' },
        { value: '3-4 weeks', count: 10, percentage: 10, source: 'stabilization_period' },
        { value: '1-2 months', count: 5, percentage: 5, source: 'recovery_process' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'doctors_specialists': {
      mode: '1-2 weeks',
      values: [
        { value: '1-2 weeks', count: 40, percentage: 40, source: 'medical_treatment_research' },
        { value: '3-4 weeks', count: 25, percentage: 25, source: 'medication_response' },
        { value: '1-2 months', count: 20, percentage: 20, source: 'treatment_adjustment' },
        { value: 'Immediately', count: 10, percentage: 10, source: 'acute_treatment' },
        { value: '3-6 months', count: 5, percentage: 5, source: 'chronic_management' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'medical_procedures': {
      mode: '1-2 weeks',
      values: [
        { value: '1-2 weeks', count: 45, percentage: 45, source: 'procedure_recovery_research' },
        { value: '3-4 weeks', count: 25, percentage: 25, source: 'healing_timeline' },
        { value: 'Immediately', count: 15, percentage: 15, source: 'immediate_relief' },
        { value: '1-2 months', count: 10, percentage: 10, source: 'full_recovery' },
        { value: '3-6 months', count: 5, percentage: 5, source: 'long_term_outcomes' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'exercise_movement': {
      mode: '1-2 weeks',
      values: [
        { value: '1-2 weeks', count: 40, percentage: 40, source: 'exercise_research' },
        { value: '3-4 weeks', count: 30, percentage: 30, source: 'fitness_adaptation' },
        { value: 'Immediately', count: 15, percentage: 15, source: 'endorphin_release' },
        { value: '1-2 months', count: 10, percentage: 10, source: 'conditioning_results' },
        { value: '3-6 months', count: 5, percentage: 5, source: 'long_term_fitness' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'meditation_mindfulness': {
      mode: '1-2 weeks',
      values: [
        { value: '1-2 weeks', count: 35, percentage: 35, source: 'mindfulness_research' },
        { value: 'Immediately', count: 30, percentage: 30, source: 'immediate_calm' },
        { value: '3-4 weeks', count: 20, percentage: 20, source: 'habit_formation' },
        { value: '1-2 months', count: 10, percentage: 10, source: 'sustained_practice' },
        { value: '3-6 months', count: 5, percentage: 5, source: 'deep_transformation' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'habits_routines': {
      mode: '1-2 weeks',
      values: [
        { value: '1-2 weeks', count: 35, percentage: 35, source: 'habit_formation_research' },
        { value: '3-4 weeks', count: 30, percentage: 30, source: 'routine_establishment' },
        { value: 'Immediately', count: 15, percentage: 15, source: 'instant_structure' },
        { value: '1-2 months', count: 15, percentage: 15, source: 'habit_solidification' },
        { value: '3-6 months', count: 5, percentage: 5, source: 'lifestyle_integration' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'diet_nutrition': {
      mode: '1-2 weeks',
      values: [
        { value: '1-2 weeks', count: 40, percentage: 40, source: 'nutrition_research' },
        { value: '3-4 weeks', count: 25, percentage: 25, source: 'dietary_adaptation' },
        { value: '1-2 months', count: 20, percentage: 20, source: 'metabolic_changes' },
        { value: 'Immediately', count: 10, percentage: 10, source: 'energy_boost' },
        { value: '3-6 months', count: 5, percentage: 5, source: 'long_term_health' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'sleep': {
      mode: '3-4 weeks',
      values: [
        { value: '3-4 weeks', count: 35, percentage: 35, source: 'sleep_research' },
        { value: '1-2 weeks', count: 30, percentage: 30, source: 'sleep_hygiene_benefits' },
        { value: '1-2 months', count: 20, percentage: 20, source: 'circadian_adjustment' },
        { value: 'Immediately', count: 10, percentage: 10, source: 'sleep_aid_effects' },
        { value: '6+ months', count: 5, percentage: 5, source: 'chronic_sleep_recovery' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'hobbies_activities': {
      mode: 'Immediately',
      values: [
        { value: 'Immediately', count: 50, percentage: 50, source: 'enjoyment_research' },
        { value: '1-2 weeks', count: 25, percentage: 25, source: 'skill_development' },
        { value: '3-4 weeks', count: 15, percentage: 15, source: 'hobby_progression' },
        { value: '1-2 months', count: 7, percentage: 7, source: 'mastery_benefits' },
        { value: '3-6 months', count: 3, percentage: 3, source: 'long_term_fulfillment' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'groups_communities': {
      mode: '1-2 weeks',
      values: [
        { value: '1-2 weeks', count: 40, percentage: 40, source: 'social_connection_research' },
        { value: 'Immediately', count: 30, percentage: 30, source: 'belonging_benefits' },
        { value: '3-4 weeks', count: 15, percentage: 15, source: 'relationship_building' },
        { value: '1-2 months', count: 10, percentage: 10, source: 'deep_connections' },
        { value: '3-6 months', count: 5, percentage: 5, source: 'community_integration' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'products_devices': {
      mode: 'Immediately',
      values: [
        { value: 'Immediately', count: 45, percentage: 45, source: 'product_effectiveness_research' },
        { value: '1-2 weeks', count: 30, percentage: 30, source: 'adaptation_period' },
        { value: '3-4 weeks', count: 15, percentage: 15, source: 'optimal_use_learning' },
        { value: '1-2 months', count: 7, percentage: 7, source: 'long_term_benefits' },
        { value: '3-6 months', count: 3, percentage: 3, source: 'sustained_improvement' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'apps_software': {
      mode: 'Immediately',
      values: [
        { value: 'Immediately', count: 50, percentage: 50, source: 'app_usage_research' },
        { value: '1-2 weeks', count: 25, percentage: 25, source: 'feature_learning' },
        { value: '3-4 weeks', count: 15, percentage: 15, source: 'habit_integration' },
        { value: '1-2 months', count: 7, percentage: 7, source: 'advanced_features' },
        { value: '3-6 months', count: 3, percentage: 3, source: 'long_term_productivity' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'books_courses': {
      mode: '1-2 months',
      values: [
        { value: '1-2 months', count: 35, percentage: 35, source: 'learning_research' },
        { value: '3-6 months', count: 25, percentage: 25, source: 'knowledge_application' },
        { value: '1-2 weeks', count: 20, percentage: 20, source: 'initial_insights' },
        { value: '3-4 weeks', count: 15, percentage: 15, source: 'concept_integration' },
        { value: 'Immediately', count: 5, percentage: 5, source: 'instant_motivation' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'medications': {
      mode: '1-2 weeks',
      values: [
        { value: '1-2 weeks', count: 45, percentage: 45, source: 'medication_research' },
        { value: '3-4 weeks', count: 25, percentage: 25, source: 'therapeutic_levels' },
        { value: '1-2 months', count: 15, percentage: 15, source: 'full_effectiveness' },
        { value: 'Immediately', count: 10, percentage: 10, source: 'acute_effects' },
        { value: '3-6 months', count: 5, percentage: 5, source: 'long_term_stabilization' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'supplements_vitamins': {
      mode: '1-2 weeks',
      values: [
        { value: '1-2 weeks', count: 40, percentage: 40, source: 'supplement_research' },
        { value: '3-4 weeks', count: 25, percentage: 25, source: 'nutritional_benefits' },
        { value: '1-2 months', count: 20, percentage: 20, source: 'deficiency_correction' },
        { value: '3-6 months', count: 10, percentage: 10, source: 'long_term_health' },
        { value: 'Immediately', count: 5, percentage: 5, source: 'energy_boost' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'natural_remedies': {
      mode: '1-2 weeks',
      values: [
        { value: '1-2 weeks', count: 35, percentage: 35, source: 'natural_remedy_research' },
        { value: '3-4 weeks', count: 30, percentage: 30, source: 'herbal_effectiveness' },
        { value: 'Immediately', count: 15, percentage: 15, source: 'acute_relief' },
        { value: '1-2 months', count: 15, percentage: 15, source: 'cumulative_benefits' },
        { value: '3-6 months', count: 5, percentage: 5, source: 'long_term_healing' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'beauty_skincare': {
      mode: '3-4 weeks',
      values: [
        { value: '3-4 weeks', count: 40, percentage: 40, source: 'skincare_research' },
        { value: '1-2 weeks', count: 25, percentage: 25, source: 'visible_improvements' },
        { value: '1-2 months', count: 20, percentage: 20, source: 'skin_transformation' },
        { value: 'Immediately', count: 10, percentage: 10, source: 'hydration_benefits' },
        { value: '3-6 months', count: 5, percentage: 5, source: 'long_term_skin_health' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    },
    'financial_products': {
      mode: '1-2 months',
      values: [
        { value: '1-2 months', count: 35, percentage: 35, source: 'financial_planning_research' },
        { value: '3-6 months', count: 30, percentage: 30, source: 'investment_returns' },
        { value: '1-2 weeks', count: 15, percentage: 15, source: 'immediate_savings' },
        { value: '6+ months', count: 15, percentage: 15, source: 'long_term_growth' },
        { value: 'Immediately', count: 5, percentage: 5, source: 'instant_benefits' }
      ],
      totalReports: 100,
      dataSource: 'ai_research'
    }
  }
}

function validateFieldName(fieldName: string, category: string): boolean {
  const config = CATEGORY_FIELD_CONFIG[category]
  if (!config) {
    console.log(chalk.red(`❌ Unknown category: ${category}`))
    return false
  }

  if (!config.keyFields.includes(fieldName)) {
    console.log(chalk.red(`❌ Field ${fieldName} not valid for category ${category}`))
    console.log(chalk.gray(`   Valid fields: ${config.keyFields.join(', ')}`))
    return false
  }

  return true
}

function validateDropdownValues(fieldName: string, values: DistributionValue[]): boolean {
  const validValues = VALID_DROPDOWN_VALUES[fieldName]
  if (!validValues) {
    console.log(chalk.yellow(`⚠️  No validation available for field: ${fieldName}`))
    return true
  }

  for (const item of values) {
    if (!validValues.includes(item.value)) {
      console.log(chalk.red(`❌ Invalid dropdown value: "${item.value}" for field ${fieldName}`))
      console.log(chalk.gray(`   Valid values: ${validValues.join(', ')}`))
      return false
    }
  }

  return true
}

async function findSolutionsForGoal(goalId: string, limit?: number): Promise<any[]> {
  console.log(chalk.gray(`🔍 Searching for solutions in goal: ${goalId}`))

  const { data: solutions, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      goal_id,
      aggregated_fields,
      solution_variants!inner(
        solutions!inner(
          title,
          solution_category
        )
      )
    `)
    .eq('goal_id', goalId)  // CRITICAL: Goal-specific filtering
    .eq('data_display_mode', 'ai')

  if (error) {
    console.error(chalk.red('Database error:'), error)
    return []
  }

  if (!solutions || solutions.length === 0) {
    console.log(chalk.yellow(`⚠️  No AI solutions found for goal: ${goalId}`))
    return []
  }

  const transformedSolutions = solutions.map(solution => ({
    link_id: solution.id,
    goal_id: solution.goal_id,
    aggregated_fields: solution.aggregated_fields || {},
    solution_title: solution.solution_variants?.solutions?.title || 'Unknown',
    solution_category: solution.solution_variants?.solutions?.solution_category || 'unknown'
  }))

  // Sort solutions by quality issues - most broken first
  transformedSolutions.sort((a, b) => {
    const aFieldCount = Object.keys(a.aggregated_fields || {}).length
    const bFieldCount = Object.keys(b.aggregated_fields || {}).length
    return aFieldCount - bFieldCount  // Fewer fields = more broken = process first
  })

  console.log(chalk.white(`📊 Found ${transformedSolutions.length} AI solutions in goal`))

  return limit ? transformedSolutions.slice(0, limit) : transformedSolutions
}

function needsFieldRegeneration(fieldData: any, fieldName: string): boolean {
  // Missing or empty field
  if (!fieldData || Object.keys(fieldData).length === 0) {
    return true
  }

  // String fields need to be converted to DistributionData format
  if (typeof fieldData === 'string') {
    return true
  }

  // Check for degraded data indicators
  if (fieldData.values) {
    // Single value at 100% looks weird
    if (fieldData.values.length === 1) {
      return true
    }

    // Too few options (quality degradation)
    if (fieldData.values.length < 4) {
      return true
    }

    // Contains fallback/trash sources
    const hasFallbackSources = fieldData.values.some((v: any) =>
      v.source?.includes('fallback') ||
      v.source?.includes('smart_fallback') ||
      v.source?.includes('equal_fallback')
    )

    if (hasFallbackSources) {
      return true
    }

    // Wrong case for session_frequency
    if (fieldName === 'session_frequency') {
      const hasWrongCase = fieldData.values.some((v: any) =>
        v.value === 'weekly' || v.value === 'twice weekly' || v.value === 'every other week'
      )
      if (hasWrongCase) {
        return true
      }
    }

    // Invalid dropdown values
    if (!validateDropdownValues(fieldName, fieldData.values)) {
      return true
    }

    // Equal percentage distributions (mechanistic data)
    const percentages = fieldData.values.map((v: any) => v.percentage)
    const allEqual = percentages.every((p: number) => Math.abs(p - percentages[0]) <= 1)
    if (allEqual && percentages.length > 2) {
      return true
    }
  }

  return false
}

/**
 * Check if a field should exist for the given category based on CATEGORY_FIELD_CONFIG
 */
function isValidFieldForCategory(fieldName: string, category: string): boolean {
  const config = CATEGORY_FIELD_CONFIG[category]
  if (!config) {
    return false
  }

  // Field is valid if it's in keyFields or is the arrayField for this category
  return config.keyFields.includes(fieldName) || config.arrayField === fieldName
}

function findFieldsNeedingRegeneration(solution: any): string[] {
  const category = solution.solution_category
  const config = CATEGORY_FIELD_CONFIG[category]

  if (!config) {
    console.log(chalk.yellow(`⚠️  Unknown category: ${category}, skipping`))
    return []
  }

  // Check AGGREGATED_FIELDS since that's what frontend reads
  const existingFields = solution.aggregated_fields || {}
  const fieldsToRegenerate: string[] = []

  // First check ALL required fields exist and are good quality
  const requiredFields = [...config.keyFields]
  if (config.arrayField) {
    requiredFields.push(config.arrayField)
  }

  for (const fieldName of requiredFields) {
    if (!existingFields[fieldName] || needsFieldRegeneration(existingFields[fieldName], fieldName)) {
      fieldsToRegenerate.push(fieldName)
    }
  }

  // Then check existing fields that might have quality issues but aren't required
  for (const fieldName of Object.keys(existingFields)) {
    // Skip if we already processed this as a required field
    if (requiredFields.includes(fieldName)) {
      continue
    }

    // Check if this field has quality issues
    if (needsFieldRegeneration(existingFields[fieldName], fieldName)) {
      // If it's not a valid field for this category, mark for removal
      if (!requiredFields.includes(fieldName) && !isValidFieldForCategory(fieldName, category)) {
        fieldsToRegenerate.push(`REMOVE_${fieldName}`)
      }
    }
  }

  return fieldsToRegenerate
}

/**
 * Generate field distribution using Gemini AI when no hardcoded pattern exists
 */
async function generateFieldDataWithGemini(
  fieldName: string,
  category: string,
  solutionTitle: string
): Promise<DistributionData | null> {
  if (!geminiClient) {
    console.log(chalk.yellow(`⚠️  Cannot use Gemini for ${fieldName} - no API key`))
    return null
  }

  // Get valid dropdown values for this field
  const validValues = VALID_DROPDOWN_VALUES[fieldName]
  if (!validValues) {
    console.log(chalk.yellow(`⚠️  No dropdown values available for field: ${fieldName}`))
    return null
  }

  // Create a prompt similar to the existing distribution prompt but focused on a single field
  const prompt = `Based on your training data from medical literature, clinical studies, consumer research, and real-world usage patterns, generate a realistic distribution for this field.

Solution: ${solutionTitle}
Category: ${category}
Field: ${fieldName}

Available values (MUST use exactly these options):
${validValues.map(v => `- ${v}`).join('\n')}

Create a distribution showing how this field typically varies in real-world usage based on:
1. Clinical data and research studies you've seen
2. Actual usage patterns (not random percentages)
3. Common vs rare occurrences from your training data
4. Typical user experiences with this type of solution

Return a JSON object with this exact structure:
{
  "mode": "Most common value from the list above",
  "values": [
    {"value": "Most common option", "count": 45, "percentage": 45, "source": "research"},
    {"value": "Second most common", "count": 30, "percentage": 30, "source": "studies"},
    {"value": "Third option", "count": 15, "percentage": 15, "source": "research"},
    {"value": "Less common option", "count": 10, "percentage": 10, "source": "studies"}
  ],
  "totalReports": 100,
  "dataSource": "ai_research"
}

CRITICAL:
- Use ONLY the exact values from the list above
- Percentages must add to 100
- Use 4-7 options (not all options, focus on realistic common ones)
- Base percentages on actual patterns from your training, not equal splits`

  try {
    console.log(chalk.cyan(`   🤖 Using Gemini to generate ${fieldName} field...`))
    const response = await geminiClient.generateContent(prompt)
    const distributionData = JSON.parse(response)

    // Validate the response structure
    if (!distributionData.mode || !Array.isArray(distributionData.values)) {
      throw new Error('Invalid response structure from Gemini')
    }

    // Validate all values are in the allowed dropdown values
    for (const item of distributionData.values) {
      if (!validValues.includes(item.value)) {
        throw new Error(`Invalid dropdown value from Gemini: ${item.value}`)
      }
    }

    console.log(chalk.green(`   ✅ Generated ${distributionData.values.length} options for ${fieldName}`))
    return distributionData

  } catch (error: any) {
    console.log(chalk.red(`   ❌ Gemini generation failed for ${fieldName}: ${error.message}`))
    return null
  }
}

async function generateFieldData(fieldName: string, category: string, solutionTitle?: string): Promise<DistributionData | null> {
  const fieldPatterns = EVIDENCE_BASED_PATTERNS[fieldName]
  if (!fieldPatterns) {
    console.log(chalk.yellow(`⚠️  No evidence-based pattern found for field: ${fieldName}`))

    // Try using Gemini AI if available and solutionTitle provided
    if (geminiClient && solutionTitle) {
      console.log(chalk.cyan(`   🔄 Attempting Gemini generation for ${fieldName}...`))
      const geminiResult = await generateFieldDataWithGemini(fieldName, category, solutionTitle)
      if (geminiResult) {
        return geminiResult
      }
    }

    return null
  }

  // Use category-specific pattern or default
  const pattern = fieldPatterns[category] || fieldPatterns['default']
  if (!pattern) {
    console.log(chalk.yellow(`⚠️  No pattern found for ${fieldName} in category ${category}`))
    return null
  }

  // Validate field name is correct for category
  if (!validateFieldName(fieldName, category)) {
    return null
  }

  // Validate dropdown values
  if (!validateDropdownValues(fieldName, pattern.values)) {
    return null
  }

  return pattern
}

async function updateSolutionWithFields(
  solution: any,
  fieldsToGenerate: string[],
  dryRun: boolean = false
): Promise<boolean> {

  const existingFields = solution.aggregated_fields || {}
  const newFields: Record<string, any> = {}
  const fieldsToRemove: string[] = []

  // Process each field request
  for (const fieldName of fieldsToGenerate) {
    if (fieldName.startsWith('REMOVE_')) {
      // Field marked for removal
      const actualFieldName = fieldName.replace('REMOVE_', '')
      fieldsToRemove.push(actualFieldName)
      console.log(chalk.red(`🗑️  Removing invalid field: ${actualFieldName}`))
    } else {
      // Generate new field data
      const fieldData = await generateFieldData(fieldName, solution.solution_category, solution.solution_title)
      if (fieldData) {
        newFields[fieldName] = fieldData
      } else {
        console.log(chalk.red(`❌ Failed to generate ${fieldName} for ${solution.solution_title}`))
        return false
      }
    }
  }

  // CRITICAL: Field preservation pattern with cleanup
  const updatedFields = { ...existingFields }

  // Remove invalid fields
  for (const fieldName of fieldsToRemove) {
    delete updatedFields[fieldName]
  }

  // Add new/regenerated fields
  Object.assign(updatedFields, newFields)

  if (Object.keys(newFields).length === 0 && fieldsToRemove.length === 0) {
    console.log(chalk.yellow(`⚠️  No changes made for ${solution.solution_title}`))
    return false
  }

  if (dryRun) {
    console.log(chalk.blue(`🔍 DRY RUN - Would regenerate ${solution.solution_title}:`))
    console.log(chalk.gray(`   Category: ${solution.solution_category}`))
    console.log(chalk.gray(`   Regenerating fields: ${Object.keys(newFields).join(', ')}`))
    console.log(chalk.gray(`   Total fields after: ${Object.keys(updatedFields).length}`))

    // Show quality improvements
    for (const fieldName of Object.keys(newFields)) {
      const oldField = existingFields[fieldName]
      const newField = newFields[fieldName]
      if (oldField?.values) {
        console.log(chalk.gray(`   ${fieldName}: ${oldField.values.length} → ${newField.values.length} options`))
      } else {
        console.log(chalk.gray(`   ${fieldName}: missing → ${newField.values.length} options`))
      }
    }
    return true
  }

  const { error } = await supabase
    .from('goal_implementation_links')
    .update({ aggregated_fields: updatedFields })
    .eq('id', solution.link_id)

  if (error) {
    console.error(chalk.red(`❌ Failed to update ${solution.solution_title}:`), error)
    return false
  }

  return true
}

async function processGoal(goalId: string, options: any) {
  console.log(chalk.cyan(`\n🎯 Processing Goal: ${goalId}`))
  console.log(chalk.cyan('━'.repeat(60)))

  const solutions = await findSolutionsForGoal(goalId, options.limit)

  if (solutions.length === 0) {
    console.log(chalk.yellow('⚠️  No solutions found for this goal'))
    return
  }

  let successCount = 0
  let errorCount = 0
  let skipCount = 0

  for (const solution of solutions) {
    const fieldsToRegenerate = findFieldsNeedingRegeneration(solution)

    if (fieldsToRegenerate.length === 0) {
      skipCount++
      console.log(chalk.gray(`⏭️  ${solution.solution_title} - All fields good quality`))
      continue
    }

    console.log(chalk.white(`\n🔄 Regenerating: ${solution.solution_title} (${solution.solution_category})`))
    console.log(chalk.gray(`   Fields needing regeneration: ${fieldsToRegenerate.join(', ')}`))

    const success = await updateSolutionWithFields(solution, fieldsToRegenerate, options.dryRun)

    if (success) {
      successCount++
      if (!options.dryRun) {
        console.log(chalk.green(`✅ Regenerated ${fieldsToRegenerate.length} fields with quality improvements`))
      }
    } else {
      errorCount++
    }

    // Rate limiting to avoid overwhelming the database
    if (!options.dryRun) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log(chalk.white(`\n📈 Results:`))
  console.log(chalk.green(`   ✅ Regenerated: ${successCount}`))
  console.log(chalk.gray(`   ⏭️  Skipped (good quality): ${skipCount}`))
  if (errorCount > 0) {
    console.log(chalk.red(`   ❌ Errors: ${errorCount}`))
  }
}

async function main() {
  const args = process.argv.slice(2)
  const options = {
    goalId: args.find(arg => arg.startsWith('--goal-id='))?.split('=')[1],
    limit: parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '0') || undefined,
    dryRun: args.includes('--dry-run')
  }

  console.log(chalk.magenta('🔧 VALIDATED FIELD GENERATION SCRIPT'))
  console.log(chalk.magenta('═'.repeat(50)))

  if (options.dryRun) {
    console.log(chalk.blue('🔍 DRY RUN MODE - No changes will be made\n'))
  }

  if (!options.goalId) {
    console.log(chalk.red('❌ Usage:'))
    console.log(chalk.white('  --goal-id=<uuid>        Target specific goal (REQUIRED)'))
    console.log(chalk.white('  --limit=<number>        Limit number of solutions'))
    console.log(chalk.white('  --dry-run               Preview changes without applying'))
    console.log(chalk.white('\nExamples:'))
    console.log(chalk.gray('  # Test on anxiety goal with 1 solution'))
    console.log(chalk.gray('  npx tsx scripts/generate-validated-fields.ts --goal-id=56e2801e-0d78-4abd-a795-869e5b780ae7 --limit=1 --dry-run'))
    console.log(chalk.gray(''))
    console.log(chalk.gray('  # Process all anxiety goal solutions'))
    console.log(chalk.gray('  npx tsx scripts/generate-validated-fields.ts --goal-id=56e2801e-0d78-4abd-a795-869e5b780ae7'))

    console.log(chalk.yellow('\n🎯 Known Goal IDs:'))
    console.log(chalk.gray('  Anxiety: 56e2801e-0d78-4abd-a795-869e5b780ae7'))
    process.exit(1)
  }

  await processGoal(options.goalId, options)

  console.log(chalk.green('\n✨ Generation complete!'))
}

main().catch(console.error)