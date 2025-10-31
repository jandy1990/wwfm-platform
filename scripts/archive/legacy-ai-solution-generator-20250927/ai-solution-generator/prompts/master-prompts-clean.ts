/**
 * Cleaner, more precise prompts for Gemini
 * Designed to reduce JSON parsing errors
 */

import { CATEGORY_FIELDS } from '../config/category-fields'
import { getDropdownOptionsForField } from '../config/dropdown-options'

/**
 * Build field requirements without JSON comments
 */
export function buildFieldRequirementsSimple(category: string): string {
  const config = CATEGORY_FIELDS[category]
  if (!config) return ''
  
  let requirements = `Required fields for "${category}":\n`
  
  for (const field of config.required) {
    requirements += `- ${field}\n`
  }
  
  if (config.arrayField) {
    requirements += `- ${config.arrayField} (array with 2-4 items)\n`
  }
  
  return requirements
}

/**
 * Simplified solution generation prompt
 */
export const CLEAN_SOLUTION_PROMPT = `Generate {{LIMIT}} evidence-based solutions for this goal:

Goal: {{GOAL_TITLE}}
Description: {{GOAL_DESCRIPTION}}
Arena: {{ARENA}}

CRITICAL: Every solution MUST be a SPECIFIC product/app/book/method that can be googled.
Include brand names, app names, authors, or protocol names. NO generic categories.
Wrong: "meditation" → Right: "Headspace anxiety pack"
Wrong: "therapy" → Right: "BetterHelp online CBT"

{{FIELD_REQUIREMENTS}}

Return a valid JSON array. Each solution must have this exact structure:
{
  "title": "Specific product/app/method name (must be googleable)",
  "description": "Brief description mentioning the brand/author",
  "category": "category_from_list",
  "effectiveness": 4.2,
  "effectiveness_rationale": "Evidence basis",
  "fields": {},
  "variants": []
}

Rules:
- effectiveness: number between 3.0 and 5.0
- category must be one of: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products
- variants only for: medications, supplements_vitamins, natural_remedies, beauty_skincare
- fields must contain all required fields for the category
- Array fields should contain 2-4 string items

Return ONLY valid JSON. No markdown, no comments, no explanations.`

/**
 * Simplified distribution prompt
 */
export const CLEAN_DISTRIBUTION_PROMPT = `Generate prevalence distributions for this solution:

Solution: {{SOLUTION_TITLE}}
Goal: {{GOAL_TITLE}}
Category: {{CATEGORY}}

Create distributions for these fields:
{{REQUIRED_FIELDS}}

Return a valid JSON object where each field maps to an array of distributions:
{
  "field_name": [
    {"name": "option1", "percentage": 40},
    {"name": "option2", "percentage": 35},
    {"name": "option3", "percentage": 25}
  ]
}

Rules:
- Each field's percentages must sum to 100
- Include 3-5 distribution items per field
- Use realistic percentages based on real-world data

Return ONLY valid JSON. No markdown, no comments, no explanations.`

/**
 * Get clean solution generation prompt
 */
export function getCleanSolutionPrompt(
  goalTitle: string,
  goalDescription: string,
  arena: string,
  category: string,
  limit: number
): string {
  const fieldRequirements = buildFieldRequirementsSimple(category)
  
  return CLEAN_SOLUTION_PROMPT
    .replace('{{GOAL_TITLE}}', goalTitle)
    .replace('{{GOAL_DESCRIPTION}}', goalDescription || '')
    .replace('{{ARENA}}', arena)
    .replace('{{LIMIT}}', limit.toString())
    .replace('{{FIELD_REQUIREMENTS}}', fieldRequirements)
}

/**
 * Get clean distribution prompt
 */
export function getCleanDistributionPrompt(
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
  
  return CLEAN_DISTRIBUTION_PROMPT
    .replace('{{SOLUTION_TITLE}}', solutionTitle)
    .replace('{{GOAL_TITLE}}', goalTitle)
    .replace('{{CATEGORY}}', category)
    .replace('{{REQUIRED_FIELDS}}', requiredFields.join('\n'))
}