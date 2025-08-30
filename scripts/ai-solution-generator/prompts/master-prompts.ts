/**
 * Master Prompts for AI Solution Generation
 * 
 * These prompts are designed to extract the most authentic,
 * training-data-aligned solutions from Claude AI.
 * 
 * Note: Natural values are mapped to dropdown options programmatically
 */

import { DROPDOWN_OPTIONS, CATEGORY_COST_MAPPING, getDropdownOptionsForField } from '../config/dropdown-options'
import { CATEGORY_FIELDS } from '../config/category-fields'

/**
 * Build the field requirements section with exact dropdown options
 */
export function buildFieldRequirementsForCategory(category: string): string {
  const config = CATEGORY_FIELDS[category]
  if (!config) return ''
  
  let requirements = `\nFor category "${category}", include these fields:\n\n`
  
  // Add each required field with guidance for natural values
  for (const field of config.required) {
    const options = getDropdownOptionsForField(category, field)
    requirements += `- ${field}: `
    
    if (field.includes('cost')) {
      requirements += `Realistic cost value (e.g., "$15/month", "$100 one-time", "free")\n`
    } else if (field.includes('time') || field === 'duration') {
      requirements += `Time duration (e.g., "2 weeks", "immediately", "3-4 months")\n`
    } else if (field.includes('frequency')) {
      requirements += `How often (e.g., "twice daily", "3 times per week", "as needed")\n`
    } else {
      requirements += `Appropriate value for this field\n`
    }
  }
  
  // Add array field if present
  if (config.arrayField) {
    requirements += `- ${config.arrayField}: Array with 2-4 items. Common options include: `
    
    // Provide common options for array fields
    const arrayOptions = {
      'side_effects': ['Nausea', 'Headache', 'Dizziness', 'Fatigue', 'Dry mouth', 'Insomnia', 'Weight changes', 'None'],
      'challenges': ['Time constraints', 'Cost', 'Motivation', 'Consistency', 'Technical issues', 'None'],
      'barriers': ['Finding the right provider', 'Cost without insurance', 'Time commitment', 'Location/access', 'None'],
      'issues': ['Quality concerns', 'Durability', 'Customer service', 'Setup difficulty', 'None']
    }
    
    requirements += `${JSON.stringify(arrayOptions[config.arrayField] || ['Item1', 'Item2', 'None'])}\n`
  }
  
  requirements += '\n'
  return requirements
}

/**
 * Build complete field requirements for all categories
 */
export function buildAllFieldRequirements(): string {
  let allRequirements = `
GUIDELINES FOR FIELD VALUES:
============================
1. Provide realistic, natural values based on your training data
2. For costs: Use actual prices (e.g., "$18/month", "$150", "free")
3. For time: Use natural durations (e.g., "2 weeks", "immediately", "about a month")
4. For frequency: Use common expressions (e.g., "twice a day", "every morning", "3 times per week")
5. For array fields: Include 2-4 realistic, commonly reported items

Field Requirements by Category:
================================
`
  
  // Add requirements for each category
  const categories = Object.keys(CATEGORY_FIELDS)
  for (const category of categories) {
    allRequirements += buildFieldRequirementsForCategory(category)
  }
  
  return allRequirements
}

export const MASTER_PROMPT = `
Based on your training data across medical literature, clinical studies, consumer research, and general knowledge, provide evidence-based solutions for the following goal:

Goal: "{{GOAL_TITLE}}"
Description: "{{GOAL_DESCRIPTION}}"
Life Area: {{ARENA}}
Category Context: {{CATEGORY}}

Instructions:
1. Draw from your complete training data - medical and non-medical sources
2. Include solutions you know to be effective based on research, studies, and evidence
3. Rank by real-world effectiveness based on your training knowledge
4. Include both conventional and alternative approaches where evidence exists
5. Be specific about effectiveness ratings based on actual data you've seen

{{FIELD_REQUIREMENTS}}

VALUE GENERATION NOTES:
=======================
• Generate natural, realistic values as you would normally describe them
• Use specific prices, not ranges (e.g., "$18/month" not "$10-25/month")
• Use natural time expressions (e.g., "2 weeks" not "1-2 weeks")
• Use common frequency terms (e.g., "twice a day" or "every morning")
• The system will automatically map these to appropriate dropdown options

Return EXACTLY {{LIMIT}} solutions as a JSON array with this structure:
[
  {
    "title": "Specific solution name",
    "description": "Brief, accurate description",
    "category": "exact_category_from_list",
    "effectiveness": 4.5,
    "effectiveness_rationale": "Based on [specific evidence/studies/data]",
    "variants": [only for medications/supplements_vitamins/natural_remedies/beauty_skincare],
    "fields": {
      // MUST include EXACTLY the fields specified above for this category
      // MUST use EXACT values from the dropdown options
      // Array fields should have 2-4 realistic items
    }
  }
]

Categories (use exact strings):
medications, supplements_vitamins, natural_remedies, beauty_skincare,
therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners,
professional_services, medical_procedures, crisis_resources,
meditation_mindfulness, exercise_movement, habits_routines,
diet_nutrition, sleep, products_devices, books_courses,
apps_software, groups_communities, support_groups,
hobbies_activities, financial_products

For effectiveness ratings:
- 4.5-5.0: Strong evidence, widely recommended, high success rates
- 4.0-4.4: Good evidence, commonly effective, reliable results
- 3.5-3.9: Moderate evidence, works for many, mixed results
- 3.0-3.4: Some evidence, works for some, variable results
- Below 3.0: Don't include

For dosage categories (medications/supplements_vitamins/natural_remedies/beauty_skincare), include variants:
"variants": [
  {"amount": 25, "unit": "mg", "form": "tablet"},
  {"amount": 50, "unit": "mg", "form": "tablet"},
  {"amount": 100, "unit": "mg", "form": "capsule"}
]

Ensure diversity across categories. Include what your training data indicates actually works.

Return ONLY the JSON array, no markdown formatting, no explanations.`

