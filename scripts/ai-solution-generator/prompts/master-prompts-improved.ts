/**
 * Improved Prompts for Gemini - With Explicit Field Generation
 * 
 * These prompts provide clear examples and explicit instructions
 * for generating ALL required fields with realistic values
 */

import { CATEGORY_FIELDS } from '../config/category-fields'
import { getDropdownOptionsForField } from '../config/dropdown-options'

/**
 * Build detailed field requirements with examples
 */
export function buildDetailedFieldRequirements(category: string): string {
  const config = CATEGORY_FIELDS[category]
  if (!config) return ''
  
  // Category-specific examples to guide Gemini
  const fieldExamples: Record<string, Record<string, string>> = {
    'medications': {
      'time_to_results': '"3-4 weeks" or "1-2 months" or "Within days"',
      'frequency': '"once daily" or "twice daily" or "as needed"',
      'length_of_use': '"6-12 months" or "Over 2 years" or "Still using"',
      'cost': '"$10-25/month" or "$50-100/month" or "Free"'
    },
    'therapists_counselors': {
      'cost': '"$100-150" or "$150-200" or "$75-100"',
      'time_to_results': '"3-4 weeks" or "1-2 months" or "3-6 months"',
      'session_frequency': '"Weekly" or "Bi-weekly" or "Monthly"',
      'format': '"In-person" or "Video/Online" or "Phone"'
    },
    'meditation_mindfulness': {
      'startup_cost': '"Free/No startup cost" or "Under $50" or "$50-$99.99"',
      'ongoing_cost': '"Free/No ongoing cost" or "$10-$24.99/month" or "$25-$49.99/month"',
      'time_to_results': '"Within days" or "1-2 weeks" or "3-4 weeks"',
      'frequency': '"once daily" or "twice daily" or "as needed"'
    },
    'exercise_movement': {
      'startup_cost': '"Under $50" or "$100-$249.99" or "Free/No startup cost"',
      'ongoing_cost': '"$25-$49.99/month" or "Free/No ongoing cost" or "$50-$99.99/month"',
      'time_to_results': '"1-2 weeks" or "3-4 weeks" or "1-2 months"',
      'frequency': '"three times daily" or "twice weekly" or "once daily"'
    },
    'apps_software': {
      'cost': '"Free to start, ongoing marketing costs" or "Under $10/month" or "$10-25/month"',
      'time_to_results': '"Within days" or "1-2 weeks" or "3-4 weeks"',
      'usage_frequency': '"Daily" or "Multiple times daily" or "Few times a week"',
      'subscription_type': '"Free version" or "Monthly subscription" or "One-time purchase"'
    },
    'books_courses': {
      'cost': '"Under $20" or "$20-50" or "$50-100"',
      'time_to_results': '"1-2 weeks" or "3-4 weeks" or "1-2 months"',
      'format': '"Physical book" or "E-book" or "Online course" or "Video series"',
      'time_to_complete': '"Under 1 hour" or "1-5 hours" or "5-10 hours" or "10-20 hours"'
    },
    'products_devices': {
      'cost': '"Under $50" or "$50-100" or "$100-250"',
      'time_to_results': '"Immediately" or "Within days" or "1-2 weeks"',
      'ease_of_use': '"Very easy to use" or "Some learning curve" or "Easy after initial setup"',
      'product_type': '"Physical device" or "Wearable" or "Home equipment"'
    },
    'support_groups': {
      'cost': '"Free" or "$5-10 per meeting" or "$20-30/month"',
      'time_to_results': '"1-2 weeks" or "3-4 weeks" or "1-2 months"',
      'meeting_frequency': '"Weekly" or "Bi-weekly" or "Monthly"',
      'format': '"In-person" or "Online (video)" or "Hybrid (both)"'
    },
    'habits_routines': {
      'startup_cost': '"Free/No startup cost" or "Under $50" or "$50-$99.99"',
      'ongoing_cost': '"Free/No ongoing cost" or "Under $10/month" or "$10-$24.99/month"',
      'time_to_results': '"Within days" or "1-2 weeks" or "3-4 weeks"',
      'time_commitment': '"Under 5 minutes" or "5-15 minutes" or "15-30 minutes"'
    },
    'financial_products': {
      'cost_type': '"Free to use" or "Transaction/usage fees" or "Account maintenance fees"',
      'financial_benefit': '"$100-250/month saved/earned" or "Varies significantly" or "$25-100/month saved/earned"',
      'time_to_results': '"1-2 months" or "3-6 months" or "6+ months"',
      'access_time': '"Instant approval" or "1-3 business days" or "1-2 weeks"'
    }
  }
  
  // Build the requirements string
  let requirements = `\nCRITICAL: You MUST include ALL these fields in the "fields" object for category "${category}":\n\n`
  
  // Add each required field with explicit examples
  for (const field of config.required) {
    const examples = fieldExamples[category]?.[field] || '"appropriate value for this field"'
    requirements += `"${field}": ${examples}\n`
  }
  
  // Add array field if present
  if (config.arrayField) {
    const arrayExamples = {
      'side_effects': '["Nausea", "Headache", "Fatigue"] or ["Dry mouth", "Dizziness"] or ["None"]',
      'challenges': '["Time commitment", "Finding motivation", "Cost"] or ["Technical issues", "Learning curve"]',
      'barriers': '["Cost without insurance", "Finding providers", "Location"] or ["Wait times", "Scheduling"]',
      'issues': '["Quality concerns", "Durability", "Customer service"] or ["Setup difficulty", "Compatibility"]'
    }
    requirements += `"${config.arrayField}": ${arrayExamples[config.arrayField] || '["Item 1", "Item 2", "Item 3"]'}\n`
  }
  
  requirements += '\nEVERY field listed above MUST be present in your response!\n'
  
  return requirements
}