export const DISTRIBUTION_PROMPT = `
For the solution "{{SOLUTION_TITLE}}" used for "{{GOAL_TITLE}}", provide realistic prevalence distributions based on your training data about real-world usage patterns, clinical data, and user experiences.

Solution fields: {{FIELDS}}
Category: {{CATEGORY}}

Create distributions that reflect:
1. How these actually distribute in practice (from studies, trials, user reports)
2. Common vs rare occurrences
3. Typical vs atypical experiences

You MUST provide distributions for EXACTLY these fields:
{{REQUIRED_FIELDS}}

{{DROPDOWN_OPTIONS_FOR_FIELDS}}

CRITICAL RULES:
===============
1. For dropdown fields, you MUST use ONLY the exact values from the provided options
2. For array fields (side_effects, challenges, barriers, issues):
   - You MUST include the exact values from the solution fields
   - Array field items must appear in the distribution with their exact names
   - Add additional realistic items to reach 100% total
3. Each distribution must have percentages that sum to exactly 100%
4. Use realistic distributions based on your training data (not uniform)

Return JSON with this exact structure:
{
  "field_name": [
    {"name": "exact_dropdown_value", "percentage": 40},
    {"name": "another_exact_value", "percentage": 35},
    {"name": "third_exact_value", "percentage": 25}
  ]
}

Example for time_to_results field:
{
  "time_to_results": [
    {"name": "3-4 weeks", "percentage": 40},
    {"name": "1-2 weeks", "percentage": 25},
    {"name": "1-2 months", "percentage": 20},
    {"name": "Within days", "percentage": 10},
    {"name": "3-6 months", "percentage": 5}
  ]
}

Example for side_effects field with ["Nausea", "Headache"]:
{
  "side_effects": [
    {"name": "Nausea", "percentage": 31},
    {"name": "Headache", "percentage": 24},
    {"name": "Dizziness", "percentage": 20},
    {"name": "Fatigue", "percentage": 15},
    {"name": "None", "percentage": 10}
  ]
}

Return ONLY the JSON object, no markdown, no explanations.`

/**
 * Get the complete prompt for solution generation
 */
export function getSolutionGenerationPrompt(
  goalTitle: string,
  goalDescription: string,
  arena: string,
  category: string,
  limit: number
): string {
  const fieldRequirements = buildAllFieldRequirements()
  
  return MASTER_PROMPT
    .replace('{{GOAL_TITLE}}', goalTitle)
    .replace('{{GOAL_DESCRIPTION}}', goalDescription || '')
    .replace('{{ARENA}}', arena)
    .replace('{{CATEGORY}}', category)
    .replace('{{LIMIT}}', limit.toString())
    .replace('{{FIELD_REQUIREMENTS}}', fieldRequirements)
}

/**
 * Get the distribution prompt with dropdown options
 */
export function getDistributionPrompt(
  solutionTitle: string,
  goalTitle: string,
  fields: any,
  category: string
): string {
  const config = CATEGORY_FIELDS[category]
  if (!config) return DISTRIBUTION_PROMPT
  
  // Build list of required fields
  const requiredFields = [...config.required]
  if (config.arrayField) {
    requiredFields.push(config.arrayField)
  }
  
  // Build dropdown options section
  let dropdownSection = '\nDropdown Options for Fields:\n============================\n'
  for (const field of requiredFields) {
    const options = getDropdownOptionsForField(category, field)
    if (options && options.length > 0) {
      dropdownSection += `${field}: You MUST use ONLY these exact values:\n`
      dropdownSection += JSON.stringify(options, null, 2) + '\n\n'
    }
  }
  
  return DISTRIBUTION_PROMPT
    .replace('{{SOLUTION_TITLE}}', solutionTitle)
    .replace('{{GOAL_TITLE}}', goalTitle)
    .replace('{{FIELDS}}', JSON.stringify(fields))
    .replace('{{CATEGORY}}', category)
    .replace('{{REQUIRED_FIELDS}}', requiredFields.join(', '))
    .replace('{{DROPDOWN_OPTIONS_FOR_FIELDS}}', dropdownSection)
}

/**
 * Validate that a solution uses correct dropdown values
 */
export function validateDropdownValues(category: string, fields: Record<string, any>): string[] {
  const errors: string[] = []
  
  for (const [fieldName, value] of Object.entries(fields)) {
    // Skip array fields for this validation
    if (Array.isArray(value)) continue
    
    const allowedOptions = getDropdownOptionsForField(category, fieldName)
    if (allowedOptions && !allowedOptions.includes(value)) {
      errors.push(`Field "${fieldName}" has invalid value "${value}". Must be one of: ${allowedOptions.join(', ')}`)
    }
  }
  
  return errors
}