/**
 * New improved solution prompt with explicit examples
 */
export const IMPROVED_SOLUTION_PROMPT = `Generate {{LIMIT}} evidence-based solutions for this goal:

Goal: {{GOAL_TITLE}}
Description: {{GOAL_DESCRIPTION}}
Arena: {{ARENA}}

CRITICAL FIELD REQUIREMENTS - YOU MUST USE THESE EXACT FIELD NAMES:
{{FIELD_REQUIREMENTS}}

Return a JSON array of solutions. Here are COMPLETE examples showing the EXACT fields for each category:

Example 1 - therapists_counselors category:
{
  "title": "Cognitive Behavioral Therapy",
  "description": "Evidence-based therapy focusing on changing thought patterns",
  "category": "therapists_counselors",
  "effectiveness": 4.5,
  "effectiveness_rationale": "Strong evidence from multiple RCTs",
  "fields": {
    "cost": "$100-150",
    "time_to_results": "3-4 weeks",
    "session_frequency": "Weekly",
    "format": "In-person",
    "challenges": ["Finding the right therapist", "Time commitment", "Cost without insurance"]
  },
  "variants": []
}

Example 2 - habits_routines category:
{
  "title": "Morning Routine",
  "description": "Structured morning habits for productivity",
  "category": "habits_routines",
  "effectiveness": 4.2,
  "effectiveness_rationale": "Consistent positive user reports",
  "fields": {
    "startup_cost": "Free/No startup cost",
    "ongoing_cost": "Free/No ongoing cost",
    "time_to_results": "1-2 weeks",
    "time_commitment": "15-30 minutes",
    "challenges": ["Consistency", "Early wake times"]
  },
  "variants": []
}

Example 3 - books_courses category:
{
  "title": "The 7 Habits of Highly Effective People",
  "description": "Classic self-help book on personal effectiveness",
  "category": "books_courses",
  "effectiveness": 4.3,
  "effectiveness_rationale": "Widely recommended, practical framework",
  "fields": {
    "cost": "$20-50",
    "time_to_results": "3-4 weeks",
    "format": "Physical book",
    "time_to_complete": "10-20 hours",
    "challenges": ["Applying concepts", "Finding time to read"]
  },
  "variants": []
}

CRITICAL RULES:
1. The "fields" object MUST contain EXACTLY the fields shown for that category above
2. Do NOT mix fields from different categories
3. Do NOT leave "fields" empty
4. Use the EXACT field names (e.g., "time_commitment" not "frequency" for habits_routines)
5. effectiveness: number between 3.0 and 5.0
6. category must be from this exact list: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products
7. For medications/supplements_vitamins/natural_remedies/beauty_skincare, include variants

Return ONLY valid JSON array. No markdown, no explanations.`

/**
 * Get improved solution generation prompt
 */
export function getImprovedSolutionPrompt(
  goalTitle: string,
  goalDescription: string,
  arena: string,
  category: string,
  limit: number
): string {
  // Build field requirements for multiple categories to show Gemini the variety
  // Include more categories to ensure Gemini understands the pattern
  const categoriesToShow = [
    'medications',
    'therapists_counselors', 
    'meditation_mindfulness',
    'habits_routines',
    'books_courses',
    'exercise_movement',
    'financial_products',
    'apps_software'
  ]
  
  let fieldRequirements = ''
  for (const cat of categoriesToShow) {
    fieldRequirements += buildDetailedFieldRequirements(cat) + '\n\n'
  }
  
  fieldRequirements += 'IMPORTANT: Each solution MUST use the EXACT field names for its category as shown above!'
  
  return IMPROVED_SOLUTION_PROMPT
    .replace('{{GOAL_TITLE}}', goalTitle)
    .replace('{{GOAL_DESCRIPTION}}', goalDescription || '')
    .replace('{{ARENA}}', arena)
    .replace('{{LIMIT}}', limit.toString())
    .replace('{{FIELD_REQUIREMENTS}}', fieldRequirements)
}

/**
 * Improved distribution prompt
 */
export const IMPROVED_DISTRIBUTION_PROMPT = `Generate realistic prevalence distributions for this solution.

Solution: {{SOLUTION_TITLE}}
Goal: {{GOAL_TITLE}}
Category: {{CATEGORY}}
Current field values: {{FIELDS}}

For EACH of these fields, create a distribution showing how values vary in real-world usage:
{{REQUIRED_FIELDS}}

IMPORTANT: For array fields (like side_effects, challenges), include the EXACT items from the solution's field values in your distribution.

Example of correct format:
{
  "time_to_results": [
    {"name": "3-4 weeks", "percentage": 40},
    {"name": "1-2 weeks", "percentage": 25},
    {"name": "1-2 months", "percentage": 20},
    {"name": "Within days", "percentage": 10},
    {"name": "3-6 months", "percentage": 5}
  ],
  "side_effects": [
    {"name": "Nausea", "percentage": 35},
    {"name": "Headache", "percentage": 25},
    {"name": "Fatigue", "percentage": 20},
    {"name": "None", "percentage": 15},
    {"name": "Dizziness", "percentage": 5}
  ]
}

Rules:
1. Each field's percentages MUST sum to exactly 100
2. Use realistic distributions (not all equal percentages)
3. Include the actual values from the solution's fields
4. 3-5 items per field

Return ONLY valid JSON. No markdown, no explanations.`

/**
 * Get improved distribution prompt
 */
export function getImprovedDistributionPrompt(
  solutionTitle: string,
  goalTitle: string,
  fields: any,
  category: string
): string {
  const config = CATEGORY_FIELDS[category]
  if (!config) return ''
  
  const requiredFields = [...config.required]
  if (config.arrayField) {
    requiredFields.push(config.arrayField)
  }
  
  return IMPROVED_DISTRIBUTION_PROMPT
    .replace('{{SOLUTION_TITLE}}', solutionTitle)
    .replace('{{GOAL_TITLE}}', goalTitle)
    .replace('{{CATEGORY}}', category)
    .replace('{{FIELDS}}', JSON.stringify(fields, null, 2))
    .replace('{{REQUIRED_FIELDS}}', requiredFields.join(', '))
}